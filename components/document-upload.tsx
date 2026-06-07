"use client"

import { useState, useCallback, useRef } from "react"
import { Upload, AlertCircle, FileText, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const ALLOWED_FORMATS = [".pdf", ".doc", ".docx"]
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

interface DocumentUploadProps {
  onFileSelected?: (file: File) => void
  isLoading?: boolean
}

export function DocumentUpload({ onFileSelected, isLoading = false }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
    const fileMimeType = file.type

    // Check file extension
    if (!ALLOWED_FORMATS.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(", ")}`,
      }
    }

    // Check MIME type for additional validation
    if (!ALLOWED_MIME_TYPES.includes(fileMimeType) && file.type !== "") {
      return {
        valid: false,
        error: "Invalid file type. Please upload a PDF or Word document.",
      }
    }

    // Check file size (max 50MB)
    const maxSizeInMB = 50
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeInMB}MB limit.`,
      }
    }

    return { valid: true }
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      setError(null)
      const validation = validateFile(file)

      if (!validation.valid) {
        setError(validation.error || "Invalid file")
        setSelectedFile(null)
        return
      }

      setSelectedFile(file)
      onFileSelected?.(file)
    },
    [onFileSelected]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-12 text-center space-y-4 transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-primary/20 hover:border-primary/40",
          selectedFile && "border-green-500 bg-green-500/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_FORMATS.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        {!selectedFile ? (
          <>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload your document</h3>
              <p className="text-muted-foreground text-sm">
                Drag and drop your PDF or Word document here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Allowed formats: PDF, DOC, DOCX (Max 50MB)
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleBrowseClick}
              disabled={isLoading}
              className="mt-4 btn-glow-pulse"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Choose File"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">File Selected</h3>
              <p className="text-muted-foreground font-medium text-sm break-words">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-4">
              <Button
                size="lg"
                onClick={handleRemoveFile}
                variant="outline"
                disabled={isLoading}
              >
                Remove File
              </Button>
              <Button
                size="lg"
                disabled={isLoading}
                onClick={() => onFileSelected?.(selectedFile!)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Process Document"
                )}
              </Button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
