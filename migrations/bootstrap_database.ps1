Param(
    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$Database = "secretaria_digital",
    [string]$Username = "postgres",
    [string]$Password = ""
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$runAll = Join-Path $scriptDir "000_run_all.sql"

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw "psql não encontrado no PATH. Instale o PostgreSQL client antes de rodar este script."
}

if (-not (Test-Path $runAll)) {
    throw "Arquivo 000_run_all.sql não encontrado em $scriptDir"
}

if ($Password -and $Password.Length -gt 0) {
    $env:PGPASSWORD = $Password
}

try {
    & psql -h $Host -p $Port -U $Username -d $Database -v ON_ERROR_STOP=1 -f $runAll
}
finally {
    if ($env:PGPASSWORD) {
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
}
