import { type DragEvent, useId, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileDropInputProps {
  id?: string;
  label?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
};

export function FileDropInput({
  id,
  label = "ไฟล์แนบ",
  file,
  onFileChange,
  files,
  onFilesChange,
  multiple = false,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
  disabled = false,
  className,
}: FileDropInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const selectedFiles = multiple ? files || [] : file ? [file] : [];
  const hasSelection = selectedFiles.length > 0;

  const updateFiles = (nextFiles: File[]) => {
    if (multiple) {
      onFilesChange?.(nextFiles);
      return;
    }

    onFileChange(nextFiles[0] ?? null);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled) return;
    updateFiles(Array.from(event.dataTransfer.files || []));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none" htmlFor={inputId}>
        {label}
      </label>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/30 bg-muted/20 hover:border-primary/60 hover:bg-primary/5",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <UploadCloud className="mb-3 h-8 w-8 text-primary" />
        <span className="text-sm font-medium">Choose a file or Drag it here</span>
        {hasSelection && (
          <div className="mt-2 max-w-full space-y-1 text-xs text-muted-foreground">
            {selectedFiles.map((selectedFile) => (
              <div key={`${selectedFile.name}-${selectedFile.size}-${selectedFile.lastModified}`} className="truncate">
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </div>
            ))}
          </div>
        )}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={multiple}
        onChange={(event) => updateFiles(Array.from(event.target.files || []))}
        className="hidden"
        accept={accept}
        disabled={disabled}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          รองรับ PDF, Word, Excel และรูปภาพ ขนาดไม่เกิน 10 MB
        </p>
        {hasSelection && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              updateFiles([]);
              if (inputRef.current) inputRef.current.value = "";
            }}
            disabled={disabled}
            className="h-8 shrink-0 gap-1 text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
            ลบไฟล์
          </Button>
        )}
      </div>
    </div>
  );
}
