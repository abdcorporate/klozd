import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important pour envoyer les cookies (refresh token)
});

// Access token en mémoire (pas dans localStorage)
let accessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// CSRF token en mémoire
let csrfToken: string | null = null;
let isFetchingCsrf = false;
let csrfQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Fonction pour traiter la queue des requêtes en attente
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Fetch CSRF token from server
 */
async function fetchCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  if (isFetchingCsrf) {
    // Wait for ongoing CSRF fetch
    return new Promise((resolve, reject) => {
      csrfQueue.push({ resolve, reject });
    });
  }

  isFetchingCsrf = true;

  try {
    const response = await axios.get(`${API_URL}/auth/csrf`, {
      withCredentials: true,
    });
    
    csrfToken = response.data.csrfToken;
    
    // Process queue
    csrfQueue.forEach((prom) => prom.resolve(csrfToken));
    csrfQueue = [];
    
    return csrfToken!;
  } catch (error) {
    // Process queue with error
    csrfQueue.forEach((prom) => prom.reject(error));
    csrfQueue = [];
    throw error;
  } finally {
    isFetchingCsrf = false;
  }
}

// Intercepteur pour ajouter le token JWT et CSRF
api.interceptors.request.use(async (config) => {
  // Utiliser le token en mémoire (pas localStorage)
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Add CSRF token for protected endpoints
  const isCsrfProtectedEndpoint =
    config.url?.includes('/auth/refresh') ||
    config.url?.includes('/auth/logout') ||
    (config.url?.includes('/auth/login') && config.method === 'post');

  if (isCsrfProtectedEndpoint) {
    try {
      const token = await fetchCsrfToken();
      config.headers['X-CSRF-Token'] = token;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      // Continue anyway, backend will reject if needed
    }
  }

  return config;
});

// Intercepteur pour gérer les erreurs et refresh automatique
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Erreur réseau (API non accessible)
    if (!error.response) {
      console.error('Erreur réseau:', error.message);
      const networkError = new Error('Impossible de se connecter au serveur. Vérifiez que l\'API est démarrée sur http://localhost:3001');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Ne pas rediriger automatiquement pour les erreurs 401 lors de l'inscription/connexion
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh');

    // Si 401 et pas un endpoint d'auth, essayer de refresh
    if (error.response?.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        // Si déjà en train de refresh, mettre en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Fetch CSRF token before refresh
        const csrf = await fetchCsrfToken();
        
        // Appeler /auth/refresh (cookie sera envoyé automatiquement avec withCredentials: true)
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              'X-CSRF-Token': csrf,
            },
          },
        );

        const newAccessToken = response.data.accessToken;
        accessToken = newAccessToken;

        // Mettre à jour le store si disponible
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/auth-store');
          const store = useAuthStore.getState();
          store.setToken?.(newAccessToken);
        }

        // Traiter la queue
        processQueue(null, newAccessToken);

        // Réessayer la requête originale
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh échoué, rediriger vers login
        processQueue(refreshError, null);
        accessToken = null;

        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/auth-store');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CLOSER' | 'SETTER' | 'SUPER_ADMIN' | 'MANAGER';
  organizationId: string;
  organizationName?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Fonction pour définir le token en mémoire
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Fonction pour obtenir le token en mémoire
export const getAccessToken = () => accessToken;

// API Methods
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  refresh: async () => {
    // Ensure CSRF token is fetched before refresh
    await fetchCsrfToken();
    return api.post<{ accessToken: string }>('/auth/refresh');
  },
  
  logout: async () => {
    // Ensure CSRF token is fetched before logout
    await fetchCsrfToken();
    return api.post('/auth/logout');
  },
  
  getCsrfToken: () => fetchCsrfToken(),
  
  me: () => api.get<AuthResponse>('/auth/me'),
};

export const formsApi = {
  getAll: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string }) => 
    api.get('/forms', { params }),
  getOne: (idOrSlug: string) => {
    // Si c'est un slug (contient des tirets/lettres), utiliser l'endpoint public
    if (idOrSlug.includes('-') || /^[a-z]/.test(idOrSlug)) {
      return api.get(`/forms/public/${idOrSlug}`);
    }
    return api.get(`/forms/${idOrSlug}`);
  },
  create: (data: any) => api.post('/forms', data),
  update: (id: string, data: any) => api.patch(`/forms/${id}`, data),
  delete: (id: string) => api.delete(`/forms/${id}`),
  submit: (formId: string, data: any, idempotencyKey?: string) => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return api.post(`/leads/forms/${formId}/submit`, data, { headers });
  },
  trackAbandon: (formId: string, email?: string, dataJson?: string, completionPercentage?: number) =>
    api.post(`/leads/forms/${formId}/abandon`, { email, dataJson, completionPercentage }),
  getAnalytics: (id: string, days?: number) => api.get(`/forms/${id}/analytics`, { params: { days } }),
};

export const calendarConfigApi = {
  get: () => api.get('/calendar-config'),
  update: (data: any) => api.patch('/calendar-config', data),
};

