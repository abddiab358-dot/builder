import { useState } from 'react'
import { useProjectFiles } from '../../hooks/useProjectFiles'
import { useFileSystem } from '../../context/FileSystemContext'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { saveDirectoryHandle } from '../../storage/handleStore'

interface Props {
  projectId: string
}

export function ImageUploader({ projectId }: Props) {
  const { addFiles, removeFile, data, isLoading } = useProjectFiles(projectId)
  const { projectFilesDir, setHandles } = useFileSystem()
  const [uploading, setUploading] = useState(false)
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)

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

  const handleReconnect = async () => {
    try {
      const dir = await window.showDirectoryPicker()
      await saveDirectoryHandle(dir)
      setHandles({ projectFilesDir: dir })
      alert('تم ربط المجلد بنجاح! يمكنك الآن فتح الملفات.')
    } catch (err) {
      console.error(err)
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

      {!projectFilesDir && (data ?? []).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between text-xs text-amber-800 mb-3">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>لم يتم العثور على المجلد المرتبط. لا يمكن عرض الملفات.</span>
          </div>
          <button
            type="button"
            onClick={handleReconnect}
            className="px-3 py-1.5 rounded-md bg-amber-100 font-semibold hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors"
          >
            إعادة ربط المجلد
          </button>
        </div>
      )}

      {isLoading && <div className="text-xs text-slate-500">جاري تحميل الملفات...</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {(data ?? []).map((file) => {
          const isImage = file.mimeType.startsWith('image/')

          if (!previews[file.fileName]) {
            void ensurePreview(file.fileName)
          }

          const fileUrl = previews[file.fileName]

          const handleOpen = () => {
            if (fileUrl) {
              window.open(fileUrl, '_blank')
            }
          }

          return (
            <div
              key={file.id}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col text-right relative group hover:shadow-md transition-shadow"
            >
              <div
                className="cursor-pointer"
                onClick={handleOpen}
              >
                {isImage && fileUrl ? (
                  <img
                    src={fileUrl}
                    alt={file.fileName}
                    className="w-full h-24 object-cover"
                  />
                ) : (
                  <div className="w-full h-24 flex flex-col items-center justify-center text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors p-2 text-center">
                    {fileUrl ? (
                      <>
                        <span className="text-2xl mb-1">📄</span>
                        <span className="truncate w-full">{file.fileName}</span>
                      </>
                    ) : (
                      <span className="text-slate-400">
                        {projectFilesDir ? 'جاري التحميل...' : 'ملف (غير متاح)'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-slate-100">
                <div
                  className="text-[11px] text-slate-700 truncate mb-2 cursor-pointer hover:text-primary-600"
                  title={file.fileName}
                  onClick={handleOpen}
                >
                  {file.fileName}
                </div>
                <div className="flex gap-1.5 justify-between">
                  {fileUrl ? (
                    <a
                      href={fileUrl}
                      download={file.fileName}
                      className="px-2 py-1 rounded text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 flex-1 text-center font-medium transition-colors"
                      title="تخزين"
                      onClick={(e) => e.stopPropagation()}
                    >
                      تنزيل
                    </a>
                  ) : (
                    <button
                      disabled
                      className="px-2 py-1 rounded text-[10px] bg-slate-100 text-slate-400 flex-1 text-center font-medium cursor-not-allowed"
                    >
                      تنزيل
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFileToDelete(file.id)}
                    className="px-2 py-1 rounded text-[10px] bg-red-50 text-red-600 hover:bg-red-100 flex-1 text-center font-medium transition-colors"
                    title="حذف"
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={!!fileToDelete}
        title="حذف الملف"
        description="هل أنت متأكد من حذف هذا الملف؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="نعم، حذف"
        tone="danger"
        onCancel={() => setFileToDelete(null)}
        onConfirm={() => {
          if (fileToDelete) {
            removeFile(fileToDelete)
            setFileToDelete(null)
          }
        }}
      />
    </div>
  )
}
