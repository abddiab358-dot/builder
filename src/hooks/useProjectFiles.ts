import { useFileSystem } from '../context/FileSystemContext'
import { useJsonCollection } from './useJsonCollection'
import { ProjectFileMeta } from '../types/domain'
import { createId } from '../utils/id'
import { writeFileToDirectory } from '../storage/fileSystem'
import { useActivity } from './useActivity'

export function useProjectFiles(projectId?: string) {
  const { projectFilesMeta, projectFilesDir } = useFileSystem()
  const collection = useJsonCollection<ProjectFileMeta>('projectFiles', projectFilesMeta)
  const { log } = useActivity()

  const filtered = {
    ...collection,
    data: (collection.data ?? []).filter((f) => (projectId ? f.projectId === projectId : true)),
  }

  const addFiles = async (files: File[], pid: string) => {
    if (!projectFilesDir) throw new Error('لم يتم اختيار مجلد ملفات المشاريع')
    const now = new Date().toISOString()

    const metas: ProjectFileMeta[] = []
    for (const file of files) {
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
    }

    await collection.save((items) => [...items, ...metas])
    log({ action: 'رفع ملفات', entity: 'file', entityId: pid, details: `عدد الملفات: ${metas.length}` }).catch(() => {})
  }

  const removeFile = async (id: string) => {
    await collection.save((items) => items.filter((f) => f.id !== id))
    log({ action: 'حذف ملف', entity: 'file', entityId: id }).catch(() => {})
  }

  return {
    ...filtered,
    addFiles,
    removeFile,
  }
}
