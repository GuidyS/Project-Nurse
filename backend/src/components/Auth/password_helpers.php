<?php
/**
 * Shared password hashing, policy, and simple rate limiting for Auth endpoints.
 */

const AUTH_PASSWORD_ALGO = PASSWORD_ARGON2ID;

/** @return array{memory_cost:int,time_cost:int,threads:int} */
function authPasswordOptions(): array
{
    return [
        'memory_cost' => 65536, // 64 MB
        'time_cost'   => 4,
        'threads'     => 2,
    ];
}

function hashAuthPassword(string $password): string
{
    $hash = password_hash($password, AUTH_PASSWORD_ALGO, authPasswordOptions());
    if ($hash === false) {
        throw new RuntimeException('ไม่สามารถเข้ารหัสรหัสผ่านได้');
    }
    return $hash;
}

function authPasswordNeedsRehash(string $hash): bool
{
    return password_needs_rehash($hash, AUTH_PASSWORD_ALGO, authPasswordOptions());
}

/**
 * Stronger password policy:
 * - min 12 chars
 * - at least 1 letter and 1 digit
 * - not in common weak list / not all same char
 *
 * @return string|null error message or null if ok
 */
function validatePasswordPolicy(string $password): ?string
{
    if (strlen($password) < 12) {
        return 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร';
    }

    if (!preg_match('/[A-Za-zก-๙]/u', $password) || !preg_match('/[0-9]/', $password)) {
        return 'รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข';
    }

    if (preg_match('/^(.)\1+$/u', $password)) {
        return 'รหัสผ่านต้องไม่เป็นตัวอักษรซ้ำทั้งหมด';
    }

    $normalized = strtolower($password);
    $weak = [
        '123456789012',
        '1234567890123',
        'password1234',
        'password12345',
        'qwerty123456',
        'abcdefghijk1',
        '111111111111',
        '000000000000',
        'admin1234567',
        'welcome12345',
        'nurse1234567',
    ];
    if (in_array($normalized, $weak, true)) {
        return 'รหัสผ่านนี้เดาง่ายเกินไป กรุณาตั้งรหัสที่ซับซ้อนกว่านี้';
    }

    return null;
}

function authClientIp(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

function authRateLimitDir(): string
{
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'nurse_auth_rate_limit';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

function authRateLimitPath(string $bucket): string
{
    return authRateLimitDir() . DIRECTORY_SEPARATOR . hash('sha256', $bucket) . '.json';
}

/**
 * @return array{allowed:bool,retry_after:int,remaining:int}
 */
function checkAuthRateLimit(string $action, string $identity, int $maxAttempts = 5, int $windowSeconds = 900): array
{
    $key = $action . '|' . authClientIp() . '|' . strtolower(trim($identity));
    $path = authRateLimitPath($key);
    $now = time();
    $data = ['attempts' => [], 'blocked_until' => 0];

    if (is_file($path)) {
        $raw = @file_get_contents($path);
        $decoded = $raw ? json_decode($raw, true) : null;
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    if (!empty($data['blocked_until']) && (int)$data['blocked_until'] > $now) {
        return [
            'allowed' => false,
            'retry_after' => (int)$data['blocked_until'] - $now,
            'remaining' => 0,
        ];
    }

    $attempts = array_values(array_filter(
        $data['attempts'] ?? [],
        static fn($ts) => is_numeric($ts) && ((int)$ts > ($now - $windowSeconds))
    ));

    if (count($attempts) >= $maxAttempts) {
        $data['blocked_until'] = $now + $windowSeconds;
        $data['attempts'] = $attempts;
        @file_put_contents($path, json_encode($data), LOCK_EX);
        return [
            'allowed' => false,
            'retry_after' => $windowSeconds,
            'remaining' => 0,
        ];
    }

    return [
        'allowed' => true,
        'retry_after' => 0,
        'remaining' => max(0, $maxAttempts - count($attempts)),
    ];
}

function recordAuthRateLimitFailure(string $action, string $identity, int $windowSeconds = 900): void
{
    $key = $action . '|' . authClientIp() . '|' . strtolower(trim($identity));
    $path = authRateLimitPath($key);
    $now = time();
    $data = ['attempts' => [], 'blocked_until' => 0];

    if (is_file($path)) {
        $raw = @file_get_contents($path);
        $decoded = $raw ? json_decode($raw, true) : null;
        if (is_array($decoded)) {
            $data = array_merge($data, $decoded);
        }
    }

    $attempts = array_values(array_filter(
        $data['attempts'] ?? [],
        static fn($ts) => is_numeric($ts) && ((int)$ts > ($now - $windowSeconds))
    ));
    $attempts[] = $now;
    $data['attempts'] = $attempts;
    @file_put_contents($path, json_encode($data), LOCK_EX);
}

function clearAuthRateLimit(string $action, string $identity): void
{
    $key = $action . '|' . authClientIp() . '|' . strtolower(trim($identity));
    $path = authRateLimitPath($key);
    if (is_file($path)) {
        @unlink($path);
    }
}

function configureAuthSessionCookie(): void
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'secure' => $secure,
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    } else {
        session_set_cookie_params(0, '/; samesite=Lax', '', $secure, true);
    }
}
