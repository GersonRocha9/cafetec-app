// =====================================================
// SUPABASE STORAGE SERVICE
// =====================================================
import { supabase } from '../config/supabase'

export const storageService = {
  /**
   * Upload an image to Supabase Storage
   * @param bucket - The storage bucket name (e.g., 'properties', 'profiles')
   * @param filePath - The path where the file will be stored (e.g., 'user-id/property-id.jpg')
   * @param fileUri - The local file URI from image picker
   * @returns The public URL of the uploaded file
   */
  uploadImage: async (
    bucket: string,
    filePath: string,
    fileUri: string
  ): Promise<string> => {
    try {
      // Fetch the file from local URI
      const response = await fetch(fileUri)
      const blob = await response.blob()

      // Determine content type
      const contentType = blob.type || 'image/jpeg'

      // Convert blob to ArrayBuffer using FileReader (React Native compatible)
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result)
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'))
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(blob)
      })

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, arrayBuffer, {
          contentType,
          upsert: true, // Replace if file exists
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  },

  /**
   * Delete an image from Supabase Storage
   * @param bucket - The storage bucket name
   * @param filePath - The path of the file to delete
   */
  deleteImage: async (bucket: string, filePath: string): Promise<void> => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([filePath])

      if (error) {
        console.error('Storage delete error:', error)
        throw error
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      throw error
    }
  },

  /**
   * Get the public URL of an image
   * @param bucket - The storage bucket name
   * @param filePath - The path of the file
   * @returns The public URL
   */
  getPublicUrl: (bucket: string, filePath: string): string => {
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return publicUrl
  },

  /**
   * Extract file path from public URL
   * @param publicUrl - The public URL from Supabase Storage
   * @returns The file path
   */
  extractFilePathFromUrl: (publicUrl: string): string | null => {
    try {
      const url = new URL(publicUrl)
      const pathParts = url.pathname.split('/')
      // Remove '/storage/v1/object/public/bucket-name/' part
      const bucketIndex = pathParts.indexOf('public')
      if (bucketIndex >= 0 && bucketIndex + 2 < pathParts.length) {
        return pathParts.slice(bucketIndex + 2).join('/')
      }
      return null
    } catch (error) {
      console.error('Error extracting file path:', error)
      return null
    }
  },
}
