/**
 * Healthcare AI Platform API Client
 * Provides async wrappers for all REST API endpoints.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`API request error on ${endpoint}:`, err);
    throw err;
  }
}

export const healthcareApi = {
  // Symptom Analysis
  getSymptomCatalog: () => request('/symptoms/catalog'),
  extractSymptomsNlp: (text) => request('/symptoms/extract', {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  analyzeSymptoms: (payload) => request('/symptoms/analyze', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // AI Chatbot & RAG
  getChatSessions: () => request('/chat/sessions'),
  createChatSession: (title) => request(`/chat/sessions?title=${encodeURIComponent(title || 'New Medical Consultation')}`, {
    method: 'POST'
  }),
  getSessionMessages: (sessionId) => request(`/chat/sessions/${sessionId}/messages`),
  sendChatMessage: (sessionId, message) => request('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId, message })
  }),
  deleteChatSession: (sessionId) => request(`/chat/sessions/${sessionId}`, {
    method: 'DELETE'
  }),

  // Disease Information Explorer
  getDiseases: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/diseases/?${qs}`);
  },
  getDiseaseDetail: (icd10) => request(`/diseases/${icd10}`),
  getDiseaseCategories: () => request('/diseases/categories/list'),

  // AI/ML Predictive Analytics
  getModelMetrics: () => request('/predict/metrics'),
  predictHeartRisk: (payload) => request('/predict/heart', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  predictDiabetesRisk: (payload) => request('/predict/diabetes', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  predictStrokeRisk: (payload) => request('/predict/stroke', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Healthcare Dataset Explorer
  getDatasetsList: () => request('/datasets/'),
  getDatasetDetails: (slug, page = 1, pageSize = 20, search = '') => {
    const params = new URLSearchParams({ page, page_size: pageSize });
    if (search) params.append('search', search);
    return request(`/datasets/${slug}?${params.toString()}`);
  },
  uploadCustomDataset: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return await response.json();
  },

  // Medical Knowledge Search & Health Guides
  searchKnowledge: (query, category) => {
    const params = new URLSearchParams({ q: query });
    if (category && category !== 'All') params.append('category', category);
    return request(`/knowledge/search?${params.toString()}`);
  },
  getHealthGuides: () => request('/knowledge/guides'),

  // User Profile & Vitals Tracking
  getUserProfile: () => request('/user/profile'),
  updateUserProfile: (profileData) => request('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),
  getHealthMetrics: () => request('/user/metrics'),
  logHealthMetric: (metricData) => request('/user/metrics', {
    method: 'POST',
    body: JSON.stringify(metricData)
  }),

  // Admin & System Health
  getSystemHealth: () => request('/admin/system-health')
};
