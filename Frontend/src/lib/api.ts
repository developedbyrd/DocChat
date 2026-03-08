const API_BASE = import.meta.env.VITE_API_URL;

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  return null;
};

const makeRequest = async (url: string, options: RequestInit = {}) => {
  let response = await fetch(url, {
    ...options,
    headers: getAuthHeaders(),
  });

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newToken}`,
        },
      });
    }
  }

  return response;
};

export const api = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  getDocuments: async () => {
    const response = await makeRequest(`${API_BASE}/documents`);
    return response.json();
  },

  getDocument: async (id: string) => {
    const response = await makeRequest(`${API_BASE}/documents/${id}`);
    return response.json();
  },

  deleteDocument: async (id: string) => {
    const response = await makeRequest(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  getConversation: async (documentId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations?documentId=${documentId}`);
    return response.json();
  },

  createConversation: async (documentId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations`, {
      method: "POST",
      body: JSON.stringify({ documentId }),
    });
    return response.json();
  },

  getMessages: async (conversationId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations/${conversationId}/messages`);
    return response.json();
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await makeRequest(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ role: "user", content }),
    });
    return response.json();
  },
};