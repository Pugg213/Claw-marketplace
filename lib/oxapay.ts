import axios from 'axios'

const OXAPAY_API = 'https://api.oxapay.com/api/v1'

interface CreatePaymentParams {
  amount: number
  orderId: string
  description: string
  callbackUrl: string
  returnUrl: string
}

interface CreatePaymentResponse {
  errorCode: number
  message: string
  result: {
    payLink: string
    paymentId: string
    expireTime: number
  }
}

interface PayoutParams {
  amount: number
  address: string
  network: string
  currency?: string
}

interface PayoutResponse {
  errorCode: number
  message: string
  result?: {
    id: string
    amount: number
    txHash: string
  }
}

export class OxapayService {
  private merchantKey: string
  private sellerKey: string

  constructor() {
    this.merchantKey = process.env.OXAPAY_MERCHANT_KEY || ''
    this.sellerKey = process.env.OXAPAY_SELLER_KEY || ''
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResponse> {
    try {
      const response = await axios.post(`${OXAPAY_API}/payment`, {
        merchantKey: this.merchantKey,
        amount: params.amount,
        currency: 'USDT',
        orderId: params.orderId,
        callbackUrl: params.callbackUrl,
        returnUrl: params.returnUrl,
        description: params.description,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Oxapay createPayment error:', error.response?.data || error.message)
      throw error
    }
  }

  async createPayout(params: PayoutParams): Promise<PayoutResponse> {
    try {
      const response = await axios.post(`${OXAPAY_API}/payout`, {
        merchantKey: this.sellerKey,
        amount: params.amount,
        address: params.address,
        network: params.network,
        currency: params.currency || 'USDT',
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Oxapay createPayout error:', error.response?.data || error.message)
      throw error
    }
  }

  async checkPayment(paymentId: string): Promise<any> {
    try {
      const response = await axios.post(`${OXAPAY_API}/info`, {
        merchantKey: this.merchantKey,
        paymentId,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Oxapay checkPayment error:', error.response?.data || error.message)
      throw error
    }
  }
}

export const oxapay = new OxapayService()
