$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot "deploy"
$outputPath = Join-Path $outputDirectory "moment-cafe-edgeone-source.zip"

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
if (Test-Path -LiteralPath $outputPath) {
    throw "Deployment archive already exists: $outputPath"
}

$paths = @(
    (Join-Path $projectRoot "index.html"),
    (Join-Path $projectRoot "package.json"),
    (Join-Path $projectRoot "package-lock.json"),
    (Join-Path $projectRoot "edgeone.json"),
    (Join-Path $projectRoot "src"),
    (Join-Path $projectRoot "public"),
    (Join-Path $projectRoot "edge-functions"),
    (Join-Path $projectRoot "shared")
)

Compress-Archive -LiteralPath $paths -DestinationPath $outputPath -CompressionLevel Optimal
Get-Item -LiteralPath $outputPath | Select-Object FullName, Length, LastWriteTime
