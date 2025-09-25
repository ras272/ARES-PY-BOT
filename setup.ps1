# Setup script for Windows PowerShell

Write-Host "🚀 Configurando WhatsApp Bot ARES..." -ForegroundColor Green
Write-Host ""

# Verificar Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green

# Verificar npm
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Host "❌ npm no está instalado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green

# Instalar dependencias
Write-Host ""
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error instalando dependencias." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencias instaladas correctamente." -ForegroundColor Green

# Verificar configuración
Write-Host ""
Write-Host "🔧 Verificando configuración..." -ForegroundColor Yellow

# Verificar si .env.local existe
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Archivo .env.local no encontrado." -ForegroundColor Yellow
    Write-Host "📝 Creando archivo .env.local con configuración básica..." -ForegroundColor Yellow

    $envContent = @"
# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN=your_whatsapp_token_here
WHATSAPP_PHONE_ID=your_whatsapp_phone_id_here
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token_here
"@

    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ Archivo .env.local creado. Por favor edita con tus credenciales reales." -ForegroundColor Green
} else {
    Write-Host "✅ Archivo .env.local encontrado." -ForegroundColor Green
}

# Crear estructura de directorios si no existe
if (-not (Test-Path "src")) {
    Write-Host "📁 Creando estructura de directorios..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "src\app\api\webhook" -Force | Out-Null
    New-Item -ItemType Directory -Path "src\lib" -Force | Out-Null
    Write-Host "✅ Estructura de directorios creada." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 ¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Edita el archivo .env.local con tus credenciales reales"
Write-Host "2. Ejecuta las tablas SQL en Supabase (ver supabase-setup.sql)"
Write-Host "3. Configura el webhook en WhatsApp Cloud API"
Write-Host "4. Sube tu catálogo PDF a Supabase Storage"
Write-Host "5. Ejecuta 'npm run dev' para iniciar el servidor"
Write-Host ""
Write-Host "📚 Para más detalles, revisa el README.md"
Write-Host ""
Write-Host "💡 ¿Necesitas ayuda? Revisa la documentación en README.md" -ForegroundColor Yellow
