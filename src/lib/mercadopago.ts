import { MercadoPagoConfig, Preference, PreApprovalPlan, PreApproval } from 'mercadopago'

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export interface CreatePreferenceInput {
  items: {
    id: string
    title: string
    description?: string
    pictureUrl?: string
    categoryId?: string
    quantity: number
    currencyId?: string
    unitPrice: number
  }[]
  payer?: {
    name?: string
    surname?: string
    email: string
  }
  externalReference?: string
  notificationUrl?: string
  backUrls?: {
    success?: string
    failure?: string
    pending?: string
  }
  autoReturn?: string
}

export async function createPreference(input: CreatePreferenceInput) {
  const preference = new Preference(mpClient)

  const result = await preference.create({
    body: {
      items: input.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        picture_url: item.pictureUrl,
        category_id: item.categoryId,
        quantity: item.quantity,
        currency_id: item.currencyId || 'BRL',
        unit_price: item.unitPrice,
      })),
      payer: input.payer ? {
        name: input.payer.name,
        surname: input.payer.surname,
        email: input.payer.email,
      } : undefined,
      external_reference: input.externalReference,
      notification_url: input.notificationUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
      back_urls: input.backUrls ? {
        success: input.backUrls.success,
        failure: input.backUrls.failure,
        pending: input.backUrls.pending,
      } : undefined,
      auto_return: input.autoReturn || 'approved',
    },
  })

  return result
}

export interface CreatePreapprovalPlanInput {
  reason: string
  autoRecurring: {
    frequency: number
    frequencyType: 'days' | 'months'
    transactionAmount: number
    currencyId?: string
  }
  backUrl?: string
  externalReference?: string
}

export async function createPreapprovalPlan(input: CreatePreapprovalPlanInput) {
  const plan = new PreApprovalPlan(mpClient)

  const result = await plan.create({
    body: {
      reason: input.reason,
      auto_recurring: {
        frequency: input.autoRecurring.frequency,
        frequency_type: input.autoRecurring.frequencyType,
        transaction_amount: input.autoRecurring.transactionAmount,
        currency_id: input.autoRecurring.currencyId || 'BRL',
      },
      back_url: input.backUrl,
    },
  })

  return result
}

export async function getSubscription(subscriptionId: string) {
  const preApproval = new PreApproval(mpClient)

  const result = await preApproval.get({ id: subscriptionId })

  return result
}

export async function cancelSubscription(subscriptionId: string) {
  const preApproval = new PreApproval(mpClient)

  const result = await preApproval.update({
    id: subscriptionId,
    body: { status: 'cancelled' },
  })

  return result
}

export { mpClient }
