# One-time scaffolder for TrueTier. Run:  powershell -ExecutionPolicy Bypass -File D:\METAVERSE\scaffold.ps1
# Safe to re-run: it never overwrites files that already exist.

$Root = "D:\METAVERSE"

$dirs = @(
  "contracts", "data", "scripts", "docs",
  "backend\app\engine", "backend\tests",
  "frontend\src\components", "frontend\src\state", "frontend\src\styles"
)
foreach ($d in $dirs) { New-Item -ItemType Directory -Force -Path (Join-Path $Root $d) | Out-Null }

function Write-IfMissing([string]$RelPath, [string]$Content) {
  $full = Join-Path $Root $RelPath
  if (-not (Test-Path $full)) {
    [System.IO.File]::WriteAllText($full, $Content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "created $RelPath"
  } else {
    Write-Host "kept    $RelPath"
  }
}

Write-IfMissing "backend\requirements.txt" @"
fastapi
uvicorn[standard]
pydantic>=2
networkx
numpy
pandas
rapidfuzz
jinja2
pytest
httpx
anthropic
"@

Write-IfMissing ".env.example" @"
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-5-5
"@

Write-IfMissing ".gitignore" @"
backend/.venv/
node_modules/
__pycache__/
*.pyc
.env
dist/
*.mp4
*.mov
"@

Write-IfMissing "docs\STATUS.md" @"
## Now (who is doing what)

## Done (with commit hash)

## Requests (cross-lane asks)

## Decisions / assumptions

## Known bugs
"@

Write-IfMissing "README.md" "# TrueTier`n`nSupplier independence intelligence. See plan.md and instructions.md.`n"

Write-Host "`nDone. Put plan.md, instructions.md, tasks.ps1 in $Root, then run: .\tasks.ps1 setup (after backend/frontend code exists)."
