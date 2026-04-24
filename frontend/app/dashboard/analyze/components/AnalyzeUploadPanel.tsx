"use client"

import { ChangeEvent, DragEvent, useRef, useState } from "react"
import { FileAudio, Loader2, UploadCloud, X } from "lucide-react"
import type { AnalysisResult } from "../types"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024 // 1GB

const ACCEPTED_EXTENSIONS = [".wav", ".mp3", ".mp4", ".m4a", ".aac"]
const ACCEPTED_MIME_TYPES = [
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "video/mp4",
]

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function hasAcceptedExtension(fileName: string) {
  const lowerName = fileName.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
}

type AnalyzeUploadPanelProps = {
  onAnalysisComplete: (result: AnalysisResult | null) => void
  onAnalysisStart?: () => void
}

export default function AnalyzeUploadPanel({
  onAnalysisComplete,
  onAnalysisStart,
}: AnalyzeUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const resetStatus = () => {
    setErrorMessage("")
    setSuccessMessage("")
  }

  const validateFile = (file: File) => {
    const mimeIsAccepted = ACCEPTED_MIME_TYPES.includes(file.type)
    const extensionIsAccepted = hasAcceptedExtension(file.name)

    if (!mimeIsAccepted && !extensionIsAccepted) {
      return "Unsupported file type. Please upload WAV, MP3, MP4, M4A, or AAC."
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return "File is too large. Maximum supported size is 1GB."
    }

    return null
  }

  const handleFileSelection = (file: File | null) => {
    resetStatus()

    if (!file) {
      setSelectedFile(null)
      return
    }

    const validationError = validateFile(file)

    if (validationError) {
      setSelectedFile(null)
      setErrorMessage(validationError)
      return
    }

    setSelectedFile(file)
    setSuccessMessage("File ready for analysis.")
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handleFileSelection(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0] || null
    handleFileSelection(file)
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    resetStatus()
    onAnalysisComplete(null)

    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    resetStatus()

    if (!selectedFile) {
      setErrorMessage("Please choose a file before starting analysis.")
      return
    }

    const token = window.localStorage.getItem("access_token")

    if (!token) {
      setErrorMessage("You must be logged in before running an analysis.")
      return
    }

    setIsSubmitting(true)
    onAnalysisStart?.()
    onAnalysisComplete(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`${API_BASE_URL}/analysis/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data: AnalysisResult | { detail?: string } | null =
        await response.json().catch(() => null)

      if (!response.ok) {
        setErrorMessage(
          typeof data === "object" &&
            data !== null &&
            "detail" in data &&
            typeof data.detail === "string"
            ? data.detail
            : "Analysis failed. Please try again."
        )
        return
      }

      onAnalysisComplete(data as AnalysisResult)
      setSuccessMessage("Analysis completed successfully.")
    } catch (error) {
      console.error("Analysis request failed:", error)
      setErrorMessage("Something went wrong while sending the file.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/4 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500">
          Upload
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">
          Add an audio file to begin
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Upload a supported file and send it through the authenticated analysis
          pipeline.
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`rounded-3xl border border-dashed p-6 transition ${
          isDragging
            ? "border-blue-400/40 bg-blue-500/10"
            : "border-white/10 bg-black/20"
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-200">
            <UploadCloud className="h-6 w-6" />
          </div>

          <h3 className="mt-4 text-lg font-medium text-white">
            Drag and drop audio here
          </h3>

          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">
            Supported formats include WAV, MP3, MP4, M4A, and AAC. Maximum file
            size is 1GB.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {["WAV", "MP3", "MP4", "M4A", "AAC"].map((type) => (
              <span
                key={type}
                className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs text-zinc-300"
              >
                {type}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".wav,.mp3,.mp4,.m4a,.aac,audio/*,video/mp4"
            onChange={handleInputChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isSubmitting}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileAudio className="h-4 w-4" />
            Choose File
          </button>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {selectedFile.name}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearSelectedFile}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/8 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Remove
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    Start Analysis
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}
    </section>
  )
}