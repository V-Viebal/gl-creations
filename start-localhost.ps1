param([switch]$OpenBrowser)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$node = 'C:\Users\Le Tan Minh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$port = 4173

function Test-LocalPort {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync('127.0.0.1', $port)
    if ($task.Wait(500) -and $client.Connected) { return $true }
    return $false
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (-not (Test-LocalPort)) {
  $serverPath = Join-Path $root 'server.mjs'
  $stdout = Join-Path $root 'server.stdout.log'
  $stderr = Join-Path $root 'server.stderr.log'
  Start-Process -FilePath $node `
    -ArgumentList @("`"$serverPath`"") `
    -WorkingDirectory $root `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr

  for ($i = 0; $i -lt 40; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-LocalPort) { break }
  }
}

$url = "http://localhost:$port/"
if (-not (Test-LocalPort)) {
  throw "Homeclick local host could not start. See $root\server.stderr.log"
}
if ($OpenBrowser) { Start-Process $url }
Write-Output $url
