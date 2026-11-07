# Flujo completo de /admin contra Supabase PRUEBAS (nunca el proyecto del sitio). Ver docs/PRUEBAS.md.
# Uso, desde la raíz del repo:  powershell -ExecutionPolicy Bypass -File e2e\admin-con-supabase.ps1
# Pide la clave oculta; solo vive en las variables de este proceso y se borra al terminar.
# También pide (opcional) la clave SECRETA de PRUEBAS para probar /admin/usuarios (D-35): cópiala de
# Supabase → proyecto "AS Tupropiedad Pruebas" → Project Settings → API Keys → Secret keys. Si la
# dejas vacía, esa prueba se salta.
# Se ve el navegador (--headed): no lo toques mientras corre.
param([string]$Correo = "jforero@astupropiedad.com")

Set-Location (Split-Path $PSScriptRoot -Parent)
npx playwright install chromium   # la primera vez descarga el navegador de pruebas (~300 MB)

function Leer-Oculto([string]$Texto) {
  $segura = Read-Host $Texto -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($segura)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

# URL y clave publicable del proyecto AS Tupropiedad Pruebas (públicas: van al navegador).
$env:E2E_SUPABASE_URL = "https://uyinlfotfqvygimporfe.supabase.co"
$env:E2E_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6WtY8qSGV0_KgdA_lLGaXg_Q01pbbyB"
$env:E2E_ADMIN_CORREO = $Correo
$env:E2E_ADMIN_CLAVE = Leer-Oculto "Clave de $Correo en Supabase PRUEBAS"
$secreta = Leer-Oculto "Clave secreta (sb_secret_...) de Supabase PRUEBAS para probar usuarios (Enter para saltar)"
if ($secreta) {
  if (-not $secreta.StartsWith("sb_secret_")) { Write-Host "Eso no parece una clave secreta de Supabase (sb_secret_...); se salta la prueba de usuarios." }
  else { $env:E2E_SUPABASE_SECRET_KEY = $secreta }
}
Remove-Variable secreta -ErrorAction SilentlyContinue
try {
  npx playwright test e2e/admin.spec.ts --reporter=list --headed
} finally {
  Remove-Item Env:E2E_ADMIN_CLAVE -ErrorAction SilentlyContinue
  Remove-Item Env:E2E_SUPABASE_SECRET_KEY -ErrorAction SilentlyContinue
  Write-Host "`n=== FIN DE LA PRUEBA E2E DE /admin ==="
}
