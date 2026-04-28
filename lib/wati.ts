const WATI_API_KEY = process.env.WATI_API_KEY!
const WATI_PHONE = process.env.WATI_PHONE_NUMBER!

export async function sendWhatsAppMessage(phone: string, message: string) {
  const response = await fetch(
    `https://live-mt-server.wati.io/${WATI_PHONE}/api/v1/sendSessionMessage?whatsappNumber=${phone}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WATI_API_KEY}`,
      },
      body: JSON.stringify({ message }),
    }
  )
  return response.json()
}

export async function tagSubscriber(phone: string, tags: string[]) {
  const response = await fetch(
    `https://live-mt-server.wati.io/${WATI_PHONE}/api/v1/contacts/${phone}/tags`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WATI_API_KEY}`,
      },
      body: JSON.stringify({ tags }),
    }
  )
  return response.json()
}
