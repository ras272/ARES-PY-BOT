// test-webhook.js - Script para probar el webhook localmente
// Ejecutar con: node test-webhook.js

const fs = require('fs');
const path = require('path');

// Simular un payload de WhatsApp
const testPayload = {
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "595981123456",
          "text": {
            "body": "Hola, me interesa el precio del láser IPL para mi clínica"
          }
        }],
        "contacts": [{
          "profile": {
            "name": "Dr. Juan Pérez"
          }
        }]
      }
    }]
  }]
};

// Verificar que el archivo del webhook existe
const webhookPath = path.join(__dirname, 'src', 'app', 'api', 'webhook', 'route.ts');
if (!fs.existsSync(webhookPath)) {
  console.error('❌ Archivo del webhook no encontrado en:', webhookPath);
  process.exit(1);
}

console.log('✅ Webhook encontrado en:', webhookPath);
console.log('✅ Payload de prueba preparado');
console.log('📝 Mensaje de prueba:', testPayload.entry[0].changes[0].value.messages[0].text.body);
console.log('');
console.log('🚀 Para probar el sistema:');
console.log('1. Configura las variables de entorno en .env.local');
console.log('2. Ejecuta: npm run dev');
console.log('3. Configura el webhook URL en WhatsApp Cloud API');
console.log('4. Envía un mensaje desde WhatsApp a tu número configurado');
console.log('');
console.log('📋 URLs esperadas:');
console.log('- Webhook: http://localhost:3000/api/webhook');
console.log('- Frontend: http://localhost:3000');
console.log('');
console.log('💡 Recuerda configurar:');
console.log('- OPENAI_API_KEY');
console.log('- SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
console.log('- WHATSAPP_TOKEN y WHATSAPP_PHONE_ID');
console.log('- WHATSAPP_VERIFY_TOKEN');
