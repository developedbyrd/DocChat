import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import DocumentUpload from "@/components/DocumentUpload";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const Home = () => {
  const navigate = useNavigate();
  const { data: documents = [], isLoading: loading } = useDocuments();
  const deleteDocument = useDeleteDocument();

  const handleDelete = useCallback((id: string) => {
    deleteDocument.mutate(id, {
      onSuccess: () => toast.success("Document deleted"),
      onError: () => toast.error("Failed to delete document"),
    });
  }, [deleteDocument]);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const handleUploadComplete = useCallback((id: string) => {
    navigate(`/document/${id}`);
  }, [navigate]);

  const handleDocumentClick = useCallback((id: string) => {
    navigate(`/document/${id}`);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">DocChat</h1>
            <p className="text-sm text-muted-foreground">Chat with your PDFs</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        {documents.length === 0 ? (
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Document</CardTitle>
                  <CardDescription>Add another PDF to analyze</CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload
                    onUploadComplete={handleUploadComplete}
                  />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>Click to open and chat</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {documents.map((doc: any) => (
                        <div
                          key={doc._id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(var(--hover-bg))] transition-colors cursor-pointer group"
                          onClick={() => handleDocumentClick(doc._id)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {doc.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(doc.uploadedAt)} •{" "}
                                {formatFileSize(doc.fileSize)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            disabled={deleteDocument.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Home);
