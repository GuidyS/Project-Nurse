param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot 'output')
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$frontendRoot = Join-Path $projectRoot 'frontend'
$backendRoot = Join-Path $projectRoot 'backend\src'
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
$projectPrefix = $projectRoot.TrimEnd('\') + '\'
if (-not $resolvedOutput.StartsWith($projectPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw 'OutputDirectory must be inside the project.'
}
if (-not (Test-Path (Join-Path $frontendRoot 'node_modules\vite'))) {
    throw 'Install frontend dependencies first: cd frontend; npm ci'
}
if (-not (Test-Path (Join-Path $backendRoot 'vendor\autoload.php'))) {
    throw 'Missing backend Composer vendor directory.'
}

$previousApiBaseUrl = [Environment]::GetEnvironmentVariable('VITE_API_BASE_URL', 'Process')
try {
    $env:VITE_API_BASE_URL = '/api'
    Push-Location $frontendRoot
    try {
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
    } finally { Pop-Location }
} finally {
    [Environment]::SetEnvironmentVariable('VITE_API_BASE_URL', $previousApiBaseUrl, 'Process')
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$packageRoot = Join-Path $resolvedOutput "nurse-mis-hostinger-$stamp"
$webRoot = Join-Path $packageRoot 'public_html'
$apiRoot = Join-Path $webRoot 'api'
New-Item -ItemType Directory -Path $apiRoot -Force | Out-Null
Copy-Item -Path (Join-Path $frontendRoot 'dist\*') -Destination $webRoot -Recurse -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'public_html.htaccess') -Destination (Join-Path $webRoot '.htaccess')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'api.htaccess') -Destination (Join-Path $apiRoot '.htaccess')
Copy-Item -LiteralPath (Join-Path $backendRoot 'index.php') -Destination $apiRoot
Copy-Item -LiteralPath (Join-Path $backendRoot 'vendor') -Destination $apiRoot -Recurse

foreach ($directory in @('components', 'config', 'cron')) {
    $source = Join-Path $backendRoot $directory
    Get-ChildItem -LiteralPath $source -Recurse -File -Filter '*.php' | ForEach-Object {
        if ($_.Name -eq 'config.local.php') { return }
        $relative = $_.FullName.Substring($backendRoot.Length).TrimStart('\')
        $target = Join-Path $apiRoot $relative
        New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $target
    }
}

$uploadRoot = Join-Path $apiRoot 'uploads'
New-Item -ItemType Directory -Path $uploadRoot -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'uploads.htaccess') -Destination (Join-Path $uploadRoot '.htaccess')
foreach ($directory in @('imports', 'user-documents', 'portfolio', 'project_docs', 'faculty-documents', 'student-documents', 'vaccine_evidence', 'health_records', 'faculty-extras', 'student-purge-archive')) {
    New-Item -ItemType Directory -Path (Join-Path $uploadRoot $directory) -Force | Out-Null
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'config.local.example.php') -Destination (Join-Path $packageRoot 'config.local.example.php')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'README.md') -Destination (Join-Path $packageRoot 'README.md')

$zipPath = Join-Path $resolvedOutput "nurse-mis-hostinger-webroot-$stamp.zip"
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$archive = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
    Get-ChildItem -LiteralPath $webRoot -Recurse -File -Force | ForEach-Object {
        $entryName = $_.FullName.Substring($webRoot.Length + 1).Replace('\', '/')
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
            $archive, $_.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal
        ) | Out-Null
    }
} finally { $archive.Dispose() }
Write-Host "Created: $zipPath"
