const API_BASE =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const parseJsonOrThrow = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : `Request failed (${response.status})`,
    );
  }
  return data;
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

const fetchDownloadWithAuth = async (url: string): Promise<ArrayBuffer> => {
  const token = localStorage.getItem("accessToken");
  const doFetch = (authToken: string | null) =>
    fetch(url, {
      headers: {
        ...(authToken && { Authorization: `Bearer ${authToken}` }),
      },
    });

  let response = await doFetch(token);
  if (response.status === 401) {
    const newToken = await handleTokenRefresh();
    if (newToken) {
      response = await doFetch(newToken);
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      typeof err?.error === "string" ? err.error : `Download failed (${response.status})`,
    );
  }
  return response.arrayBuffer();
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
    return parseJsonOrThrow(response);
  },

  getDocuments: async () => {
    const response = await makeRequest(`${API_BASE}/documents`);
    return parseJsonOrThrow(response);
  },

  getDocument: async (id: string) => {
    const response = await makeRequest(`${API_BASE}/documents/${id}`);
    return parseJsonOrThrow(response);
  },

  downloadDocumentPdf: async (documentId: string) => {
    return fetchDownloadWithAuth(`${API_BASE}/documents/${documentId}/download`);
  },

  deleteDocument: async (id: string) => {
    const response = await makeRequest(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
    });
    return parseJsonOrThrow(response);
  },

  getConversation: async (documentId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations?documentId=${documentId}`);
    return parseJsonOrThrow(response);
  },

  createConversation: async (documentId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations`, {
      method: "POST",
      body: JSON.stringify({ documentId }),
    });
    return parseJsonOrThrow(response);
  },

  getMessages: async (conversationId: string) => {
    const response = await makeRequest(`${API_BASE}/conversations/${conversationId}/messages`);
    return parseJsonOrThrow(response);
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await makeRequest(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ role: "user", content }),
    });
    return parseJsonOrThrow(response);
  },

  downloadGeneratedPdf: async (conversationId: string, messageId: string) => {
    return fetchDownloadWithAuth(
      `${API_BASE}/conversations/${conversationId}/messages/${messageId}/generated-pdf`,
    );
  },
};