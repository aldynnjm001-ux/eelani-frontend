export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

async function request(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  try {
    const url = `${API_BASE}${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) || {}),
      },
      ...options,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
    }

    if (!res.ok) {
        console.error(`API Error [${url}]:`, data);
        throw data;
    }
    return data;
  } catch (error) {
    console.error(`Fetch Error [${path}]:`, error);
    throw error;
  }
}

export const API_URL_DEBUG = API_BASE;

export const api = {
  getGlobalSettings: () => request('/settings/global'),
  getActiveOffers: () => request('/offers/active'),
  getLiveStats: () => request('/stats-v2'),
  getPaymentSettings: () => request('/settings/payment'),
  // Auth
  register: (data: any) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request('/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/logout', { method: 'POST' }),
  forgotPassword: (email: string) => request('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  profile: () => request('/user'),
  deleteProfile: () => request('/user', { method: 'DELETE' }),
  updateProfile: (data: FormData | object) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isFormData = data instanceof FormData;
    return fetch(`${API_BASE}/user/update`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      },
      body: isFormData ? data : JSON.stringify(data),
    }).then(r => r.json());
  },
  getUserStats: () => request('/user/stats'),
  getPublicProfile: (id: number) => request(`/users/${id}`),
  submitReview: (data: { user_id: number; rating: number; comment?: string; ad_id?: number }) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),

  // Ads
  getAds: (params?: any) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/ads${qs}`);
  },
  getAd: (id: number) => request(`/ads/${id}`),
  getRelatedAds: (id: number) => request(`/ads/${id}/related`),
  trackAdClick: (id: number) => request(`/ads/${id}/click`, { method: 'POST' }),
  myAds: () => request('/my-ads'),
  deleteAd: (id: number) => request(`/ads/${id}`, { method: 'DELETE' }),
  createAd: (form: FormData) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE}/ads`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: form,
    }).then(r => r.json());
  },

  // Categories & Packages
  getCategories: () => request('/categories'),
  getPackages: () => request('/packages'),
  getCountries: () => request('/countries'),

  // Transactions
  getTransactions: () => request('/transactions'),
  validatePromoCode: (code: string) => request('/offers/validate', { method: 'POST', body: JSON.stringify({ code }) }),
  pay: (data: FormData | object) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isFormData = data instanceof FormData;
    
    return fetch(`${API_BASE}/pay`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      },
      body: isFormData ? data : JSON.stringify(data),
    }).then(r => r.json());
  },

  // Messages & Chats
  getChats: () => request('/chats'),
  getConversation: (id: number) => request(`/chats/${id}`),
  sendChatMessage: (id: number, body: string) => request(`/chats/${id}/messages`, { method: 'POST', body: JSON.stringify({ body }) }),
  startChat: (adId: number, sellerId: number) => request('/chats/start', { method: 'POST', body: JSON.stringify({ ad_id: adId, seller_id: sellerId }) }),
  getChat: (adId: number, otherId: number) => request(`/messages/${adId}/${otherId}`),
  sendMessage: (data: any) => request(`/messages/send`, { method: 'POST', body: JSON.stringify(data) }),
  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationAsRead: (id: string | number) => request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsAsRead: () => request('/notifications/read-all', { method: 'POST' }),

  // Search Alerts
  getSearchAlerts: () => request('/search-alerts'),
  createSearchAlert: (data: { keyword: string, category_id?: number, country_id?: number }) => request('/search-alerts', { method: 'POST', body: JSON.stringify(data) }),
  deleteSearchAlert: (id: number) => request(`/search-alerts/${id}`, { method: 'DELETE' }),

  generateAiContent: (prompt: string) => request('/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  }),

  // Social Auth
  getAuthRedirect: (provider: string) => request(`/auth/${provider}/redirect`),
};
