# Kvitter

A learning-oriented Twitter clone to practice Azure using the Portal, CLI, and Infrastructure as Code (Bicep/Terraform), now using SQLite for persistence (free and simple for MVP).

## Roadmap
- **Step 1: Portal-first MVP**
  - Create Resource Group and App Service
  - Configure application setting `DB_PATH=/home/site/data/kvitter.db`
  - Deploy a simple web app (this repo)
  - Test basic CRUD: create users, post tweets
- **Step 2: CLI automation**
  - Script creation of resources with `az` (Resource Group, App Service)
  - Deploy backend updates via CLI (Zip Deploy, server-side build)
  - Manage secrets in Key Vault from CLI (optional)
- **Step 3: Infrastructure as Code**
  - Define all resources in Bicep/Terraform
  - Version control everything in GitHub
  - Deploy full stack with one command
- **Step 4 (optional, advanced): Scaling & serverless**
  - Azure Functions for feed processing, notifications, or scheduled cleanup
  - CDN or caching for media
  - Experiment with horizontal scaling of App Service (note: SQLite is single-instance; for scale-out switch to Azure Table Storage, Postgres, etc.)

## Local development
- **Prereqs**
  - Node.js 18+
  - PowerShell (for Windows helper scripts) or your shell of choice

- **Install & run**
  ```powershell
  # from repo root
  npm install
  npm run dev
  # API at http://localhost:3000
  ```

- **API endpoints**
  - `GET /` health
  - `GET /api/users` list users
  - `POST /api/users` body: `{ handle, displayName }`
  - `GET /api/users/:id`
  - `PATCH /api/users/:id` body: `{ displayName? }`
  - `DELETE /api/users/:id`
  - `GET /api/tweets` list tweets (latest first)
  - `POST /api/tweets` body: `{ userId, body }` (body is truncated to 280 chars)
  - `GET /api/tweets/:id`
  - `DELETE /api/tweets/:id`

Persistence uses SQLite for MVP. Locally it stores `./data/kvitter.db` (gitignored). On Azure App Service Linux it uses `/home/site/data/kvitter.db`.

## Step 1: Azure Portal-first MVP
Follow `azure/portal-notes.md` to create resources in the Portal. Once your Web App exists, you can deploy with Zip Deploy (CLI) or configure GitHub Actions.

## Step 2: CLI automation
Use the scripts in `azure/cli/`.

- **Login**
  ```powershell
  az login
  az account set --subscription "<your-subscription-id>"
  ```

- **Provision** resources (Resource Group, Cosmos DB, App Service, Key Vault):
  ```powershell
  ./azure/cli/provision.ps1 -Location westeurope -Env dev -Project kvitter
  ```

- **Build** and **Deploy** app:
  ```powershell
  ./azure/cli/deploy.ps1 -Env dev -Project kvitter
  ```

After deploy, ensure Application Settings include `PORT=8080` and `DB_PATH=/home/site/data/kvitter.db`. The app listens on `process.env.PORT`.

## CI/CD: Deploy from GitHub Actions
We include a workflow at `.github/workflows/azure-webapp.yml` that deploys to Azure App Service on pushes to `main`.

Setup steps:
1. Create an App Service (see Step 1) and download its Publish Profile from the Azure Portal.
2. In your GitHub repository settings → Secrets and variables → Actions, add a new secret:
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: contents of the publish profile XML
3. If your app name is not `app-kvitter-dev`, edit the workflow `app-name` input to your web app name.

On deploy, the action uses the publish profile and performs a server-side build on App Service (Oryx). We also recommend having these App Settings on the Web App:
- `PORT=8080`
- `DB_PATH=/home/site/data/kvitter.db`
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true`

## Step 3: Infrastructure as Code
- **Bicep**: see `azure/iac/bicep/main.bicep`
  - Deploy via CLI:
    ```powershell
    az deployment group create -g rg-kvitter-dev -f azure/iac/bicep/main.bicep -p env=dev project=kvitter
    ```
- **Terraform**: see `azure/iac/terraform/main.tf`
  - Initialize and apply:
    ```bash
    terraform init
    terraform apply -auto-approve
    ```

Pick one IaC tool to focus on first; you can keep both to compare approaches.

## Step 4: Ideas for scaling & serverless
- Replace in-memory storage with Cosmos DB (NoSQL). Add services and repositories in `src/`.
- Introduce Azure Functions for background tasks (fan-out notifications, scheduled cleanup).
- Add storage for media (Azure Storage + CDN), and caching (Azure Cache for Redis) for timelines.
- Enable autoscale on the App Service Plan and test load.

## Project Structure
```
kvitter/
  src/
    routes/
      tweets.ts
      users.ts
    app.ts
    server.ts
    types.ts
  azure/
    cli/
      deploy.ps1
      provision.ps1
    iac/
      bicep/
        main.bicep
      terraform/
        main.tf
    portal-notes.md
  .github/
    workflows/
      azure-webapp.yml
  scripts/
    local-dev.ps1
  .gitignore
  package.json
  tsconfig.json
  README.md
```

## Next steps
- Run locally and test endpoints with a REST client (VS Code REST, Postman, curl).
- Do Step 1 in the Portal to get familiar with Azure components.
- Move to Step 2 (CLI) and Step 3 (IaC) when ready.
