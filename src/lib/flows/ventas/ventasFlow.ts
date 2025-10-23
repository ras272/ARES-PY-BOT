import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { getTimeBasedGreeting } from '../../classifier'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'
import { sendListMessage } from '../../whatsapp/sendList'

/**
 * Maneja el flujo completo de ventas - SOLO procesa respuestas de botones/listas
 */
export async function handleVentasFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`🛍️ Procesando flujo de ventas para ${data.customerName}`)

  const { messageText, buttonReplyId, listReplyId, phoneNumber, customerName } = data

  // SOLO procesar interacciones de botones/listas - cualquier texto va al menú principal desde el webhook
  if (!buttonReplyId && !listReplyId) {
    console.log('⚠️ VentasFlow recibió mensaje de texto sin botón - esto no debería pasar')
    const fallbackMessage = 'Por favor, selecciona una opción del menú para ayudarte mejor.'
    await sendTextMessage(phoneNumber, fallbackMessage, 'ventas')
    return { message: fallbackMessage }
  }

  // 2. Si es respuesta de botón "ventas", enviar lista de opciones de ventas
  if (buttonReplyId === 'ventas') {
    console.log('💼 Solicitud de Ventas, enviando lista de opciones...')
    const sections = [
      {
        title: "Opciones de Ventas",
        rows: [
          {
            id: "ventas_tecnologia",
            title: "🏥 Tecnología",
            description: "Equipos médicos y tecnología"
          },
          {
            id: "ventas_insumos", 
            title: "📦 Insumos",
            description: "Consumibles y repuestos"
          },
          {
            id: "ventas_cosmetica",
            title: "💄 Cosmética", 
            description: "Productos cosméticos"
          },
          {
            id: "volver_menu",
            title: "⬅️ Volver al menú",
            description: "Regresar al menú principal"
          }
        ]
      }
    ]

    await sendListMessage(
      phoneNumber,
      "Selecciona una opción",
      "¿Qué tipo de productos te interesan?",
      "Ver opciones",
      sections,
      'ventas'
    )

    return { message: 'Lista de ventas enviada' }
  }

  // 3. Si es respuesta de botón "soporte", enviar lista de opciones de soporte
  if (buttonReplyId === 'soporte') {
    console.log('🔧 Solicitud de Soporte, enviando lista de opciones...')
    const sections = [
      {
        title: "Opciones de Soporte",
        rows: [
          {
            id: "soporte_servtec",
            title: "🛠️ Servtec",
            description: "Servicio técnico y reparaciones"
          },
          {
            id: "soporte_operador",
            title: "👤 Hablar con operador",
            description: "Contacto directo con soporte"
          },
          {
            id: "volver_menu",
            title: "⬅️ Volver al menú",
            description: "Regresar al menú principal"
          }
        ]
      }
    ]

    await sendListMessage(
      phoneNumber,
      "Selecciona una opción",
      "¿En qué podemos ayudarte?",
      "Ver opciones",
      sections,
      'ventas'
    )

    return { message: 'Lista de soporte enviada' }
  }

  // 4. Si es respuesta de botón "administracion", redirigir a WhatsApp
  if (buttonReplyId === 'administracion') {
    console.log('📋 Solicitud de Administración, redirigiendo a WhatsApp...')
    const adminPhone = '595981221166'
    const adminMessage = `¡Perfecto! 🌟\n\nTe voy a conectar con nuestro equipo de Administración.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${adminPhone}\n\n¡Estarán encantados de ayudarte! 😊`
    
    await sendTextMessage(phoneNumber, adminMessage, 'ventas')
    return { message: adminMessage }
  }

  // 5. Si es respuesta de lista
  if (listReplyId) {
    switch (listReplyId) {
      case 'ventas_tecnologia':
        const tecMedicaPhone = '595994750076'
        const tecMedicaMessage = `¡Excelente elección! 🏥\n\nTe voy a conectar con nuestro equipo de Tecnología.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${tecMedicaPhone}\n\n¡Te brindarán toda la información que necesitas! 😊`
        await sendTextMessage(phoneNumber, tecMedicaMessage, 'ventas')
        return { message: tecMedicaMessage }

      case 'ventas_insumos':
        const insumosPhone = '595981255999'
        const insumosMessage = `¡Perfecto! 📦\n\nTe voy a conectar con nuestro equipo de Insumos.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${insumosPhone}\n\n¡Te ayudarán con tu pedido! 😊`
        await sendTextMessage(phoneNumber, insumosMessage, 'ventas')
        return { message: insumosMessage }

      case 'ventas_cosmetica':
        const cosmeticaPhone = '595994750076'
        const cosmeticaMessage = `¡Excelente elección! 💄\n\nTe voy a conectar con nuestro equipo de Cosmética.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${cosmeticaPhone}\n\n¡Te brindarán toda la información que necesitas! 😊`
        await sendTextMessage(phoneNumber, cosmeticaMessage, 'ventas')
        return { message: cosmeticaMessage }

      case 'soporte_servtec':
        const tecnicoPhone = '595981255999'
        const tecnicoMessage = `¡Perfecto! 🛠️\n\nTe voy a conectar con nuestro equipo de Servtec.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${tecnicoPhone}\n\n¡Te ayudarán con cualquier problema técnico! 😊`
        await sendTextMessage(phoneNumber, tecnicoMessage, 'ventas')
        return { message: tecnicoMessage }

      case 'soporte_operador':
        const agentePhone = '595981255999'
        const agenteMessage = `¡Por supuesto! 👤\n\nTe voy a conectar con un operador.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${agentePhone}\n\n¡Te atenderán enseguida! 😊`
        await sendTextMessage(phoneNumber, agenteMessage, 'ventas')
        return { message: agenteMessage }

      case 'volver_menu':
        // Enviar menú principal de nuevo
        console.log('↩️ Volviendo al menú principal...')
        const saludo = getTimeBasedGreeting()
        const mensajeSaludo = customerName !== 'Cliente'
          ? `${saludo} ${customerName}! 👋`
          : `${saludo}! 👋`

        const buttons = [
          { id: 'ventas', title: 'Ventas' },
          { id: 'soporte', title: 'Soporte' },
          { id: 'administracion', title: 'Administración' }
        ]

        await sendButtonMessage(
          phoneNumber,
          `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
          buttons,
          'ventas'
        )
        return { message: 'Menú principal enviado' }

      default:
        // Si es any other case, volvemos al menú principal
        console.log('⚠️ Opción desconocida, volviendo al menú principal...')
        return await handlePostBackToMenu(phoneNumber, customerName)
    }
  }

  // Fallback para cualquier caso no manejado
  console.log('⚠️ Flujo de ventas completado sin retorno específico, mostrando menú post-acción')
  return await handlePostBackToMenu(phoneNumber, customerName)
}

/**
 * Maneja el retorno al menú principal con opción de volver
 */
async function handlePostBackToMenu(phoneNumber: string, customerName: string): Promise<FlowResponse> {
  const buttons = [
    { id: 'volver_menu', title: '⬅️ Volver al Menú Principal' },
    { id: 'mas_ayuda', title: '❓ Necesito más ayuda' }
  ]

  await sendButtonMessage(
    phoneNumber,
    '¿Hay algo más en lo que pueda ayudarte?',
    buttons,
    'post_action'
  )

  return { message: 'Menú post-acción enviado' }
}
