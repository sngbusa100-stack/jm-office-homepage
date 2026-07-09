$ErrorActionPreference = 'Stop'

$workspace = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$target = Join-Path $workspace 'dist'
$targetParent = (Resolve-Path -LiteralPath (Split-Path $target -Parent)).Path

if (
  -not $target.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase) -or
  $targetParent -ne $workspace
) {
  throw '빌드 출력 폴더가 작업 폴더 밖을 가리킵니다.'
}

if (Test-Path -LiteralPath $target) {
  Remove-Item -LiteralPath $target -Recurse -Force
}
