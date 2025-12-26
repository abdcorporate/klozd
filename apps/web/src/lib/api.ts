import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Erreur réseau (API non accessible)
    if (!error.response) {
      console.error('Erreur réseau:', error.message);
      const networkError = new Error('Impossible de se connecter au serveur. Vérifiez que l\'API est démarrée sur http://localhost:3001');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Ne pas rediriger automatiquement pour les erreurs 401 lors de l'inscription/connexion
    // (ces endpoints sont publics et peuvent renvoyer 401 pour "email déjà utilisé" ou "mauvais identifiants")
    const isAuthEndpoint = error.config?.url?.includes('/auth/register') || error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Rediriger seulement si ce n'est pas un endpoint d'authentification
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
};

export const formsApi = {
  getAll: () => api.get('/forms'),
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
  submit: (formId: string, data: any) => api.post(`/leads/forms/${formId}/submit`, data),
  trackAbandon: (formId: string, email?: string, dataJson?: string, completionPercentage?: number) =>
    api.post(`/leads/forms/${formId}/abandon`, { email, dataJson, completionPercentage }),
  getAnalytics: (id: string, days?: number) => api.get(`/forms/${id}/analytics`, { params: { days } }),
};

export const calendarConfigApi = {
  get: () => api.get('/calendar-config'),
  update: (data: any) => api.patch('/calendar-config', data),
};

export const leadsApi = {
  getAll: (filters?: any) => api.get('/leads', { params: filters }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  getOnePublic: (id: string) => api.get(`/leads/book/${id}`),
  update: (id: string, data: any) => api.patch(`/leads/${id}`, data),
  assignCloser: (id: string) => api.post(`/leads/${id}/assign-closer`),
};

export const sitesApi = {
  getAll: () => api.get('/sites'),
  getOne: (id: string) => api.get(`/sites/${id}`),
  getBySlug: (slug: string) => api.get(`/sites/public/${slug}`),
  create: (data: any) => api.post('/sites', data),
  update: (id: string, data: any) => api.patch(`/sites/${id}`, data),
  delete: (id: string) => api.delete(`/sites/${id}`),
};

export const crmApi = {
  getDeals: () => api.get('/crm/deals'),
  getPipeline: () => api.get('/crm/pipeline'),
  createDeal: (data: any) => api.post('/crm/deals', data),
  updateDeal: (id: string, data: any) => api.patch(`/crm/deals/${id}`, data),
};

export const schedulingApi = {
  getAppointments: () => api.get('/scheduling/appointments'),
  getOne: (id: string) => api.get(`/scheduling/appointments/${id}`),
  create: (data: any) => api.post('/scheduling/appointments', data),
  update: (id: string, data: any) => api.patch(`/scheduling/appointments/${id}`, data),
  markCompleted: (id: string, outcome: string) =>
    api.post(`/scheduling/appointments/${id}/complete`, { outcome }),
  markNoShow: (id: string) => api.post(`/scheduling/appointments/${id}/no-show`),
  // Public endpoints
  getAvailability: (closerId: string) => api.get(`/scheduling/availability/${closerId}`),
  createPublic: (data: any) => api.post('/scheduling/appointments/public', data),
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
  getAll: () => api.get('/users'),
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
  getAll: () => api.get('/notifications'),
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
