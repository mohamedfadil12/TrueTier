# TrueTier task runner (Windows / PowerShell 5.1+). Run from D:\METAVERSE
# Usage:  .\tasks.ps1 setup | data | api | web | demo | test
param(
  [Parameter(Position = 0)]
  [ValidateSet("setup", "data", "api", "web", "demo", "test")]
  [string]$Task = "demo"
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Py   = Join-Path $Root "backend\.venv\Scripts\python.exe"

switch ($Task) {
  "setup" {
    Push-Location (Join-Path $Root "backend")
    if (-not (Test-Path ".venv")) {
      try { python -m venv .venv } catch { py -3 -m venv .venv }
    }
    & $Py -m pip install --upgrade pip
    & $Py -m pip install -r requirements.txt
    Pop-Location
    Push-Location (Join-Path $Root "frontend")
    npm.cmd install
    Pop-Location
  }
  "data" {
    & $Py (Join-Path $Root "scripts\generate_data.py")
  }
  "api" {
    Push-Location (Join-Path $Root "backend")
    & $Py -m uvicorn app.main:app --reload --port 8000
    Pop-Location
  }
  "web" {
    Push-Location (Join-Path $Root "frontend")
    npm.cmd run dev -- --port 5173
    Pop-Location
  }
  "demo" {
    # API in a second window, frontend in this one
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "`"$PSCommandPath`"", "api"
    Start-Sleep -Seconds 3
    & $PSCommandPath web
  }
  "test" {
    Push-Location (Join-Path $Root "backend")
    & $Py -m pytest -q
    Pop-Location
  }
}
