export type UserRole = 'USER' | 'ADMIN'

export interface UserSession {
  id: number
  username: string
  fullName: string
  email: string
  role: UserRole
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export interface Listing {
  id: number
  title: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl?: string
  active: boolean
  ownerId: number
  ownerName: string
  createdAt: string
  updatedAt: string
}

export interface ListingRequest {
  title: string
  description: string
  category: string
  price: number
  stock: number
  imageUrl?: string
}

export interface CartItem {
  listingId: number
  title: string
  price: number
  quantity: number
  imageUrl?: string
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  totalAmount: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  listingId: number
  listingTitle: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Order {
  id: number
  orderCode: string
  customerName: string
  customerEmail: string
  customerAddress: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  createdAt: string
}

export interface Event {
  id: number
  title: string
  summary?: string
  description?: string
  startAt: string
  endAt: string
  location: string
  type: string
  fee: number
  imageUrl?: string
  active: boolean
  createdAt: string
}

export interface EventRequest {
  title: string
  summary?: string
  description?: string
  startAt: string
  endAt: string
  location: string
  type: string
  fee: number
  imageUrl?: string
  active?: boolean
}

export type EventRegistrationStatus = 'REGISTERED' | 'CONFIRMED' | 'CANCELLED'

export interface EventRegistration {
  id: number
  eventId: number
  eventTitle: string
  name: string
  email: string
  phone?: string
  note?: string
  status: EventRegistrationStatus
  createdAt: string
}

export interface FAQItem {
  id: number
  category: string
  question: string
  answer: string
  displayOrder: number
}

export type SupportTicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export interface SupportTicket {
  id: number
  ticketCode: string
  name: string
  email: string
  subject: string
  category: string
  message: string
  status: SupportTicketStatus
  adminReply?: string
  createdAt: string
  updatedAt: string
  repliedAt?: string
}
