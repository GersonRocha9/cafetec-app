// =====================================================
// WEATHER API CONFIG
// =====================================================

const RAPIDAPI_KEY = process.env.EXPO_PUBLIC_X_RAPIDAPI_KEY!
const RAPIDAPI_HOST = process.env.EXPO_PUBLIC_X_RAPIDAPI_HOST!

if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
  throw new Error(
    'Missing Weather API environment variables. Please check your .env file.'
  )
}

export const weatherConfig = {
  apiKey: RAPIDAPI_KEY,
  apiHost: RAPIDAPI_HOST,
  baseUrl: `https://${RAPIDAPI_HOST}`,
}
