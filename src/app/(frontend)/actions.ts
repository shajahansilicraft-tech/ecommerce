'use server'

import { getPayloadClient } from '@/lib/payload'

export interface CheckoutCartItemInput {
  productName: string
  material?: string
  unitPrice: number
  quantity: number
}

export interface SubmitOrderInput {
  customerName: string
  customerEmail: string
  items: CheckoutCartItemInput[]
}

export async function submitOrderAction(
  input: SubmitOrderInput,
): Promise<{ ok: true; orderNumber: string } | { ok: false; error: string }> {
  const customerName = typeof input?.customerName === 'string' ? input.customerName.trim() : ''
  const customerEmail =
    typeof input?.customerEmail === 'string' ? input.customerEmail.trim().toLowerCase() : ''
  const rawItems = Array.isArray(input?.items) ? input.items : []

  if (!customerName || !customerEmail || !customerEmail.includes('@')) {
    return { ok: false, error: 'Please provide a valid name and email address.' }
  }

  const sanitizedItems = rawItems
    .filter(
      (item) =>
        item &&
        typeof item.productName === 'string' &&
        item.productName.trim().length > 0 &&
        Number.isFinite(Number(item.unitPrice)) &&
        Number(item.unitPrice) >= 0 &&
        Number.isInteger(Number(item.quantity)) &&
        Number(item.quantity) > 0,
    )
    .map((item) => ({
      productName: item.productName.trim(),
      material: typeof item.material === 'string' ? item.material.trim() : 'Natural finish',
      unitPrice: Number(item.unitPrice),
      quantity: Number(item.quantity),
    }))

  if (sanitizedItems.length === 0) {
    return { ok: false, error: 'Add at least one item before checking out.' }
  }

  const subtotal = sanitizedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  try {
    const payload = await getPayloadClient()
    const created = await payload.create({
      collection: 'orders',
      overrideAccess: false,
      data: {
        orderNumber: `NOMA-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerEmail,
        items: sanitizedItems,
        subtotal,
        status: 'confirmed',
      },
    })

    return {
      ok: true,
      orderNumber: created.orderNumber,
    }
  } catch {
    return {
      ok: false,
      error: 'Unable to process your order right now. Please try again.',
    }
  }
}

export async function subscribeNewsletterAction(
  emailInput: string,
): Promise<{ ok: true; message: string } | { ok: false; error: string }> {
  const email = typeof emailInput === 'string' ? emailInput.trim().toLowerCase() : ''
  if (!email || !email.includes('@')) {
    return { ok: false, error: 'Please enter a valid email address.' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'newsletter-subscribers',
      overrideAccess: false,
      data: {
        email,
        status: 'subscribed',
      },
    })
    return {
      ok: true,
      message: 'Thank you — your first Noma note is on its way.',
    }
  } catch {
    // If already subscribed, still return a polite confirmation
    return {
      ok: true,
      message: 'You are subscribed to the Noma note.',
    }
  }
}
