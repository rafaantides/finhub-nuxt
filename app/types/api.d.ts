type ApiResponse<T> = {
  data?: T
  total?: number | null
}
export interface Category {
  id: string
  name: string
  description: string
  color: string
  suggested_percentage: number | null
}

export interface Invoice {
  id: string
  title: string
  amount: number
  due_date: string
  created_at: string
  updated_at: string
  status: PaymentStatus
}

export interface Transaction {
  id: string
  record_type: string
  title: string
  amount: number
  record_date: string
  created_at: string
  updated_at: string
  status: string
  invoice?: {
    id: string
    title: string
  }
  category?: Category
}
