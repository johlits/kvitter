@description('Deployment location')
param location string = resourceGroup().location

@description('Environment name, e.g. dev/test/prod')
param env string = 'dev'

@description('Project name')
param project string = 'kvitter'

var rgName = resourceGroup().name
var planName = 'asp-${project}-${env}'
var webName = 'app-${project}-${env}'
var kvName = 'kv-${project}-${env}'

resource plan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: planName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
    size: 'B1'
    capacity: 1
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource web 'Microsoft.Web/sites@2023-12-01' = {
  name: webName
  location: location
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'PORT'
          value: '8080'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'DB_PATH'
          value: '/home/site/data/kvitter.db'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
    }
    httpsOnly: true
  }
}

resource kv 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: kvName
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      name: 'standard'
      family: 'A'
    }
    accessPolicies: []
    enablePurgeProtection: false
    enableSoftDelete: true
  }
}

@description('Outputs the web app name')
output webAppName string = web.name
