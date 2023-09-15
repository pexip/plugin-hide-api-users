import { CallType } from '@pexip/infinity'
import { Participant, registerPlugin } from '@pexip/plugin-api'

let participants: Participant[] = []
let observerRosterList: MutationObserver
let observerHeader: MutationObserver
let observerParticipantButton: MutationObserver

// Hide all chat-activity message by CSS
const style = document.createElement('style')
style.innerHTML = '[data-testid="chat-activity-message"] { display: none}'
parent.document.getElementsByTagName('body')[0].appendChild(style)

const plugin = await registerPlugin({
  id: 'hide-api-users',
  version: 0
})

plugin.events.participants.add((users) => {
  participants = getCleanParticipants(users)
  removeApiUsersFromRosterList()
  changeNumberParticipants()
})

plugin.events.authenticatedWithConference.add(() => {
  participants = []
  observerRosterList?.disconnect()
  observerHeader?.disconnect()
  observerParticipantButton?.disconnect()
  setTimeout(() => {
    observerRosterList = subscribeMeetingWrapperChanges()
    observerHeader = subscribeHeaderChanges()
    observerParticipantButton = subscribeButtonParticipantsChanges()
  }, 1000)
})

/**
 * Observe when the container in which is the roster list change
 */
const subscribeMeetingWrapperChanges = () => {
  const observer = new MutationObserver(removeApiUsersFromRosterList)
  const meetingWrapper = parent.document.querySelector('[data-testid="meeting-wrapper"]')
  if (meetingWrapper != null) {
    observer.observe(meetingWrapper, {childList: true})
  }
  return observer
}

const subscribeHeaderChanges = () => {
  const observer = new MutationObserver(() => {
    observerParticipantButton?.disconnect()
    setTimeout(() => {
      observerParticipantButton = subscribeButtonParticipantsChanges()
    }, 0)
  })
  const header = parent.document.querySelector('[data-testid="header-core-enhancers"] > div')
  if (header != null) {
    observer.observe(header, {childList: true})
  }
  return observer
}

const subscribeButtonParticipantsChanges = () => {
  const observer = new MutationObserver(changeNumberParticipants)
  const buttonParticipants = parent.document.querySelector('[data-testid="button-participants"] > div')
  if (buttonParticipants != null) {
    observer.observe(buttonParticipants, {childList: true})
  }
  return observer
}

/**
 * Remove the API participants from the roster list and change the number of
 * participants in the roster list.
 */
const removeApiUsersFromRosterList = () => {
  console.log('Removing API participants from Roster List')
  const participantsElements = parent.document.querySelectorAll('[data-testid="participant-panel-in-meeting"] [data-testid="participant-row"]')
  if (participantsElements.length != 0) {
    let numberParticipants = 0
    participantsElements.forEach((element) => {
      const span = element.getElementsByTagName('span')[0]
      const displayName = span.getAttribute('title')
      const found = participants.some((participant) => participant.callType === CallType.api && participant.displayName === displayName)
      const parent = element.parentElement
      if (parent != null) {
        if (found) {
          parent.style.display = 'none'
        } else {
          parent.style.display = 'block'
          numberParticipants++
        }
      }
    })
    const counter = parent.document.querySelector('[data-testid="participant-panel-in-meeting"] > button > div > span') as HTMLDivElement
    if (counter != null) {
      const headerInThisMeeting = parent.document.querySelector('[data-testid="participant-panel-in-meeting"]') as HTMLDivElement
      if (numberParticipants === 0) {
        if (headerInThisMeeting) {
          headerInThisMeeting.style.display = 'none'
        }
        counter.innerHTML = numberParticipants.toString()
      } else {
        if (headerInThisMeeting) {
          headerInThisMeeting.style.display = 'block'
        }
        counter.innerHTML = numberParticipants.toString()
      }
    }
  }
}

const changeNumberParticipants = () => {
  console.log('Changing participant number')
  const numberParticipants = participants.filter((participant) => participant.callType != CallType.api ).length
  const container = parent.document.querySelector('[data-testid="button-participants"] > div > div')
  if (container != null) {
    container.innerHTML = container.innerHTML.replace(/\d+ (.*)/, `${numberParticipants} $1`)
    if (numberParticipants === 1) {
      container.innerHTML = container.innerHTML.replace(/(.*)s$/, '$1')
    }
  }
}

/**
 * Normalize the user to support v32 and v33
 */
const getCleanParticipants = (participants: any): Participant[] => {
  if (participants.id == null) {
    return participants
  } else {
    return (participants.participants as Participant[])
  }
}