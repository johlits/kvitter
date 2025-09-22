param(
  [string]$Env = "dev",
  [string]$Project = "kvitter",
  [string]$ZipPath = "deploy.zip"
)

$rg = "rg-$Project-$Env"
$webapp = "kvitter-web-app"

# Create a source zip excluding node_modules, .git, data
if (Test-Path $ZipPath) { Remove-Item $ZipPath }

$temp = New-Item -ItemType Directory -Path (Join-Path $env:TEMP ("kvitter-deploy-" + [guid]::NewGuid()))
Copy-Item -Path * -Destination $temp -Recurse -Force -Exclude @("node_modules", ".git", "data", "deploy.zip")
Compress-Archive -Path (Join-Path $temp '*') -DestinationPath $ZipPath
Remove-Item $temp -Recurse -Force

Write-Host "Deploying to $webapp in $rg"
az webapp deploy --resource-group $rg --name $webapp --src-path $ZipPath --type zip
