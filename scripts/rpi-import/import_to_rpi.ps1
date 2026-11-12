param(
    [string]$PiHost = "192.168.88.200",
    [string]$PiUser = "pi",
    [string]$PiPassword,
    [string]$CsvDir = "C:\Programovani\darky\csv",
    [string]$ProjectDir = "C:\Programovani\darky\dareklist-app",
    [string]$RemoteDir = "/tmp/dareklist-import"
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param(
        [ValidateSet("INFO", "DEBUG", "ERROR")]
        [string]$Level,
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [$Level] $Message"
}

function Invoke-Plink {
    param([string]$Command)

    & "C:\Program Files\PuTTY\plink.exe" -batch -pw $PiPassword "$PiUser@$PiHost" $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Remote command failed: $Command"
    }
}

function Invoke-Pscp {
    param(
        [string]$Source,
        [string]$Target
    )

    & "C:\Program Files\PuTTY\pscp.exe" -batch -pw $PiPassword $Source $Target
    if ($LASTEXITCODE -ne 0) {
        throw "File transfer failed: $Source -> $Target"
    }
}

if ([string]::IsNullOrWhiteSpace($PiPassword)) {
    throw "PiPassword is required."
}

$requiredFiles = @(
    "auth.identities.csv",
    "auth.users.csv",
    "public.gifts.csv",
    "public.gift_contribution_messages.csv",
    "public.group_gift_suggestions.csv",
    "public.profiles.csv",
    "public.wishlists.csv",
    "public.wishlist_shares.csv",
    "public.wishlist_views.csv"
)

$missingFiles = $requiredFiles | Where-Object {
    -not (Test-Path (Join-Path $CsvDir $_))
}

if ($missingFiles.Count -gt 0) {
    throw "Missing CSV files: $($missingFiles -join ', ')"
}

$localSql = Join-Path $ProjectDir "scripts\rpi-import\import_from_csv.sql"
$localVerifySql = Join-Path $ProjectDir "scripts\rpi-import\verify_import.sql"

if (-not (Test-Path $localSql) -or -not (Test-Path $localVerifySql)) {
    throw "Migration SQL files were not found in scripts\rpi-import."
}

$backupTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$remoteBackupPath = "/opt/supabase/backups/pre-import-$backupTimestamp.dump"

Write-Log -Level INFO -Message "Preparing remote import directory"
Invoke-Plink "mkdir -p $RemoteDir && rm -f $RemoteDir/*"

Write-Log -Level INFO -Message "Uploading SQL helpers"
Invoke-Pscp $localSql "${PiUser}@${PiHost}:$RemoteDir/import_from_csv.sql"
Invoke-Pscp $localVerifySql "${PiUser}@${PiHost}:$RemoteDir/verify_import.sql"

Write-Log -Level INFO -Message "Uploading CSV exports"
foreach ($file in $requiredFiles) {
    $source = Join-Path $CsvDir $file
    Invoke-Pscp $source "${PiUser}@${PiHost}:$RemoteDir/$file"
}

Write-Log -Level INFO -Message "Creating pre-import backup on Raspberry Pi"
Invoke-Plink "docker exec supabase-db pg_dump -U postgres -d postgres -Fc > $remoteBackupPath"

Write-Log -Level INFO -Message "Copying import assets into the Postgres container"
Invoke-Plink "docker exec supabase-db mkdir -p /tmp/dareklist-import && docker cp $RemoteDir/. supabase-db:/tmp/dareklist-import/"

Write-Log -Level INFO -Message "Running CSV import inside Supabase Postgres"
Invoke-Plink "docker exec supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/dareklist-import/import_from_csv.sql"

Write-Log -Level INFO -Message "Verifying imported row counts"
Invoke-Plink "docker exec supabase-db psql -U postgres -d postgres -f /tmp/dareklist-import/verify_import.sql"

Write-Log -Level INFO -Message "Migration finished. Backup stored at $remoteBackupPath"
