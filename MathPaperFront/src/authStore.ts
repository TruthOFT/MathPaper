import { create } from 'zustand'
import { request } from './api'

export type AuthUser = {
    id: number
    username: string
    roleType: 'teacher' | 'student' | 'admin'
    realName: string
}

type AuthState = {
    user: AuthUser | null
    isLogin: boolean
    login: (username: string, password: string) => Promise<void>
    register: (payload: { username: string; password: string; roleType: string; realName: string }) => Promise<void>
    logout: () => Promise<void>
    refreshMe: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLogin: false,
    login: async (username, password) => {
        const user = await request<AuthUser>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        })
        set({ user, isLogin: true })
    },
    register: async (payload) => {
        const user = await request<AuthUser>('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        set({ user, isLogin: true })
    },
    logout: async () => {
        await request<void>('/api/auth/logout', { method: 'POST' })
        set({ user: null, isLogin: false })
    },
    refreshMe: async () => {
        try {
            const user = await request<AuthUser>('/api/auth/me')
            set({ user, isLogin: true })
        } catch {
            set({ user: null, isLogin: false })
        }
    },
}))
