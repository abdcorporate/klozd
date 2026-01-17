import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, authApi } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<any>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },

      login: async (email: string, password: string) => {
        try {
          console.log('Appel API login...');
          const response = await authApi.login({ email, password });
          console.log('Réponse API:', response.data);
          
          // Si c'est un cas de vérification d'email requise, retourner la réponse spéciale
          if (response.data?.requiresVerification) {
            return response;
          }
          
          const { accessToken, user } = response.data;
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', accessToken);
          }
          
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Erreur dans login store:', error);
          // Extraire le message d'erreur de l'API si disponible
          if (error.response?.data?.message) {
            const apiError = new Error(error.response.data.message);
            (apiError as any).response = error.response;
            throw apiError;
          }
          throw error;
        }
      },

      register: async (data) => {
        const response = await authApi.register(data);
        
        // Si c'est un cas de renvoi de code (email non vérifié), retourner la réponse sans stocker le token
        if (response.data?.requiresVerification) {
          return response;
        }
        
        const { accessToken, user } = response.data;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', accessToken);
        }
        
        set({
          user,
          token: accessToken,
          isAuthenticated: true,
        });
        
        return response;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Erreur lors de la déconnexion:', error);
        } finally {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      checkAuth: async () => {
        try {
          const response = await authApi.me();
          const { accessToken, user } = response.data;
          set({
            user,
            token: accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: typeof window !== 'undefined' 
        ? createJSONStorage(() => localStorage)
        : undefined,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

// Hook pour vérifier si le store est hydraté
export const useAuthHydrated = () => {
  const store = useAuthStore();
  return store._hasHydrated;
};
