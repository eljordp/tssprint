import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface OrderItem {
  name: string
  size: string
  option: string
  price: number
  quantity: number
  material?: string
  shape?: string
}

export interface OrderRecord {
  id: string
  items: OrderItem[]
  total: number
  date: string
  status: 'submitted' | 'proof-sent' | 'approved' | 'printing' | 'shipped' | 'delivered'
}

export interface CustomerProfile {
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  orders: OrderRecord[]
  createdAt: string
}

interface ProfileContextType {
  profile: CustomerProfile | null
  login: (email: string) => CustomerProfile
  logout: () => void
  updateProfile: (updates: Partial<CustomerProfile>) => void
  addOrder: (order: Omit<OrderRecord, 'id' | 'date' | 'status'>) => void
  getProfileByEmail: (email: string) => CustomerProfile | null
}

const PROFILES_KEY = 'tss-profiles'
const ACTIVE_KEY = 'tss-active-profile'

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

function loadProfiles(): Record<string, CustomerProfile> {
  try {
    const stored = localStorage.getItem(PROFILES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function saveProfiles(profiles: Record<string, CustomerProfile>) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function loadActiveEmail(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

function createProfile(email: string): CustomerProfile {
  return {
    email,
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    orders: [],
    createdAt: new Date().toISOString(),
  }
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Record<string, CustomerProfile>>(loadProfiles)
  const [activeEmail, setActiveEmail] = useState<string | null>(loadActiveEmail)

  useEffect(() => {
    saveProfiles(profiles)
  }, [profiles])

  useEffect(() => {
    if (activeEmail) {
      localStorage.setItem(ACTIVE_KEY, activeEmail)
    } else {
      localStorage.removeItem(ACTIVE_KEY)
    }
  }, [activeEmail])

  const profile = activeEmail ? profiles[activeEmail] ?? null : null

  const login = (email: string): CustomerProfile => {
    const key = normalizeEmail(email)
    const existing = profiles[key]
    if (existing) {
      setActiveEmail(key)
      return existing
    }
    const newProfile = createProfile(key)
    setProfiles((prev) => ({ ...prev, [key]: newProfile }))
    setActiveEmail(key)
    return newProfile
  }

  const logout = () => {
    setActiveEmail(null)
  }

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    if (!activeEmail) return
    setProfiles((prev) => {
      const current = prev[activeEmail]
      if (!current) return prev
      const { orders, ...safeUpdates } = updates
      return { ...prev, [activeEmail]: { ...current, ...safeUpdates } }
    })
  }

  const addOrder = (order: Omit<OrderRecord, 'id' | 'date' | 'status'>) => {
    if (!activeEmail) return
    const record: OrderRecord = {
      ...order,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      status: 'submitted',
    }
    setProfiles((prev) => {
      const current = prev[activeEmail]
      if (!current) return prev
      return { ...prev, [activeEmail]: { ...current, orders: [...current.orders, record] } }
    })
  }

  const getProfileByEmail = (email: string): CustomerProfile | null => {
    return profiles[normalizeEmail(email)] ?? null
  }

  return (
    <ProfileContext.Provider value={{ profile, login, logout, updateProfile, addOrder, getProfileByEmail }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (!context) throw new Error('useProfile must be used within ProfileProvider')
  return context
}
