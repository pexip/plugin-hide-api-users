import i18next from 'i18next'
import { logger } from './logger'

const TRANSLATION_RE = /\/translation\.[^.]+\.json$/v
const MAX_RETRIES = 10
const RETRY_DELAY = 200
const INITIAL_RETRIES = 0
const RETRY_INCREMENT = 1
const FIRST_ENTRY = 0

let currentTranslationUrl: string | null = null

const findTranslationUrl = (): string | null => {
  try {
    const entries = parent.performance
      .getEntriesByType('resource')
      .filter((e) => TRANSLATION_RE.test(e.name))

    if (currentTranslationUrl === null) {
      // Initial load: the first entry is the user's selected language
      // (the English fallback is loaded after)
      return entries.length > FIRST_ENTRY ? entries[FIRST_ENTRY].name : null
    }

    // Language change: pick the last entry (most recent fetch)
    const entry = entries.findLast((e) => e.name !== currentTranslationUrl)
    return entry === undefined ? null : entry.name
  } catch {
    // Ignore errors accessing parent
  }
  return null
}

const fetchTranslation = async (
  url: string,
  lng: string,
  onLoaded?: () => void
): Promise<void> => {
  currentTranslationUrl = url
  try {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(
        `Failed to fetch parent translations for '${lng}' from '${url}': ${res.status} ${res.statusText}`
      )
    }
    const data: unknown = await res.json()
    i18next.addResourceBundle(lng, 'translation', data, true, true)
    logger.info(`Loaded parent translations for '${lng}'`)
    onLoaded?.()
  } catch (error) {
    logger.error(`Failed to load parent translations for '${lng}'`)
    logger.error(error)
  }
}

export const loadParentTranslations = (
  lng: string,
  onLoaded?: () => void,
  retries = INITIAL_RETRIES
): void => {
  const url = findTranslationUrl()
  if (url !== null && url !== currentTranslationUrl) {
    void fetchTranslation(url, lng, onLoaded)
    return
  }
  if (retries < MAX_RETRIES) {
    setTimeout(() => {
      loadParentTranslations(lng, onLoaded, retries + RETRY_INCREMENT)
    }, RETRY_DELAY)
  } else {
    logger.warn('Parent translation file not found after retries')
  }
}

export const initI18n = async (): Promise<void> => {
  logger.info('Initializing i18n...')
  await i18next.init({
    fallbackLng: 'en'
  })
}

initI18n().catch((error: unknown) => {
  logger.error('Failed to initialize i18n')
  logger.error(error)
})

export { i18next }
