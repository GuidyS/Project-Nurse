<?php

require_once __DIR__ . '/ylo_subplo_defaults.php';

// คืน matrix จาก mapping_json ถ้ามี ไม่มีก็ใช้ค่าตั้งต้นจากไฟล์หลักสูตร (น้องในทีม pull ไปใช้ได้เลยไม่ต้อง seed DB)
function getYloPloMatrix(array $mappingData): array
{
    if (!empty($mappingData['ylo_plo_matrix']) && is_array($mappingData['ylo_plo_matrix'])) {
        return $mappingData['ylo_plo_matrix'];
    }
    return yloSubPloDefaults()['ylo_plo_matrix'] ?? [];
}

function normalizeYearKeyFromYlo(?string $yloId): ?string
{
    if (!$yloId || !preg_match('/YLO(\d+)/i', $yloId, $matches)) {
        return null;
    }

    return 'YEAR_' . $matches[1];
}

function derivePlosFromYlo(array $mappingData, ?string $yloId): array
{
    // ใช้ ylo_plo_matrix (แก้ไขได้จากหน้า "แก้ไข YLO", ไม่มีใน DB ก็ใช้ค่าตั้งต้น) เป็นแหล่งหลัก
    $matrix = getYloPloMatrix($mappingData);
    if ($yloId && !empty($matrix[$yloId]) && is_array($matrix[$yloId])) {
        $plos = [];
        foreach ($matrix[$yloId] as $ploId => $info) {
            if (!empty($info['active'])) {
                $plos[] = (string)$ploId;
            }
        }
        return $plos;
    }

    $yearKey = normalizeYearKeyFromYlo($yloId);
    if (!$yearKey) {
        return [];
    }

    $plos = [];
    foreach (($mappingData['plos'] ?? []) as $plo) {
        $ploId = $plo['plo_id'] ?? $plo['id'] ?? null;
        if (!$ploId) {
            continue;
        }

        $descriptions = $plo['ylo_descriptions'] ?? [];
        if (!is_array($descriptions)) {
            continue;
        }

        $yearVariants = [
            $yearKey,
            strtolower($yearKey),
            str_replace('YEAR_', 'year_', $yearKey),
        ];

        foreach ($yearVariants as $variant) {
            if (array_key_exists($variant, $descriptions)) {
                $plos[] = (string)$ploId;
                break;
            }
        }
    }

    return array_values(array_unique($plos));
}

function buildCloMappedPlos(array $mappingData, ?string $yloId, ?array $explicitPlos = null): array
{
    $derived = derivePlosFromYlo($mappingData, $yloId);
    $explicit = [];

    if (is_array($explicitPlos)) {
        foreach ($explicitPlos as $plo) {
            if (is_string($plo) && $plo !== '') {
                $explicit[] = $plo;
            }
        }
    }

    return array_values(array_unique(array_merge($derived, $explicit)));
}

function getPloCatalog(array $mappingData): array
{
    $plos = [];
    foreach (($mappingData['plos'] ?? []) as $plo) {
        $ploId = $plo['plo_id'] ?? $plo['id'] ?? null;
        if (!$ploId) {
            continue;
        }

        $plos[] = [
            'id' => (string)$ploId,
            'name' => $plo['plo_name'] ?? $plo['name'] ?? (string)$ploId,
            'ylo_descriptions' => is_array($plo['ylo_descriptions'] ?? null) ? $plo['ylo_descriptions'] : [],
        ];
    }

    return $plos;
}

function getSubPloCatalog(array $mappingData): array
{
    $source = (!empty($mappingData['sub_plo_catalog']) && is_array($mappingData['sub_plo_catalog']))
        ? $mappingData['sub_plo_catalog']
        : (yloSubPloDefaults()['sub_plo_catalog'] ?? []);

    $catalog = [];
    foreach ($source as $sub) {
        if (empty($sub['code']) || empty($sub['plo'])) {
            continue;
        }
        $catalog[] = [
            'code' => (string)$sub['code'],
            'plo' => (string)$sub['plo'],
            'description' => (string)($sub['description'] ?? ''),
        ];
    }
    return $catalog;
}

// กรอง sub_plos ให้เหลือเฉพาะตัวที่ PLO แม่อยู่ในชุด PLO ที่ derive จาก YLO (กติกา: บล็อก Sub นอก YLO)
function filterSubPlosByAllowedPlos(array $mappingData, ?array $subPlos, array $allowedPlos): array
{
    if (!is_array($subPlos)) {
        return [];
    }
    $parentByCode = [];
    foreach (getSubPloCatalog($mappingData) as $sub) {
        $parentByCode[$sub['code']] = $sub['plo'];
    }
    $allowed = array_flip($allowedPlos);
    $result = [];
    foreach ($subPlos as $code) {
        $code = (string)$code;
        if (isset($parentByCode[$code]) && isset($allowed[$parentByCode[$code]])) {
            $result[] = $code;
        }
    }
    return array_values(array_unique($result));
}

function mergeCourseMappedPlos(array $subjectData): array
{
    $mappedPlos = [];

    if (!empty($subjectData['course_plos']) && is_array($subjectData['course_plos'])) {
        $mappedPlos = array_merge($mappedPlos, $subjectData['course_plos']);
    }

    if (!empty($subjectData['clos']) && is_array($subjectData['clos'])) {
        foreach ($subjectData['clos'] as $clo) {
            if (!empty($clo['mapped_plos']) && is_array($clo['mapped_plos'])) {
                $mappedPlos = array_merge($mappedPlos, $clo['mapped_plos']);
            }
        }
    }

    return array_values(array_unique(array_filter($mappedPlos, 'is_string')));
}

function syncSubjectClosWithCoursePlos(array &$subjectData, array $coursePlos): void
{
    $allowed = array_values(array_unique(array_filter($coursePlos, 'is_string')));
    if (empty($subjectData['clos']) || !is_array($subjectData['clos'])) {
        return;
    }

    foreach ($subjectData['clos'] as $index => $clo) {
        $current = $clo['mapped_plos'] ?? [];
        if (!is_array($current)) {
            $current = [];
        }

        $subjectData['clos'][$index]['mapped_plos'] = array_values(array_intersect($current, $allowed));
    }
}

?>
