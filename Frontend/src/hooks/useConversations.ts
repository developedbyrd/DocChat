import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const useConversation = (documentId: string) => {
  return useQuery({
    queryKey: ["conversations", documentId],
    queryFn: () => api.getConversation(documentId),
    enabled: !!documentId,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createConversation,
    onSuccess: (data, documentId) => {
      queryClient.setQueryData(["conversations", documentId], data);
    },
  });
};

export const useMessages = (conversationId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => api.getMessages(conversationId),
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => api.sendMessage(conversationId, content),
    onMutate: async ({ conversationId, content }) => {
      await queryClient.cancelQueries({
        queryKey: ["messages", conversationId],
      });
      const previousMessages = queryClient.getQueryData([
        "messages",
        conversationId,
      ]);

      const tempUserMessage = {
        _id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["messages", conversationId], (old: any) =>
        old ? [...old, tempUserMessage] : [tempUserMessage]
      );

      return { previousMessages };
    },
    onSuccess: (data, { conversationId }) => {
      queryClient.setQueryData(["messages", conversationId], (old: any) => {
        if (!old) return [];
        const withoutTemp = old.filter(
          (msg: any) => !msg._id.startsWith("temp-")
        );
        return [...withoutTemp, data.userMessage, data.aiResponse];
      });
    },
    onError: (_err, { conversationId }, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", conversationId],
          context.previousMessages
        );
      }
    },
  });
};
