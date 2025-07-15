type ApiResponse<T> = {
  data?: T
  total?: number | null
}
export interface Category {
  id: string
  name: string
  description: string
  color: string
}

export interface Status {
  name: string
}

export interface Kind {
  name: string
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
  category?: Category
}
