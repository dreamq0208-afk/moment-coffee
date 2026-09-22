param([string]$Python = "python")

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$fontOutput = Join-Path $projectRoot "public\fonts"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("moment-cafe-fonts-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $fontOutput, $tempRoot | Out-Null

try {
    $fontSources = @(
        @{ Name = "moment-sans"; Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf" },
        @{ Name = "moment-serif"; Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/notoserifsc/NotoSerifSC%5Bwght%5D.ttf" },
        @{ Name = "moment-hand"; Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf" },
        @{ Name = "moment-mono"; Url = "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf" }
    )

    $textPath = Join-Path $tempRoot "glyphs-all.txt"
    $sourceFiles = @((Get-Item -LiteralPath (Join-Path $projectRoot "index.html"))) +
        @(Get-ChildItem -LiteralPath (Join-Path $projectRoot "src") -Recurse -File |
            Where-Object { $_.Extension -in @(".js", ".css") })
    $text = ($sourceFiles | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }) -join "`n"
    [System.IO.File]::WriteAllText($textPath, $text, [System.Text.UTF8Encoding]::new($false))

    $serifTextPath = Join-Path $tempRoot "glyphs-serif.txt"
    $handTextPath = Join-Path $tempRoot "glyphs-hand.txt"
    $monoTextPath = Join-Path $tempRoot "glyphs-mono.txt"
    [System.IO.File]::WriteAllText($serifTextPath, "此刻咖啡馆此刻的你适合哪一杯美式燕麦拿铁海盐焦糖摩卡馥芮白橙低因冷萃生椰有人陪清醒一下慢慢来咸咸的抱好事多一圈歇口气有盼头心跳放小小得意", [System.Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText($handTextPath, (Get-Content -LiteralPath (Join-Path $projectRoot "src\copy.js") -Raw), [System.Text.UTF8Encoding]::new($false))
    [System.IO.File]::WriteAllText($monoTextPath, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,:;!?/+-×■□年月日周电量此刻加谢谢光临明天见单号", [System.Text.UTF8Encoding]::new($false))

    foreach ($font in $fontSources) {
        $inputPath = Join-Path $tempRoot ($font.Name + ".ttf")
        $outputPath = Join-Path $fontOutput ($font.Name + ".woff2")
        Invoke-WebRequest -Uri $font.Url -OutFile $inputPath
        $fontTextPath = if ($font.Name -eq "moment-serif") { $serifTextPath } elseif ($font.Name -eq "moment-hand") { $handTextPath } elseif ($font.Name -eq "moment-mono") { $monoTextPath } else { $textPath }
        & $Python -m fontTools.subset $inputPath "--text-file=$fontTextPath" "--output-file=$outputPath" --flavor=woff2 --layout-features="*" --no-hinting --desubroutinize
        if ($LASTEXITCODE -ne 0) { throw "Font subsetting failed: $($font.Name)" }
    }

    Get-ChildItem -LiteralPath $fontOutput -File | Select-Object Name, Length
}
finally {
    if (Test-Path -LiteralPath $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}
