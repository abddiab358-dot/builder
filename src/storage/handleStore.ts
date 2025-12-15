const DB_NAME = 'project_files_handles'
const STORE_NAME = 'fs'
const KEY_DIR = 'projectFilesDir'
const KEY_SYNC_DIR = 'syncDir'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB not available'))
      return
    }
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => {
      resolve(request.result)
    }
    request.onerror = () => {
      reject(request.error ?? new Error('indexedDB error'))
    }
  })
}

export async function saveDirectoryHandle(dir: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(dir, KEY_DIR)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB transaction error'))
    })
  } catch {
  }
}

export async function saveSyncDirectoryHandle(dir: FileSystemDirectoryHandle): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.put(dir, KEY_SYNC_DIR)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB transaction error'))
    })
  } catch {
  }
}

export async function getSavedDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb()
    return await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(KEY_DIR)
      request.onsuccess = () => {
        resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null)
      }
      request.onerror = () => {
        reject(request.error ?? new Error('indexedDB read error'))
      }
    })
  } catch {
    return null
  }
}

export async function getSyncDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDb()
    return await new Promise<FileSystemDirectoryHandle | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(KEY_SYNC_DIR)
      request.onsuccess = () => {
        resolve((request.result as FileSystemDirectoryHandle | undefined) ?? null)
      }
      request.onerror = () => {
        reject(request.error ?? new Error('indexedDB read error'))
      }
    })
  } catch {
    return null
  }
}

export async function clearSavedDirectoryHandle(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      store.delete(KEY_DIR)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('indexedDB transaction error'))
    })
  } catch {
  }
}