export const leadsApi = {
  getAll: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string; [key: string]: any }) => 
    api.get('/leads', { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  getOnePublic: (id: string) => api.get(`/leads/book/${id}`),
  update: (id: string, data: any) => api.patch(`/leads/${id}`, data),
  assignCloser: (id: string) => api.post(`/leads/${id}/assign-closer`),
};

export const sitesApi = {
  getAll: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string }) => 
    api.get('/sites', { params }),
  getOne: (id: string) => api.get(`/sites/${id}`),
  getBySlug: (slug: string) => api.get(`/sites/public/${slug}`),
  create: (data: any) => api.post('/sites', data),
  update: (id: string, data: any) => api.patch(`/sites/${id}`, data),
  delete: (id: string) => api.delete(`/sites/${id}`),
};

export const crmApi = {
  getDeals: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string; [key: string]: any }) => 
    api.get('/crm/deals', { params }),
  getPipeline: () => api.get('/crm/pipeline'),
  createDeal: (data: any) => api.post('/crm/deals', data),
  updateDeal: (id: string, data: any) => api.patch(`/crm/deals/${id}`, data),
};

export const schedulingApi = {
  getAppointments: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string; [key: string]: any }) => 
    api.get('/scheduling/appointments', { params }),
  getOne: (id: string) => api.get(`/scheduling/appointments/${id}`),
  create: (data: any) => api.post('/scheduling/appointments', data),
  update: (id: string, data: any) => api.patch(`/scheduling/appointments/${id}`, data),
  markCompleted: (id: string, outcome: string) =>
    api.post(`/scheduling/appointments/${id}/complete`, { outcome }),
  markNoShow: (id: string) => api.post(`/scheduling/appointments/${id}/no-show`),
  // Public endpoints
  getAvailability: (closerId: string) => api.get(`/scheduling/availability/${closerId}`),
  createPublic: (data: any, idempotencyKey?: string) => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }
    return api.post('/scheduling/appointments/public', data, { headers });
  },
};

export const dashboardApi = {
  getCeo: () => api.get('/dashboard/ceo'),
  getCloser: () => api.get('/dashboard/closer'),
  getManager: () => api.get('/dashboard/manager'),
  getSetter: () => api.get('/dashboard/setter'),
  getAdmin: () => api.get('/dashboard/admin'),
  getCeoTrends: () => api.get('/dashboard/ceo/trends'),
  getManagerClosersSettersPerformance: () => api.get('/dashboard/manager/closers-setters-performance'),
};

export const usersApi = {
  getAll: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string }) => 
    api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  activate: (id: string) => api.post(`/users/${id}/activate`),
  deactivate: (id: string) => api.post(`/users/${id}/deactivate`),
};


export const organizationsApi = {
  getAll: () => api.get('/organizations'),
  getOne: (id: string) => api.get(`/organizations/${id}`),
  update: (id: string, data: any) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};

export const invitationsApi = {
  create: (data: { email: string; role: string; firstName?: string; lastName?: string }) =>
    api.post('/invitations', data),
  getAll: () => api.get('/invitations'),
  getByToken: (token: string) => api.get(`/invitations/public/${token}`),
  accept: (token: string, data: { password: string; confirmPassword: string; firstName: string; lastName: string }) =>
    api.post(`/invitations/public/${token}/accept`, data),
  cancel: (id: string) => api.delete(`/invitations/${id}`),
  resend: (id: string) => api.post(`/invitations/${id}/resend`),
};

export const notificationsApi = {
  getAll: (params?: { limit?: number; cursor?: string; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string }) => 
    api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};


export const exportsApi = {
  exportLeads: (filters?: any) =>
    api.get('/exports/leads', { params: filters, responseType: 'blob' }),
  exportDeals: (filters?: any) =>
    api.get('/exports/deals', { params: filters, responseType: 'blob' }),
};

export const webhooksApi = {
  getAll: () => api.get('/webhooks'),
  getOne: (id: string) => api.get(`/webhooks/${id}`),
  create: (data: any) => api.post('/webhooks', data),
  update: (id: string, data: any) => api.patch(`/webhooks/${id}`, data),
  delete: (id: string) => api.delete(`/webhooks/${id}`),
};

export const adminWaitlistApi = {
  getEntries: (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    return api.get(`/admin/waitlist?${queryParams.toString()}`);
  },
  getStats: () => api.get('/admin/waitlist/stats'),
};

export const apiKeysApi = {
  getAll: () => api.get('/api-keys'),
  getOne: (id: string) => api.get(`/api-keys/${id}`),
  create: (data: any) => api.post('/api-keys', data),
  delete: (id: string) => api.delete(`/api-keys/${id}`),
};

export const aiApi = {
  analyzeSentiment: (text: string) => api.post('/ai/analyze-sentiment', { text }),
  generateMessageSuggestions: (leadId: string) =>
    api.post(`/ai/leads/${leadId}/suggestions`),
};

export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data: any) => api.patch('/settings', data),
  updateOrganization: (data: any) => api.patch('/settings/organization', data),
  getPricingPlans: () => api.get('/settings/pricing/plans'),
};

export const callsApi = {
  joinCall: (appointmentId: string, displayName?: string) =>
    api.post(`/calls/appointments/${appointmentId}/join-call`, { displayName }),
  startCall: (callId: string, startRecording?: boolean) =>
    api.post(`/calls/${callId}/start`, { startRecording }),
  stopCall: (callId: string, reason?: string) =>
    api.post(`/calls/${callId}/stop`, { reason }),
  getCall: (callId: string) => api.get(`/calls/${callId}`),
};
