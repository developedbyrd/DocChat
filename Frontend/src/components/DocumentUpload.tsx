import { useState, memo, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadDocument } from "@/hooks/useDocuments";
import { toast } from "sonner";

interface DocumentUploadProps {
  onUploadComplete: (documentId: string) => void;
}

const DocumentUpload = ({ onUploadComplete }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const uploadDocument = useUploadDocument();

  const handleFile = useCallback((file: File) => {
    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }

    uploadDocument.mutate(file, {
      onSuccess: (doc) => {
        toast.success("Document uploaded successfully!");
        onUploadComplete(doc._id);
      },
      onError: () => {
        toast.error("Failed to upload document");
      },
    });
  }, [uploadDocument, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragEnter = useCallback(() => setDragActive(true), []);
  const handleDragLeave = useCallback(() => setDragActive(false), []);
  const handleDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div
        className={`w-full max-w-lg border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Upload a PDF Document
            </h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your PDF here, or click to browse
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="file-upload">
              <Button disabled={uploadDocument.isPending} asChild>
                <span>{uploadDocument.isPending ? "Uploading..." : "Choose File"}</span>
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleChange}
              disabled={uploadDocument.isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Maximum file size: 50MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(DocumentUpload);
