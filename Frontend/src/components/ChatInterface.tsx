// import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Send, Bot, User } from "lucide-react";
// import { useMessages, useSendMessage } from "@/hooks/useConversations";
// import { toast } from "sonner";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   citations?: { page: number; text: string }[];
// }

// interface ChatInterfaceProps {
//   documentId: string;
//   conversationId: string;
//   onCitationClick: (page: number) => void;
// }

// const ChatInterface = ({
//   conversationId,
//   onCitationClick,
// }: ChatInterfaceProps) => {
//   const [input, setInput] = useState("");
//   const scrollRef = useRef<HTMLDivElement>(null);

//   const { data: messagesData = [] } = useMessages(conversationId);
//   const sendMessage = useSendMessage();

//   const messages: Message[] = useMemo(
//     () =>
//       messagesData.map((msg: any) => ({
//         id: msg._id,
//         role: msg.role as "user" | "assistant",
//         content: msg.content,
//         citations: msg.citations,
//       })),
//     [messagesData],
//   );

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const handleSend = useCallback(() => {
//     if (!input.trim() || sendMessage.isPending) return;

//     const userMessage = input.trim();
//     setInput("");

//     sendMessage.mutate(
//       { conversationId, content: userMessage },
//       {
//         onError: () => {
//           toast.error("Failed to send message. Please try again.");
//           setInput(userMessage);
//         },
//       },
//     );
//   }, [input, sendMessage, conversationId]);

//   return (
//     <div className="h-full flex flex-col bg-background">

//       <div className="p-4 border-b border-border">
//         <h2 className="text-lg font-semibold">Your AI Document Assistant</h2>
//         <p className="text-sm text-muted-foreground">
//           Ask anything, get instant answers, and explore your document
//           effortlessly
//         </p>
//       </div>


//       <ScrollArea className="flex-1 p-4 overflow-y-auto">
//         <div className="space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex gap-3 ${
//                 message.role === "user" ? "justify-end" : "justify-start"
//               }`}
//             >

//               {message.role === "assistant" && (
//                 <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
//                   <Bot className="h-5 w-5 text-primary-foreground" />
//                 </div>
//               )}


//               <div
//                 className={`max-w-[80%] rounded-lg p-3 ${
//                   message.role === "user"
//                     ? "bg-primary text-primary-foreground"
//                     : "bg-muted"
//                 }`}
//               >
//                 <p className="text-sm whitespace-pre-wrap">{message.content}</p>


//                 {message.role === "assistant" && (
//                   <p className="text-xs text-muted-foreground mt-1 italic">
//                     Powered by AI, carefully reading your document
//                   </p>
//                 )}


//                 {message.citations && message.citations.length > 0 && (
//                   <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-2">
//                     {message.citations.map((citation, idx) => (
//                       <Button
//                         key={idx}
//                         variant="secondary"
//                         size="sm"
//                         className="h-7 text-xs bg-[hsl(var(--citation-bg))]"
//                         onClick={() => onCitationClick(citation.page)}
//                       >
//                         Page {citation.page}
//                       </Button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {message.role === "user" && (
//                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 self-center">
//                   <User className="h-5 w-5" />
//                 </div>
//               )}
//             </div>
//           ))}

//           {sendMessage.isPending && (
//             <div className="flex gap-3 justify-start items-center">
//               <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
//                 <Bot className="h-5 w-5 text-primary-foreground" />
//               </div>
//               <div className="bg-muted rounded-lg p-3">
//                 <p className="text-xs text-muted-foreground mb-1">
//                   AI is thinking...
//                 </p>
//                 <div className="flex gap-1">
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
//                 </div>
//               </div>
//             </div>
//           )}


//           {messages.length === 0 && !sendMessage.isPending && (
//             <div className="text-center text-sm text-muted-foreground mt-10">
//               Start your conversation by asking something about your PDF!
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       <div className="p-4 border-t border-border">
//         <div className="flex gap-2">
//           <Input
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
//             placeholder="Curious? Ask me anything about this document..."
//             disabled={sendMessage.isPending}
//           />
//           <Button
//             onClick={handleSend}
//             disabled={sendMessage.isPending || !input.trim()}
//             title="Let the AI answer your question!"
//             className="cursor-pointer"
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default memo(ChatInterface);





import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, FileDown } from "lucide-react";
import { useMessages, useSendMessage } from "@/hooks/useConversations";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { page: number; text: string }[];
  generatedPdfFileName?: string;
}

interface ChatInterfaceProps {
  documentId: string;
  conversationId: string;
  onCitationClick: (page: number) => void;
}

const ChatInterface = ({
  conversationId,
  onCitationClick,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messagesData = [] } = useMessages(conversationId);
  const sendMessage = useSendMessage();

  const messages: Message[] = useMemo(
    () =>
      messagesData.map((msg: any) => ({
        id: msg._id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        citations: msg.citations,
        generatedPdfFileName: msg.generatedPdfFileName,
      })),
    [messagesData],
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || sendMessage.isPending) return;

    const userMessage = input.trim();
    setInput("");

    sendMessage.mutate(
      { conversationId, content: userMessage },
      {
        onError: () => {
          toast.error("Failed to send message. Please try again.");
          setInput(userMessage);
        },
      },
    );
  }, [input, sendMessage, conversationId]);

  const handleDownloadGenerated = useCallback(
    async (messageId: string) => {
      try {
        const buf = await api.downloadGeneratedPdf(conversationId, messageId);
        const blob = new Blob([buf], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "docchat-generated.pdf";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded");
      } catch {
        toast.error("Could not download PDF");
      }
    },
    [conversationId],
  );

  return (
    <div className="h-full flex flex-col bg-background">

      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Your AI Document Assistant</h2>
        <p className="text-sm text-muted-foreground">
          Ask about the document, or describe any PDF you want built from it (e.g.
          &quot;create a PDF with just the introduction and conclusion&quot;).
        </p>
      </div>


      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >

              {message.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
              )}


              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>


                {message.role === "assistant" && (
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    Powered by AI, carefully reading your document
                  </p>
                )}


                {message.citations && message.citations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50 flex flex-wrap gap-2">
                    {message.citations.map((citation, idx) => (
                      <Button
                        key={idx}
                        variant="secondary"
                        size="sm"
                        className="h-7 text-xs bg-[hsl(var(--citation-bg))]"
                        onClick={() => onCitationClick(citation.page)}
                      >
                        Page {citation.page}
                      </Button>
                    ))}
                  </div>
                )}

                {message.role === "assistant" && message.generatedPdfFileName && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-3 cursor-pointer"
                    onClick={() => handleDownloadGenerated(message.id)}
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 self-center">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))}

          {sendMessage.isPending && (
            <div className="flex gap-3 justify-start items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  AI is thinking...
                </p>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}


          {messages.length === 0 && !sendMessage.isPending && (
            <div className="text-center text-sm text-muted-foreground mt-10">
              Start your conversation by asking something about your PDF!
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about the PDF, or request a new generated PDF…"
            disabled={sendMessage.isPending}
          />
          <Button
            onClick={handleSend}
            disabled={sendMessage.isPending || !input.trim()}
            title="Let the AI answer your question!"
            className="cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatInterface);