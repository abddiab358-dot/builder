export function isFileSystemAPISupported(): boolean {
  return typeof window !== 'undefined' && !!window.showOpenFilePicker
}

export async function ensurePermission(handle: FileSystemHandle, mode: 'read' | 'readwrite' = 'readwrite') {
  if (!handle.queryPermission || !handle.requestPermission) return true
  const opts = { mode }
  const status = await handle.queryPermission(opts)
  if (status === 'granted') return true
  if (status === 'denied') return false
  const result = await handle.requestPermission(opts)
  return result === 'granted'
}

export async function openJSONFile(): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemAPISupported()) return null
  const [handle] = await showOpenFilePicker({
    multiple: false,
    types: [
      {
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      },
    ],
  })
  const ok = await ensurePermission(handle, 'readwrite')
  return ok ? handle : null
}

export async function createJSONFile(suggestedName: string): Promise<FileSystemFileHandle | null> {
  if (!isFileSystemAPISupported()) return null
  const handle = await showSaveFilePicker({
    suggestedName,
    types: [
      {
        description: 'JSON Files',
        accept: { 'application/json': ['.json'] },
      },
    ],
  })
  const ok = await ensurePermission(handle, 'readwrite')
  return ok ? handle : null
}

export async function readJSONFile<T>(handle: FileSystemFileHandle): Promise<T | null> {
  const ok = await ensurePermission(handle, 'read')
  if (!ok) return null
  const file = await handle.getFile()
  const text = await file.text()
  if (!text.trim()) return null
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function saveJSONFile<T>(handle: FileSystemFileHandle, data: T): Promise<void> {
  const ok = await ensurePermission(handle, 'readwrite')
  if (!ok) throw new Error('Permission denied')
  const writable = await handle.createWritable()
  await writable.write(JSON.stringify(data, null, 2))
  await writable.close()
}

export async function openDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAPISupported()) return null
  const dir = await showDirectoryPicker({ mode: 'readwrite' })
  const ok = await ensurePermission(dir, 'readwrite')
  return ok ? dir : null
}

export interface DirectoryEntryInfo {
  name: string
  kind: 'file' | 'directory'
  handle: FileSystemHandle
}

export async function readDirectoryFiles(dir: FileSystemDirectoryHandle): Promise<DirectoryEntryInfo[]> {
  const ok = await ensurePermission(dir, 'read')
  if (!ok) return []
  const result: DirectoryEntryInfo[] = []
  for await (const [name, handle] of dir.entries()) {
    result.push({ name, kind: handle.kind, handle })
  }
  return result
}

export interface WriteFileOptions {
  subFolder?: string
  fileName?: string
}

export async function writeFileToDirectory(
  dir: FileSystemDirectoryHandle,
  file: File,
  options: WriteFileOptions = {},
): Promise<{ handle: FileSystemFileHandle; name: string }> {
  const ok = await ensurePermission(dir, 'readwrite')
  if (!ok) throw new Error('Permission denied to directory')

  let targetDir = dir
  if (options.subFolder) {
    targetDir = await dir.getDirectoryHandle(options.subFolder, { create: true })
  }

  const fileHandle = await targetDir.getFileHandle(options.fileName ?? file.name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(file)
  await writable.close()
  return { handle: fileHandle, name: fileHandle.name }
}

export async function createIfNotExists<T>(handle: FileSystemFileHandle, initialData: T): Promise<void> {
  const existing = await readJSONFile<T>(handle)
  if (existing == null) {
    await saveJSONFile(handle, initialData)
  }
}
