import {
  CallType,
  type InfinityParticipant,
  ParticipantActivities,
  registerPlugin
} from '@pexip/plugin-api'

let participants: InfinityParticipant[] = []
let observerRosterList: MutationObserver | null = null

// Hide all chat-activity messages by CSS
const styleChatActivity = document.createElement('style')
styleChatActivity.innerHTML =
  '[data-testid="chat-activity-message"] { display: none}'

// Hide all participant rows by default. Only rows marked as verified non-API will be shown.
const styleApiUsers = document.createElement('style')
styleApiUsers.innerHTML = [
  '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"] { display: none !important; }',
  '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"][data-visible="true"] { display: flex !important; }'
].join('\n')

const [body] = parent.document.getElementsByTagName('body')
body.appendChild(styleChatActivity)
body.appendChild(styleApiUsers)

const version = 0
const plugin = await registerPlugin({
  id: 'hide-api-users',
  version
})

const timeout = 1000

plugin.events.participantsActivities.add((activities) => {
  activities.forEach((change) => {
    const { roomId, activity } = change
    if (roomId === 'main') {
      const { type, participant } = activity
      switch (type) {
        case ParticipantActivities.Join:
          participants.push(participant)
          break
        case ParticipantActivities.Leave:
          participants = participants.filter((p) => p.uuid !== participant.uuid)
          break
        case ParticipantActivities.Update:
          participants = participants.map((p) =>
            p.uuid === participant.uuid ? participant : p
          )
          break
      }
    }
  })
  updateApiUsersStyle()
  changeNumberParticipants()
})

plugin.events.authenticatedWithConference.add(() => {
  participants = []
  observerRosterList?.disconnect()
  setTimeout(() => {
    observerRosterList = subscribeMeetingWrapperChanges()
  }, timeout)
})

/**
 * Observe when the container in which is the roster list change
 */
const subscribeMeetingWrapperChanges = (): MutationObserver => {
  const meetingWrapper = parent.document.querySelector(
    '[data-testid="meeting-wrapper"]'
  )
  const observeOptions: MutationObserverInit = {
    childList: true,
    subtree: true
  }
  const callback = (): void => {
    // Disconnect before modifying the DOM to avoid infinite loop
    observer.disconnect()
    updateApiUsersStyle()
    changeNumberParticipants()
    if (meetingWrapper !== null) {
      observer.observe(meetingWrapper, observeOptions)
    }
  }
  const observer = new MutationObserver(callback)
  if (meetingWrapper !== null) {
    observer.observe(meetingWrapper, observeOptions)
  }
  return observer
}

/**
 * Mark non-API participant rows as visible.
 * All rows are hidden by default via CSS. Only verified non-API rows get shown.
 * If a participant is not yet known (not in the array), it stays hidden.
 */
const updateApiUsersStyle = (): void => {
  const participantsElements = parent.document.querySelectorAll(
    '[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"]'
  )
  participantsElements.forEach((element) => {
    const [span] = element.getElementsByTagName('span')
    const displayName = span.getAttribute('title')
    const participant = participants.find((p) => p.displayName === displayName)
    const isConfirmedNonApi =
      participant !== undefined && participant.callType !== CallType.api
    if (isConfirmedNonApi) {
      element.setAttribute('data-visible', 'true')
    } else {
      element.removeAttribute('data-visible')
    }
  })
}

/**
 * Change the number of participants shown in the button. API participants are not counted.
 * If the number of participants is 1, the text "participant" is shown instead of "participants".
 */
const changeNumberParticipants = (): void => {
  const noApiParticipants = participants.filter((participant) => {
    const { callType } = participant
    return callType !== CallType.api
  })
  const { length: numberParticipants } = noApiParticipants

  // Change it into the badge of the button participants
  const badgeCounter = parent.document.querySelector(
    '[data-testid="badge-counter-number"] > span'
  )
  if (badgeCounter !== null) {
    badgeCounter.textContent = numberParticipants.toString()
  }

  // Change it into the header of the participant panel
  const headerTitle = parent.document.querySelector(
    '[data-testid="panel-header-title"]'
  )
  if (headerTitle !== null) {
    headerTitle.textContent = headerTitle.textContent.replace(
      /\d+/v,
      numberParticipants.toString()
    )
  }

  // Change it into the accordion title
  const accordionTitle = parent.document.querySelector(
    '[data-testid="participant-panel-in-meeting"] span'
  )
  if (accordionTitle !== null) {
    accordionTitle.textContent = accordionTitle.textContent.replace(
      /\d+/v,
      numberParticipants.toString()
    )
  }
}
