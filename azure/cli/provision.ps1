param(
  [string]$Location = "westeurope",
  [string]$Env = "dev",
  [string]$Project = "kvitter"
)

# Derived names
$rg = "rg-$Project-$Env"
$plan = "asp-$Project-$Env"
$webapp = "app-$Project-$Env"
$kv = "kv-$Project-$Env"

Write-Host "Creating resource group: $rg"
az group create --name $rg --location $Location | Out-Null

# App Service Plan and Web App
Write-Host "Creating App Service Plan: $plan"
az appservice plan create --name $plan --resource-group $rg --sku B1 --is-linux | Out-Null

Write-Host "Creating Web App: $webapp"
az webapp create --name $webapp --resource-group $rg --plan $plan --runtime "NODE|18-lts" | Out-Null

# App settings (set PORT and SQLite DB path)
Write-Host "Configuring App Settings"
az webapp config appsettings set --name $webapp --resource-group $rg --settings PORT=8080 NODE_ENV=production DB_PATH=/home/site/data/kvitter.db | Out-Null

# Ensure server-side build for native modules (better-sqlite3)
az webapp config appsettings set --name $webapp --resource-group $rg --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true | Out-Null

# Key Vault
Write-Host "Creating Key Vault: $kv"
az keyvault create --name $kv --resource-group $rg --location $Location | Out-Null

Write-Host "Provisioning complete. Resource Group: $rg"
