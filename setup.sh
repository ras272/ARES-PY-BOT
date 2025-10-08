#!/bin/bash

echo "🚀 Configurando WhatsApp Bot ARES..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado."
    exit 1
fi

echo "✅ npm detectado: $(npm --version)"

# Instalar dependencias
echo ""
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias."
    exit 1
fi

echo "✅ Dependencias instaladas correctamente."

# Verificar configuración
echo ""
echo "🔧 Verificando configuración..."

# Verificar si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚠️  Archivo .env.local no encontrado."
    echo "📝 Creando archivo .env.local con configuración básica..."
    cat > .env.local << EOL
# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN=your_whatsapp_token_here
WHATSAPP_PHONE_ID=your_whatsapp_phone_id_here
WHATSAPP_VERIFY_TOKEN=your_webhook_verify_token_here
EOL
    echo "✅ Archivo .env.local creado. Por favor edita con tus credenciales reales."
else
    echo "✅ Archivo .env.local encontrado."
fi

# Crear directorio src si no existe
if [ ! -d "src" ]; then
    echo "📁 Creando estructura de directorios..."
    mkdir -p src/app/api/webhook src/lib
    echo "✅ Estructura de directorios creada."
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env.local con tus credenciales reales"
echo "2. Ejecuta las tablas SQL en Supabase (ver supabase-setup.sql)"
echo "3. Configura el webhook en WhatsApp Cloud API"
echo "4. Sube tu catálogo PDF a Supabase Storage"
echo "5. Ejecuta 'npm run dev' para iniciar el servidor"
echo ""
echo "📚 Para más detalles, revisa el README.md"
echo ""
echo "💡 ¿Necesitas ayuda? Revisa la documentación en README.md"
