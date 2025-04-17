import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'subscribed' | 'unsubscribed' | 'bounced'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  location: string
}

export interface Mail {
  id: number
  unread?: boolean
  from: User
  subject: string
  body: string
  date: string
}

export interface Member {
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: Avatar
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface Debt {
  id: string
  title: string
  amount: number
  purchase_date: string
  due_date?: string
  created_at: string
  updated_at: string

  status: {
    id: string
    name: 'paid' | 'overdue' | 'pending'
  }

  invoice?: {
    id: string
    title: string
  }

  category?: {
    id: string
    name: string
  }
}

export interface ApiResponse<T> {
  data?: T | null
  error?: string | null
  total?: number | null
}

export interface InvoiceResponse {
  id: string
  title: string
  amount: number
  issue_date?: string
  due_date: string
  created_at: string
  updated_at: string

  status: {
    id: string
    name: 'paid' | 'overdue' | 'pending'
  }
}

export interface InvoiceApiResponse {
  data: InvoiceResponse[]
  total: number
}

// TODO: juntar os tipos
export interface Category {
  id: string
  name: string
}
export interface PaymentStatus {
  id: string
  name: string
}
