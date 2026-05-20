# Ejecutar desde aurum-piano-frontend: .\instalar-router.ps1
Set-Location $PSScriptRoot
Write-Host "Instalando react-router-dom..."
npm install react-router-dom@6.28.0
if (Test-Path "node_modules\.vite") {
  Remove-Item -Recurse -Force "node_modules\.vite"
  Write-Host "Cache de Vite limpiada."
}
Write-Host "Listo. Ahora ejecuta: npm run dev"
