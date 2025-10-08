import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { isGreeting, isCourtesyMessage, getTimeBasedGreeting } from '../../classifier'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'
import { sendListMessage } from '../../whatsapp/sendList'

/**
 * Maneja el flujo completo de soporte
 */
export async function handleSoporteFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`🔧 Procesando flujo de soporte para ${data.customerName}`)

  const { messageText, buttonReplyId, listReplyId, phoneNumber, customerName } = data

  // 1. Si es saludo, enviar menú inicial
  if (isGreeting(messageText)) {
    console.log('👋 Saludo detectado en soporte, enviando menú interactivo...')
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
      'soporte'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "soporte", enviar lista de opciones de soporte
  if (buttonReplyId === 'soporte') {
    console.log('🔧 Solicitud de Soporte, enviando lista de opciones...')
    const sections = [
      {
        title: "Opciones de Soporte",
        rows: [
          {
            id: "soporte_servicio_tecnico",
            title: "Servicio Técnico",
            description: "Reparaciones y mantenimiento"
          },
          {
            id: "soporte_pedidos_insumos",
            title: "Pedidos de Insumos",
            description: "Tips, consumibles, repuestos"
          },
          {
            id: "soporte_hablar_agente",
            title: "Hablar con un Agente",
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
      'soporte'
    )

    return { message: 'Lista de soporte enviada' }
  }

  // 3. Si es respuesta de lista de soporte
  if (listReplyId) {
    switch (listReplyId) {
      case 'soporte_servicio_tecnico':
        const tecnicoPhone = '595981255999'
        const tecnicoMessage = `¡Perfecto! 🛠️\n\nTe voy a conectar con nuestro equipo de Servicio Técnico.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${tecnicoPhone}\n\n¡Te ayudarán con cualquier problema técnico! 😊`
        await sendTextMessage(phoneNumber, tecnicoMessage, 'soporte')
        return { message: tecnicoMessage }

      case 'soporte_pedidos_insumos':
        const insumosPhone = '595981255999'
        const insumosMessage = `¡Excelente! 📦\n\nTe voy a conectar con nuestro equipo de Pedidos de Insumos.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${insumosPhone}\n\n¡Te ayudarán con tu pedido! 😊`
        await sendTextMessage(phoneNumber, insumosMessage, 'soporte')
        return { message: insumosMessage }

      case 'soporte_hablar_agente':
        const agentePhone = '595981255999'
        const agenteMessage = `¡Por supuesto! 👤\n\nTe voy a conectar con uno de nuestros agentes.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${agentePhone}\n\n¡Te atenderán enseguida! 😊`
        await sendTextMessage(phoneNumber, agenteMessage, 'soporte')
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
          'soporte'
        )
        return { message: 'Menú principal enviado' }
    }
  }

  // 4. Si es mensaje de cortesía
  if (isCourtesyMessage(messageText)) {
    console.log('💚 Mensaje de cortesía detectado en soporte')
    const courtesyResponse = '¡Con gusto! 😊 Si necesitas algo más, aquí estaré para ayudarte. ¡Que tengas un excelente día! ✨'
    await sendTextMessage(phoneNumber, courtesyResponse, 'soporte')
    return { message: courtesyResponse }
  }

  // 5. Si es mensaje de texto normal
  const response = `Hola ${customerName}, gracias por contactarnos. Actualmente estamos trabajando para brindarte el mejor soporte automatizado. Un agente especializado te contactará pronto para ayudarte con: ${messageText.substring(0, 100)}...`
  await sendTextMessage(phoneNumber, response, 'soporte')

  return { message: response }
}
