import React, { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: string
  entity_type?: string
  phone?: string
  company?: string
  address?: string
  is_completed?: boolean
}

interface UserContextValue {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  logout: () => void
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

export function normalizeUser(userData: any): User {
  return {
    id: userData.id,
    email: userData.email,
    first_name: userData.first_name || "",
    last_name: userData.last_name || "",
    role: userData.role || userData.role_name || "unknown",
    entity_type: userData.entity_type || "",
    phone: userData.phone || "",
    company: userData.company || "",
    address: userData.address || "",
    is_completed: userData.is_completed ?? false,
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const userData = JSON.parse(userStr)
      const normalizedUser = normalizeUser(userData)
      setUser(normalizedUser)
    }
  }, [])

  function logout() {
    setUser(null)
    localStorage.removeItem("user")
    localStorage.removeItem("auth_token")
  }

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser")
  }
  return context
}
