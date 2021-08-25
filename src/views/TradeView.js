import React, { useContext, useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { UserContext } from '../contexts/UserContext'
//import { useHistory } from 'react-router-dom'
import TradeContainer from '../Trade/TradeContainer'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import {
  firstTourSteps,
  secondTourSteps,
  mirroringTourSteps,
} from '../helpers/tourSteps'

const TradeView = () => {
  const {
    onTour,
    isTourStep5,
    setIsTourStep5,
    setOnSecondTour,
    showMarketItems,
    setShowMarketItems,
    setIsTourFinished,
    isOnboardingSkipped,
    isChartReady,
  } = useContext(UserContext)
  const [stepIndex, setStepIndex] = useState(0)
  const [mirroringStepIndex, setMirroringStepIndex] = useState(0)
  const [run, setRun] = useState(true)
  const isMirroringTourFinished = localStorage.getItem(
    'mirroring_tour_finished'
  )
  const [run2, setRun2] = useState(isMirroringTourFinished ? false : true)
  const [stepsFirstTour] = useState(firstTourSteps)
  const [stepsSecondTour] = useState(secondTourSteps)
  const [stepsMirroringTour] = useState(mirroringTourSteps)

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
      localStorage.setItem('mirroring_tour_finished', true)
    }
  }

  useEffect(() => {
    if (stepIndex === 4) {
      console.log('Tour Step 5')
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
      if (
        isNotMobile &&
        isOnboardingSkipped &&
        isChartReady &&
        !isMirroringTourFinished
      ) {
        document.querySelector('.react-joyride__beacon')?.click()
      }
    }, 1000)
  }, [isChartReady, isMirroringTourFinished, isNotMobile, isOnboardingSkipped])

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
      {isNotMobile && isOnboardingSkipped && isChartReady && (
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

export default TradeView
