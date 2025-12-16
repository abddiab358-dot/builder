import { FilePicker } from '@capawesome/capacitor-file-picker'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { isNative } from './platform'

export interface PickedFile {
    data: string // Base64 or Text
    name: string
    mimeType: string
}

export async function pickJsonFileNative(): Promise<PickedFile | null> {
    if (!isNative) return null

    try {
        const result = await FilePicker.pickFiles({
            types: ['application/json'],
            multiple: false,
            readData: true
        })

        const file = result.files[0]
        if (!file) return null

        // If readData is true, data should be populated (base64)
        return {
            data: file.data || '',
            name: file.name,
            mimeType: file.mimeType
        }
    } catch (error) {
        console.error('Native pick failed:', error)
        return null
    }
}

export async function saveFileNative(filename: string, data: string): Promise<string | null> {
    if (!isNative) return null

    try {
        // Save to Documents/ContractorApp
        const path = `ContractorApp/${filename}`

        // Create directory first if needed (ignore error if exists)
        try {
            await Filesystem.mkdir({
                path: 'ContractorApp',
                directory: Directory.Documents,
                recursive: true
            })
        } catch (e) {
            // ignore
        }

        const result = await Filesystem.writeFile({
            path: path,
            data: data,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        })

        return result.uri
    } catch (error) {
        console.error('Native save failed:', error)
        return null
    }
}

// For Sync specific logic - Getting the sync folder path on Android
// We will simply return a fixed path for Android
export function getAndroidSyncPath(): string {
    return 'ContractorApp/Sync'
}
