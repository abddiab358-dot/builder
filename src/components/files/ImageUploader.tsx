import { useState } from 'react'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { useFileSystem } from '../../context/FileSystemContext'

interface Props {
  projectId: string
}

export function ImageUploader({ projectId }: Props) {
  const { addFiles, data, isLoading } = useProjectFiles(projectId)
  const { projectFilesDir } = useFileSystem()
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<Record<string, string>>({})

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files.length) return
    setUploading(true)
    try {
      await addFiles(Array.from(files), projectId)
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  const ensurePreview = async (fileName: string) => {
    if (!projectFilesDir) return
    if (previews[fileName]) return
    try {
      const dir = await projectFilesDir.getDirectoryHandle(projectId, { create: false })
      const fileHandle = await dir.getFileHandle(fileName)
      const file = await fileHandle.getFile()
      const url = URL.createObjectURL(file)
      setPreviews((prev) => ({ ...prev, [fileName]: url }))
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-3 text-right">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-800">الملفات والصور الخاصة بالمشروع</div>
        <label className="px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700 cursor-pointer">
          {uploading ? 'جاري الرفع...' : 'رفع ملفات / صور'}
          <input
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
            disabled={uploading}
          />
        </label>
      </div>
      {isLoading && <div className="text-xs text-slate-500">جاري تحميل الملفات...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(data ?? []).map((file) => {
          const isImage = file.mimeType.startsWith('image/')
          if (isImage) {
            void ensurePreview(file.fileName)
          }
          return (
            <div
              key={file.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col text-right"
            >
              {isImage && previews[file.fileName] ? (
                <img
                  src={previews[file.fileName]}
                  alt={file.fileName}
                  className="w-full h-24 object-cover"
                />
              ) : (
                <div className="w-full h-24 flex items-center justify-center text-xs text-slate-500 bg-slate-50">
                  ملف
                </div>
              )}
              <div className="px-2 py-1 text-[11px] text-slate-700 truncate">{file.fileName}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
