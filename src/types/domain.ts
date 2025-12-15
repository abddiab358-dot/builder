export type ProjectStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled'

export interface Project {
  id: string
  title: string
  clientName: string
  address: string
  status: ProjectStatus
  startDate: string
  endDate?: string
  budget?: number
  notes?: string
  createdAt: string
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  assignedTo?: string
  status: TaskStatus
  dueDate?: string
  createdAt: string
}

export interface Client {
  id: string
  name: string
  phone?: string
  address?: string
  notes?: string
  createdAt: string
}

export interface ActivityEvent {
  id: string
  action: string
  entity:
  | 'project'
  | 'task'
  | 'client'
  | 'worker'
  | 'file'
  | 'settings'
  | 'invoice'
  | 'payment'
  | 'expense'
  | 'dailyReport'
  | 'workerLog'
  | 'notification'
  | 'permission'
  entityId: string
  timestamp: string
  details?: string
}

export interface Settings {
  id: string
  language: 'ar'
  notificationsEnabled: boolean
  theme: 'light' | 'dark'
}

export interface Worker {
  id: string
  projectId: string
  name: string
  phone?: string
  role?: string
  dailyRate?: number
  notes?: string
  createdAt: string
}

export interface ProjectFileMeta {
  id: string
  projectId: string
  fileName: string
  mimeType: string
  createdAt: string
}

export type ExpenseCategory = 'materials' | 'equipment' | 'fuel' | 'extra_work' | 'food' | 'worker_daily' | 'other'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Invoice {
  id: string
  projectId: string
  number: string
  date: string
  dueDate?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate?: number
  taxAmount?: number
  total: number
  paidAmount: number
  notes?: string
  logoFileId?: string
  imageFileId?: string
  createdAt: string
}

export interface Payment {
  id: string
  projectId: string
  invoiceId?: string
  workerId?: string
  date: string
  amount: number
  method?: string
  notes?: string
  createdAt: string
}

export interface Expense {
  id: string
  projectId: string
  category: ExpenseCategory
  label: string
  amount: number
  date: string
  workerId?: string
  dailyRate?: number
  notes?: string
  createdAt: string
}

export interface WorkerLogEntry {
  id: string
  projectId: string
  date: string
  workersCount: number
  hoursPerWorker: number
  hourlyRate: number
  totalCost: number
  notes?: string
  createdAt: string
}

export interface DailyReport {
  id: string
  projectId: string
  date: string
  progressPercent: number
  notes?: string
  issues?: string
  photoFileIds?: string[]
  workersCount?: number
  createdAt: string
}

export type NotificationType = 'task_due' | 'project_deadline' | 'payment_due' | 'invoice_overdue' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  projectId?: string
  entity?: ActivityEvent['entity']
  entityId?: string
  read: boolean
  createdAt: string
  dueDate?: string
}

export type UserRole = 'manager' | 'staff' | 'viewer' | 'supervisor'

export interface PermissionUser {
  id: string
  name: string
  role: UserRole
  createdAt: string
  username?: string
  passwordHash?: string
}

export interface ProjectLocation {
  id: string
  projectId: string
  lat: number
  lng: number
  address?: string
  snapshotFileId?: string
  createdAt: string
}

export type CloudProvider = 'google' | 'microsoft' | 'none'

// ... existing code ...
export interface CloudSyncSettings {
  enabled: boolean
  provider: CloudProvider
  lastSyncTime?: string
  autoSync: boolean
  syncInterval?: number // in minutes
  accessToken?: string
  refreshToken?: string
}

export interface SmartFundTransaction {
  id: string
  projectId: string
  date: string
  amount: number
  currency: 'USD' | 'SYP'
  type: 'deposit' | 'expense'
  category?: string
  label?: string
  notes?: string
  exchangeRate?: number // Rate used for conversion/display at time of entry
  createdAt: string
}

export interface DailyChecklistItem {
  id: string
  date: string
  workerId: string
  workerName: string
  present: boolean
  notes: string
}