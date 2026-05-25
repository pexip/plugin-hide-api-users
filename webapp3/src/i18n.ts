import i18next from 'i18next'
import { logger } from './logger'

const TRANSLATION_RE = /\/translation\.[^.]+\.json$/v
const MAX_RETRIES = 10
const RETRY_DELAY = 200
const INITIAL_RETRIES = 0
const RETRY_INCREMENT = 1

let currentTranslationUrl: string | null = null

const findLatestTranslationUrl = (): string | null => {
  try {
    const entry = parent.performance
      .getEntriesByType('resource')
      .findLast((e) => TRANSLATION_RE.test(e.name))
    if (entry !== undefined) return entry.name
  } catch {
    // Ignore errors accessing parent
  }
  return null
}

const fetchTranslation = async (url: string, lng: string): Promise<void> => {
  currentTranslationUrl = url
  try {
    const res = await fetch(url)
    const data: unknown = await res.json()
    i18next.addResourceBundle(lng, 'translation', data, true, true)
    logger.info(`Loaded parent translations for '${lng}'`)
  } catch (error) {
    logger.error('Failed to load parent translations')
    logger.error(error)
  }
}

export const loadParentTranslations = (
  lng: string,
  retries = INITIAL_RETRIES
): void => {
  const url = findLatestTranslationUrl()
  if (url !== null && url !== currentTranslationUrl) {
    void fetchTranslation(url, lng)
    return
  }
  if (retries < MAX_RETRIES) {
    setTimeout(() => {
      loadParentTranslations(lng, retries + RETRY_INCREMENT)
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
