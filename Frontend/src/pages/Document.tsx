import { useState, useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDocument } from "@/hooks/useDocuments";
import { useConversation, useCreateConversation } from "@/hooks/useConversations";
import PDFViewer from "@/components/PDFViewer";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const Document = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);

  const { data: document, isLoading, error } = useDocument(documentId!);
  const { data: conversation } = useConversation(documentId!);
  const createConversation = useCreateConversation();

  const conversationId = conversation?._id || "";

  useEffect(() => {
    if (!documentId || !document) {
      setPdfData(null);
      return;
    }
    let cancelled = false;
    api
      .downloadDocumentPdf(documentId)
      .then((buf) => {
        if (!cancelled) setPdfData(buf);
      })
      .catch(() => {
        if (!cancelled) {
          setPdfData(null);
          toast.error("Failed to load PDF");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [documentId, document?._id]);

  useEffect(() => {
    if (document && !conversation && !createConversation.isPending) {
      createConversation.mutate(documentId!);
    }
  }, [document, conversation, documentId, createConversation]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load document");
      navigate("/");
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="border-b border-border bg-background px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold truncate max-w-md">
            {document?.title}
          </h1>
        </div>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r border-border">
          <PDFViewer
            file={pdfData}
            documentKey={documentId}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
        <div className="w-[400px]">
          {conversationId && (
            <ChatInterface
              documentId={documentId!}
              conversationId={conversationId}
              onCitationClick={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Document);
