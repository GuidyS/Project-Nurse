<?php

function normalizeYearKeyFromYlo(?string $yloId): ?string
{
    if (!$yloId || !preg_match('/YLO(\d+)/i', $yloId, $matches)) {
        return null;
    }

    return 'YEAR_' . $matches[1];
}

function derivePlosFromYlo(array $mappingData, ?string $yloId): array
{
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
