import { useDropzone } from "react-dropzone"
import { X } from "lucide-react"

export interface ExistingFile {
  id: string;
  original_name: string;
  url: string;
}

interface FileDropzoneProps {
  files: (File | ExistingFile)[]
  onFilesAdded: (files: File[]) => void
  onFileRemove: (fileToRemove: File | ExistingFile) => void
  accept?: string[]
  onInvalidFiles?: (files: File[]) => void
}

export function FileDropzone({
  files,
  onFilesAdded,
  onFileRemove,
  accept = [],
  onInvalidFiles,
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const [valid, invalid] = partitionFiles(acceptedFiles, accept)

      if (valid.length > 0) {
        onFilesAdded(valid)
      }

      if (invalid.length > 0 && onInvalidFiles) {
        onInvalidFiles(invalid)
      }
    },
    multiple: true,
  })

  const handleRemove = (file: File | ExistingFile) => {
    onFileRemove(file)
  }

  return (
    <div
      {...getRootProps()}
      className={`border border-dashed p-4 rounded cursor-pointer text-center ${
        isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag & drop files here, or click to select files</p>
      )}

      {files.length > 0 && (
        <ul className="text-sm text-gray-500 mt-2">
          {files.map((file, idx) => {
            // Para mostrar nombre correcto según el tipo
            const fileName = "id" in file ? file.original_name : file.name

            return (
              <li
                key={"id" in file ? file.id : file.name + idx}
                className="flex justify-between items-center border px-2 py-1 rounded bg-gray-100"
              >
                <span className="truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(file)
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function partitionFiles(files: File[], allowedExts: string[]): [File[], File[]] {
  if (allowedExts.length === 0) return [files, []]

  const lowerExts = allowedExts.map((ext) => ext.toLowerCase())

  const valid: File[] = []
  const invalid: File[] = []

  for (const file of files) {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (lowerExts.includes(ext)) {
      valid.push(file)
    } else {
      invalid.push(file)
    }
  }

  return [valid, invalid]
}
