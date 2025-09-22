# Azure Portal Notes (Step 1: Portal-first MVP)

This guide helps you create the initial infrastructure via the Azure Portal so you can deploy the `kvitter` MVP.

## Resources to create
- Resource Group (e.g., `rg-kvitter-dev`)
- App Service Plan (Linux)
- App Service (Node 18 runtime)
- Key Vault (optional, for secrets)

## Steps
1. Create a Resource Group
   - Name: `rg-kvitter-dev`
   - Region: closest to you
2. Create an App Service Plan
   - OS: Linux
   - SKU: Basic/Free for test
3. Create an App Service
   - Runtime stack: Node 18 LTS
   - Application settings:
     - `PORT=8080`
     - `DB_PATH=/home/site/data/kvitter.db` (persistent storage path on Linux App Service)
   - Note: SQLite database will be stored on the persistent mount `/home`. No separate Azure DB service is required for MVP.
4. (Optional) Create a Key Vault
   - Store any secrets you might add later
   - Grant your user and the App Service access to read secrets

## Next
- Test locally first, then move to CLI scripts in `azure/cli/` to automate the above.
