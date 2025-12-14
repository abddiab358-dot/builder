export function isFileSystemAPISupported(): boolean {
  return typeof window !== 'undefined' && !!window.showOpenFilePicker
}

// كاش لتخزين حالة الأذونات لتجنب استدعاءات متكررة
const permissionCache = new WeakMap<FileSystemHandle, boolean>()

export async function ensurePermission(handle: FileSystemHandle, mode: 'read' | 'readwrite' = 'readwrite') {
  if (!handle.queryPermission || !handle.requestPermission) return true
  
  // تحقق من الكاش أولاً
  const cached = permissionCache.get(handle)
  if (cached === true) return true
  
  const opts = { mode }
  const status = await handle.queryPermission(opts)
  if (status === 'granted') {
    permissionCache.set(handle, true)
    return true
  }
  if (status === 'denied') return false
  const result = await handle.requestPermission(opts)
  const granted = result === 'granted'
  if (granted) {
    permissionCache.set(handle, true)
  }
  return granted
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

export async function readJSONFileHandle<T>(handle: FileSystemFileHandle): Promise<T | null> {
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

export async function saveJSONFileHandle<T>(handle: FileSystemFileHandle, data: T): Promise<void> {
  const ok = await ensurePermission(handle, 'readwrite')
  if (!ok) throw new Error('Permission denied')
  const writable = await handle.createWritable()
  try {
    await writable.write(JSON.stringify(data, null, 2))
  } finally {
    // أغلق دون الانتظار للتأكد من الأداء
    writable.close().catch(() => {})
  }
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
  const existing = await readJSONFileHandle<T>(handle)
  if (existing == null) {
    await saveJSONFileHandle(handle, initialData)
  }
}

// ==================== High-level API Functions ====================

import { getSavedDirectoryHandle } from './handleStore'

/**
 * Read JSON file from the project folder
 * Uses the saved directory handle, falls back to localStorage
 */
export async function readJSONFile(filename: string): Promise<any | null> {
  try {
    // First, try to use the directory handle
    const dir = await getSavedDirectoryHandle()
    if (dir) {
      try {
        const fileHandle = await dir.getFileHandle(filename)
        const file = await fileHandle.getFile()
        const text = await file.text()
        
        if (!text.trim()) return null
        return JSON.parse(text)
      } catch (error) {
        // File doesn't exist in directory, try localStorage fallback
      }
    }

    // Fallback: Read from localStorage using the file's stored data
    const stored = localStorage.getItem(`file:${filename}`)
    if (stored) {
      return JSON.parse(stored)
    }

    return null
  } catch (error) {
    console.error(`Failed to read ${filename}:`, error)
    return null
  }
}

/**
 * Save JSON file to the project folder
 * Uses the saved directory handle, falls back to localStorage
 */
export async function saveJSONFile(filename: string, data: any): Promise<void> {
  try {
    const jsonStr = JSON.stringify(data, null, 2)

    // Try to save to directory handle
    const dir = await getSavedDirectoryHandle()
    if (dir) {
      try {
        const fileHandle = await dir.getFileHandle(filename, { create: true })
        const writable = await fileHandle.createWritable()
        await writable.write(jsonStr)
        await writable.close()
        
        // Also save to localStorage as backup
        localStorage.setItem(`file:${filename}`, jsonStr)
        return
      } catch (error) {
        // If directory save fails, continue to localStorage
        console.warn(`Failed to save to directory: ${error}, using localStorage`)
      }
    }

    // Fallback: Save to localStorage
    localStorage.setItem(`file:${filename}`, jsonStr)
  } catch (error) {
    console.error(`Failed to save ${filename}:`, error)
    throw error
  }
}
