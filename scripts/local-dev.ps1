# Helper script for Windows local dev
if (-Not (Test-Path "node_modules")) {
  npm install
}
$env:PORT = 3000
npm run dev
