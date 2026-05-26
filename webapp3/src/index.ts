import {
  CallType,
  type InfinityParticipant,
  ParticipantActivities,
  registerPlugin
} from '@pexip/plugin-api'
import { logger } from './logger'
import { i18next, loadParentTranslations } from './i18n'

const { document: parentDoc } = parent
const NOT_FOUND_ID = 'webapp3-plugin-hide-api-no-participants-found'
const MEETING_WRAPPER_SELECTOR = '[data-testid="meeting-wrapper"]'
const TIMEOUT = 1000
const MIN_PARTICIPANTS = 1

const style = document.createElement('style')
style.innerHTML = [
  '[data-testid="chat-activity-message"] { display: none }',
  '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"] { display: none !important; }',
  '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"][data-visible="true"] { display: flex !important; }',
  `#${NOT_FOUND_ID} + div { display: none !important; }`
].join('\n')
parentDoc.body.appendChild(style)

const version = 0
const plugin = await registerPlugin({ id: 'hide-api-users', version })

let participants = new Map<string, InfinityParticipant>()
let me: InfinityParticipant | null = null
let observer: MutationObserver | null = null

const nonApiDisplayNames = (): Set<string> => {
  const names = new Set<string>()
  if (me?.displayName !== undefined) {
    names.add(me.displayName)
  }
  for (const p of participants.values()) {
    if (p.callType !== CallType.api && p.displayName !== undefined) {
      names.add(p.displayName)
    }
  }
  return names
}

const getNonApiCount = (): number => {
  let count = 0
  for (const p of participants.values()) {
    if (p.callType !== CallType.api) {
      count += MIN_PARTICIPANTS
    }
  }
  return Math.max(MIN_PARTICIPANTS, count)
}

const updateTextCount = (selector: string, count: number): void => {
  const el = parentDoc.querySelector(selector)
  if (el !== null) {
    el.textContent = el.textContent.replace(/\d+/v, count.toString())
  }
}

const updateNotFound = (hasNonApiParticipants: boolean): void => {
  let notFound = parentDoc.getElementById(NOT_FOUND_ID)
  if (hasNonApiParticipants) {
    notFound?.remove()
  } else {
    if (notFound === null) {
      notFound = parentDoc.createElement('div')
      notFound.id = NOT_FOUND_ID
      notFound.style.textAlign = 'center'
      const panel = parentDoc.querySelector<HTMLElement>(
        '[data-testid="participant-panel-in-meeting"]'
      )
      panel?.parentElement?.appendChild(notFound)
    }
    notFound.textContent = i18next.t(
      'meeting.participant-search.no-results',
      'No results found'
    )
  }
}

const refreshUI = (): void => {
  // Show/hide participants in the participant panel
  const rows = parentDoc.querySelectorAll(
    '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"]'
  )
  const visibleNames = nonApiDisplayNames()
  let hasNonApiParticipants = false
  for (const row of rows) {
    const span = row.querySelector('span[title]')
    const title = span?.getAttribute('title') ?? undefined
    if (title !== undefined && visibleNames.has(title)) {
      row.setAttribute('data-visible', 'true')
      hasNonApiParticipants = true
    } else {
      row.removeAttribute('data-visible')
    }
  }

  // Show/hide the participant panel and "not found" message
  const panel = parentDoc.querySelector<HTMLElement>(
    '[data-testid="participant-panel-in-meeting"]'
  )
  if (panel !== null) {
    updateNotFound(hasNonApiParticipants)
    panel.style.display = hasNonApiParticipants ? 'block' : 'none'
  }

  // Update the participant count badge and headers
  const count = getNonApiCount()
  const badge = parentDoc.querySelector(
    '[data-testid="badge-counter-number"] > span'
  )
  if (badge !== null) {
    badge.textContent = count.toString()
  }
  updateTextCount('[data-testid="panel-header-title"]', count)
  updateTextCount(
    '[data-testid="participant-panel-in-meeting"] > button span',
    count
  )
}

const observeMeetingWrapper = (): MutationObserver => {
  const opts: MutationObserverInit = { childList: true, subtree: true }
  const obs = new MutationObserver(() => {
    obs.disconnect()
    refreshUI()
    const wrapper = parentDoc.querySelector(MEETING_WRAPPER_SELECTOR)
    if (wrapper !== null) {
      obs.observe(wrapper, opts)
    }
  })
  const wrapper = parentDoc.querySelector(MEETING_WRAPPER_SELECTOR)
  if (wrapper !== null) {
    obs.observe(wrapper, opts)
  }
  return obs
}

plugin.events.participantsActivities.add((activities) => {
  for (const { roomId, activity } of activities) {
    if (roomId !== 'main') continue
    const { type, participant } = activity
    switch (type) {
      case ParticipantActivities.Join:
      case ParticipantActivities.Update:
        participants.set(participant.uuid, participant)
        break
      case ParticipantActivities.Leave:
        participants.delete(participant.uuid)
        break
    }
  }
  refreshUI()
})

plugin.events.me.add((event) => {
  const { id, participant } = event
  if (id === 'main') {
    me = participant
  }
})

plugin.events.authenticatedWithConference.add(() => {
  participants = new Map()
  observer?.disconnect()
  setTimeout(() => {
    observer = observeMeetingWrapper()
  }, TIMEOUT)
})

plugin.events.languageSelect.add(async (language) => {
  loadParentTranslations(language, refreshUI)
  await i18next.changeLanguage(language).catch(logger.error)
})
