import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { ProjectFileMeta } from '../types/domain'
import { createId } from '../utils/id'
import { writeFileToDirectory } from '../storage/fileSystem'
import { useActivity } from './useActivity'

export function useProjectFiles(projectId?: string) {
  const { projectFilesMeta, projectFilesDir, isReady } = useFileSystem()
  const collection = useJsonCollection<ProjectFileMeta>('projectFiles', projectFilesMeta)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((f) => (projectId ? f.projectId === projectId : true)),
  }

  const addFiles = async (files: File[], pid: string) => {
    if (!projectFilesDir) throw new Error('لم يتم اختيار مجلد ملفات المشاريع')
    if (!isReady) throw new Error('النظام غير جاهز بعد')
    
    const now = new Date().toISOString()

    const metas: ProjectFileMeta[] = []
    for (const file of files) {
      try {
        const { name } = await writeFileToDirectory(projectFilesDir, file, {
          subFolder: pid,
        })
        metas.push({
          id: createId(),
          projectId: pid,
          fileName: name,
          mimeType: file.type,
          createdAt: now,
        })
      } catch (error) {
        console.error('خطأ في كتابة الملف:', error)
        throw new Error(`فشل رفع الملف: ${file.name}`)
      }
    }

    // حفظ البيانات الوصفية
    try {
      await collection.save((items) => [...items, ...metas])
    } catch (error) {
      console.error('خطأ في حفظ بيانات الملفات:', error)
      throw new Error('فشل حفظ بيانات الملفات')
    }

    // تسجيل النشاط بدون انتظار
    log({ action: 'رفع ملفات', entity: 'file', entityId: pid, details: `عدد الملفات: ${metas.length}` }).catch(() => {})
  }

  const removeFile = async (id: string) => {
    try {
      await collection.save((items) => items.filter((f) => f.id !== id))
      log({ action: 'حذف ملف', entity: 'file', entityId: id }).catch(() => {})
    } catch (error) {
      console.error('خطأ في حذف الملف:', error)
      throw new Error('فشل حذف الملف')
    }
  }

  return {
    ...filtered,
    addFiles,
    removeFile,
  }
}
