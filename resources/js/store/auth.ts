import { create } from 'zustand';
import api, { ensureCsrfToken } from '@/api/client';
import { User } from '@/types';
import { API_ENDPOINTS } from '@/constants';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

    checkAuth: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get<User>(API_ENDPOINTS.AUTH_USER);
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await api.post(API_ENDPOINTS.LOGOUT);
        } catch (error) {
            // Log or ignore logout errors since we will clear client credentials anyway
        } finally {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
