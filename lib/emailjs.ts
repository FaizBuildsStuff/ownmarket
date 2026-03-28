import prisma from "./prisma"

export async function sendEmailConfirmation(data: {
  to_name: string
  to_email: string
  product_title: string
  price: number
  image_url: string
}) {
  // Use EmailJS REST API
  const serviceId = process.env.EMAILJS_SERVICE_ID
  const templateId = process.env.EMAILJS_TEMPLATE_ID
  const publicKey = process.env.EMAILJS_PUBLIC_KEY

  if (!serviceId || !templateId || !publicKey) {
    console.error("EmailJS configuration missing")
    return
  }

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: data,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("EmailJS error:", error)
    }
  } catch (err) {
    console.error("EmailJS exception:", err)
  }
}
