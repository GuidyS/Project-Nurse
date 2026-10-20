<?php
declare(strict_types=1);

// Copy to public_html/api/config/config.local.php on the server.
// Replace every placeholder. Never add the real file to the ZIP or repository.
return [
    'database' => [
        'host' => 'localhost',
        'port' => '3306',
        'name' => 'HOSTINGER_DATABASE_NAME',
        'user' => 'HOSTINGER_DATABASE_USER',
        'password' => 'HOSTINGER_DATABASE_PASSWORD',
    ],
];
