param(
  [string]$OutputRoot = (Join-Path $PSScriptRoot '..\..\..\outputs')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputRoot = [System.IO.Path]::GetFullPath($OutputRoot)
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version

function Assert-OutputPath([string]$path) {
  $full = [System.IO.Path]::GetFullPath($path)
  $prefix = $outputRoot.TrimEnd('\') + '\'
  if (-not $full.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing output outside the intended directory: $full"
  }
  return $full
}

function Reset-OutputDirectory([string]$path) {
  $full = Assert-OutputPath $path
  if (Test-Path -LiteralPath $full) {
    Remove-Item -LiteralPath $full -Recurse -Force
  }
  New-Item -ItemType Directory -Path $full | Out-Null
  return $full
}

function Copy-DirectoryContents([string]$source, [string]$destination) {
  Get-ChildItem -LiteralPath $source -Force | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Recurse -Force
  }
}

function Get-EntriesFromDirectory([string]$directory, [string[]]$excludeNames = @()) {
  $root = [System.IO.Path]::GetFullPath($directory).TrimEnd('\')
  return @(Get-ChildItem -LiteralPath $root -File -Recurse -Force |
    Where-Object { $excludeNames -notcontains $_.Name } |
    ForEach-Object {
      [pscustomobject]@{
        Path = $_.FullName
        Name = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
      }
    })
}

function New-NormalizedZip([string]$zipPath, [object[]]$entries) {
  $fullZip = Assert-OutputPath $zipPath
  if (Test-Path -LiteralPath $fullZip) {
    Remove-Item -LiteralPath $fullZip -Force
  }
  $archive = [System.IO.Compression.ZipFile]::Open($fullZip, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    foreach ($entry in $entries) {
      $name = ([string]$entry.Name).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        [string]$entry.Path,
        $name,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  } finally {
    $archive.Dispose()
  }
}

New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

$webFolder = Reset-OutputDirectory (Join-Path $outputRoot "graphics-gravity-web-$version")
Copy-DirectoryContents (Join-Path $projectRoot 'dist') $webFolder
$cpanelFolder = Reset-OutputDirectory (Join-Path $outputRoot "graphics-gravity-cpanel-FLAT-files-$version")
Copy-DirectoryContents (Join-Path $projectRoot 'dist-cpanel') $cpanelFolder

$webZip = Join-Path $outputRoot "graphics-gravity-web-$version.zip"
$cpanelZip = Join-Path $outputRoot "graphics-gravity-cpanel-FLAT-$version.zip"
$cpanelAliasZip = Join-Path $outputRoot "graphics-gravity-web-cpanel-$version.zip"
$itchHtmlZip = Join-Path $outputRoot "graphics-gravity-itch-html5-$version.zip"
$itchWindowsZip = Join-Path $outputRoot "graphics-gravity-itch-windows-$version.zip"
$sourceZip = Join-Path $outputRoot "graphics-gravity-source-$version.zip"

New-NormalizedZip $webZip (Get-EntriesFromDirectory (Join-Path $projectRoot 'dist'))
$cpanelEntries = Get-EntriesFromDirectory (Join-Path $projectRoot 'dist-cpanel')
New-NormalizedZip $cpanelZip $cpanelEntries
Copy-Item -LiteralPath $cpanelZip -Destination $cpanelAliasZip -Force
New-NormalizedZip $itchHtmlZip (Get-EntriesFromDirectory (Join-Path $projectRoot 'dist-cpanel') @('.htaccess'))

$portableSource = Join-Path $projectRoot "release\windows\graphics-gravity-portable-$version-x64.exe"
New-NormalizedZip $itchWindowsZip @(
  [pscustomobject]@{ Path = $portableSource; Name = 'Graphics Gravity.exe' }
)

$sourceEntries = @()
foreach ($fileName in @('.gitignore', 'app.manifest.json', 'index.html', 'package.json', 'README.md', 'vite.config.js')) {
  $sourceEntries += [pscustomobject]@{ Path = Join-Path $projectRoot $fileName; Name = $fileName }
}
foreach ($directoryName in @('assets', 'electron', 'metadata', 'public', 'scripts', 'src')) {
  $directoryPath = Join-Path $projectRoot $directoryName
  $sourceEntries += Get-EntriesFromDirectory $directoryPath | ForEach-Object {
    [pscustomobject]@{ Path = $_.Path; Name = "$directoryName/$($_.Name)" }
  }
}
New-NormalizedZip $sourceZip $sourceEntries

Copy-Item -LiteralPath $portableSource -Destination (Join-Path $outputRoot "graphics-gravity-portable-$version-x64.exe") -Force
Copy-Item -LiteralPath (Join-Path $projectRoot "release\windows\graphics-gravity-setup-$version-x64.exe") -Destination (Join-Path $outputRoot "graphics-gravity-setup-$version-x64.exe") -Force

$artifacts = Get-ChildItem -LiteralPath $outputRoot -File |
  Where-Object { $_.Name -match [regex]::Escape($version) } |
  Sort-Object Name
$checksumPath = Join-Path $outputRoot "graphics-gravity-$version-SHA256.txt"
$checksumLines = foreach ($artifact in $artifacts) {
  $hash = (Get-FileHash -LiteralPath $artifact.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  "$hash  $($artifact.Name)"
}
[System.IO.File]::WriteAllLines($checksumPath, $checksumLines, [System.Text.UTF8Encoding]::new($false))

Get-ChildItem -LiteralPath $outputRoot -File |
  Where-Object { $_.Name -match [regex]::Escape($version) } |
  Sort-Object Name |
  Select-Object Name, Length
