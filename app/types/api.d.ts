type ApiResponse<T> = {
  data?: T
  total?: number | null
  error?: {
    statusCode: number
    message: string
    data?: any
  }
}
export interface Category {
  id: string
  name: string
}

export interface PaymentStatus {
  id: string
  name: string
}

export interface Debt {
  id: string
  title: string
  amount: number
  purchase_date: string
  due_date?: string
  created_at: string
  updated_at: string
  invoice?: {
    id: string
    title: string
  }
  status: PaymentStatus
  category?: Category
}

export interface Invoice {
  id: string
  title: string
  amount: number
  issue_date?: string
  due_date: string
  created_at: string
  updated_at: string
  status: PaymentStatus
}
