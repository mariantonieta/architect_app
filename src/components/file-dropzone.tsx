import { useDropzone } from "react-dropzone"

interface FileDropzoneProps {
  files: File[]
  onFilesAdded: (files: File[]) => void
}

export function FileDropzone({ files, onFilesAdded }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      onFilesAdded([...files, ...acceptedFiles])
    },
    multiple: true,
  })

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
          {files.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
