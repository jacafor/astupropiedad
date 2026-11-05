# Flujo completo de /admin contra Supabase PRUEBAS (nunca el proyecto del sitio). Ver docs/PRUEBAS.md.
# Uso, desde la raíz del repo:  powershell -ExecutionPolicy Bypass -File e2e\admin-con-supabase.ps1
# Pide la clave oculta; solo vive en las variables de este proceso y se borra al terminar.
# Se ve el navegador (--headed): no lo toques mientras corre.
param([string]$Correo = "jforero@astupropiedad.com")

Set-Location (Split-Path $PSScriptRoot -Parent)
npx playwright install chromium   # la primera vez descarga el navegador de pruebas (~300 MB)

# URL y clave publicable del proyecto AS Tupropiedad Pruebas (públicas: van al navegador).
$env:E2E_SUPABASE_URL = "https://uyinlfotfqvygimporfe.supabase.co"
$env:E2E_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6WtY8qSGV0_KgdA_lLGaXg_Q01pbbyB"
$env:E2E_ADMIN_CORREO = $Correo
$segura = Read-Host "Clave de $Correo en Supabase PRUEBAS" -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
try {
  $env:E2E_ADMIN_CLAVE = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
try {
  npx playwright test e2e/admin.spec.ts --reporter=list --headed
} finally {
  Remove-Item Env:E2E_ADMIN_CLAVE -ErrorAction SilentlyContinue
  Write-Host "`n=== FIN DE LA PRUEBA E2E DE /admin ==="
}
