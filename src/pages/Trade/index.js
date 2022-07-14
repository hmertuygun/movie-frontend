import React, { useContext, useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import { UserContext } from 'contexts/UserContext'
import TradeContainer from './TradeContainer'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import {
  firstTourSteps,
  secondTourSteps,
  mirroringTourSteps,
} from 'utils/tourSteps'
import { firebase } from 'services/firebase'
import { useIdleTimer } from 'react-idle-timer'
import { consoleLogger } from 'utils/logger'

const Trade = () => {
  const {
    onTour,
    isTourStep5,
    setIsTourStep5,
    setOnSecondTour,
    showMarketItems,
    setShowMarketItems,
    setIsTourFinished,
    isChartReady,
    logout,
  } = useContext(UserContext)
  const [stepIndex, setStepIndex] = useState(0)
  const [mirroringStepIndex, setMirroringStepIndex] = useState(0)
  const [run, setRun] = useState(true)
  const [run2, setRun2] = useState(true)
  const [stepsFirstTour] = useState(firstTourSteps)
  const [stepsSecondTour] = useState(secondTourSteps)
  const [stepsMirroringTour] = useState(mirroringTourSteps)
  const [chartMirroringTourNeeded, setChartMirroringTourNeeded] =
    useState(false)

  const handleOnIdle = (event) => {
    logout()
  }

  useIdleTimer({
    timeout: 1000 * 60 * 60 * 24 * 2,
    onIdle: handleOnIdle,
    debounce: 500,
    crossTab: {
      emitOnAllTabs: true,
    },
  })

  const userId = firebase.auth().currentUser?.uid
  useEffect(() => {
    ;(async () => {
      await firebase
        .firestore()
        .collection('stripe_users')
        .doc(userId)
        .get()
        .then((doc) => {
          const userData = doc.data()
          if (
            userData?.chartMirroringSignUp &&
            !userData?.chartMirroringTourFinished
          ) {
            setChartMirroringTourNeeded(true)
          }
        })
    })()
  }, [userId])

  const isNotMobile = useMediaQuery({ query: `(min-width: 992px)` })

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun(false)
      setShowMarketItems(false)
      setIsTourFinished(true)
      //setOnTour(false)
      setTimeout(() => {
        setOnSecondTour(true)
        //300000
      }, 300000)
    }
  }

  const handleJoyrideCallback2 = (data) => {
    const { action, index, status, type } = data
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      setMirroringStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun2(false)
      firebase
        .firestore()
        .collection('stripe_users')
        .doc(userId)
        .set({ chartMirroringTourFinished: true }, { merge: true })
    }
  }

  useEffect(() => {
    if (stepIndex === 4) {
      consoleLogger('Tour Step 5')
      setIsTourStep5(!isTourStep5)
      setShowMarketItems(!showMarketItems)
    }
  }, [stepIndex])

  useEffect(() => {
    setTimeout(() => {
      onTour && document.querySelector('.react-joyride__beacon')?.click()
    }, 1000)
  }, [])

  useEffect(() => {
    setTimeout(() => {
      if (isNotMobile && chartMirroringTourNeeded && isChartReady) {
        document.querySelector('.react-joyride__beacon')?.click()
      }
    }, 1000)
  }, [isChartReady, isNotMobile, chartMirroringTourNeeded])

  const styles = {
    options: {
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      spotlightShadow: '#b8b8b885',
      primaryColor: '#1976D2',
      textColor: '#333',
      zIndex: 999999,
    },
  }

  return (
    <main className="TradeView-Container Trade">
      <TradeContainer />
      {onTour && (
        <Joyride
          run={run}
          key="tour-1"
          steps={stepsFirstTour}
          callback={handleJoyrideCallback}
          continuous={true}
          stepIndex={stepIndex}
          disableScrolling={true}
          showProgress={stepIndex < 7 ? true : false}
          locale={{ last: 'Finish', skip: 'Skip Tour' }}
          showSkipButton={true}
          spotlightClicks={true}
          styles={styles}
        />
      )}
      {isNotMobile && chartMirroringTourNeeded && isChartReady && (
        <Joyride
          run={run2}
          key="tour-3"
          steps={stepsMirroringTour}
          callback={handleJoyrideCallback2}
          continuous={true}
          stepIndex={mirroringStepIndex}
          disableScrolling={true}
          showProgress={mirroringStepIndex < 2 ? true : false}
          locale={{ last: 'Finish', skip: 'Skip Tour' }}
          showSkipButton={true}
          spotlightClicks={true}
          styles={styles}
        />
      )}
    </main>
  )
}

export default Trade
