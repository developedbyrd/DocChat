const API_BASE = import.meta.env.VITE_API_URL;

export const api = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  getDocuments: async () => {
    const response = await fetch(`${API_BASE}/documents`);
    return response.json();
  },

  getDocument: async (id: string) => {
    const response = await fetch(`${API_BASE}/documents/${id}`);
    return response.json();
  },

  deleteDocument: async (id: string) => {
    const response = await fetch(`${API_BASE}/documents/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },

  getConversation: async (documentId: string) => {
    const response = await fetch(`${API_BASE}/conversations?documentId=${documentId}`);
    return response.json();
  },

  createConversation: async (documentId: string) => {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });
    return response.json();
  },

  getMessages: async (conversationId: string) => {
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
    return response.json();
  },

  sendMessage: async (conversationId: string, content: string) => {
    const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "user", content }),
    });
    return response.json();
  },
};