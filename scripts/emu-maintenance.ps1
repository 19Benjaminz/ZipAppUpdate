param(
  [string]$Package="com.zipcodexpress1",
  [string]$Device="emulator-5554",
  [int]$TrimMB=500,
  [switch]$ListUserPkgs,
  [switch]$Wipe,
  [switch]$VerboseOutput
)

$ErrorActionPreference = 'Stop'

function Info($msg){ Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Warn($msg){ Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Err($msg){ Write-Host "[ERROR] $msg" -ForegroundColor Red }

$adb = Join-Path $env:LOCALAPPDATA "Android\Sdk\platform-tools\adb.exe"
if(-not (Test-Path $adb)){ Err "adb not found at $adb"; exit 1 }

Info "Using adb: $adb"

# Verify device
$devices = & $adb devices | Select-String "device$" | ForEach-Object { ($_ -split "`t")[0] }
if($devices.Count -eq 0){ Err "No connected/emulator devices found."; exit 1 }
if(-not ($devices -contains $Device)){
  Warn "Specified device $Device not in list: $devices. Using first: $($devices[0])"
  $Device = $devices[0]
}
Info "Target device: $Device"

# Show initial /data usage
Info "Initial /data usage:"; & $adb -s $Device shell df -h /data | Out-Host

# Uninstall target package if installed
$pkgList = & $adb -s $Device shell pm list packages $Package | Select-String $Package
if($pkgList){
  Info "Uninstalling $Package ..."
  & $adb -s $Device uninstall $Package | Out-Host
}else{ Warn "$Package not installed; skipping uninstall" }

# Trim caches
Info "Trimming caches to ${TrimMB}M ..."
& $adb -s $Device shell pm trim-caches "${TrimMB}M" | Out-Host

# Optionally list user packages
if($ListUserPkgs){
  Info "Listing third-party packages (user-installed):"
  & $adb -s $Device shell pm list packages -3 | Out-Host
}

# Optionally wipe emulator (factory reset)
if($Wipe){
  Warn "Wipe requested. This will factory reset AVD data (app data lost)."
  $emulatorExe = Join-Path $env:LOCALAPPDATA "Android\Sdk\emulator\emulator.exe"
  if(-not (Test-Path $emulatorExe)){ Err "emulator.exe not found at $emulatorExe"; exit 1 }
  Info "Attempting cold boot + wipe. Ensure emulator is CLOSED before proceeding."
  & $emulatorExe -avd $Device -wipe-data
  Info "Wipe command issued. You may need to relaunch and rerun build after boot completes."
}

# Post actions usage
Info "Post-action /data usage:"; & $adb -s $Device shell df -h /data | Out-Host

Info "Done. If /data still >90% full consider recreating the AVD with larger storage."
