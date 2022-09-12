/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

import TradeContainer from './TradeContainer'
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import { firstTourSteps, mirroringTourSteps } from 'utils/tourSteps'
import { useIdleTimer } from 'react-idle-timer'
import { useDispatch, useSelector } from 'react-redux'
import {
  logout,
  saveStripeUsers,
  updateIsTourFinished,
  updateIsTourStep5,
  updateOnSecondTour,
  updateShowMarketItems,
} from 'store/actions'

const Trade = () => {
  const dispatch = useDispatch()
  const [stepIndex, setStepIndex] = useState(0)
  const [mirroringStepIndex, setMirroringStepIndex] = useState(0)
  const [run, setRun] = useState(true)
  const [run2, setRun2] = useState(true)
  const [stepsFirstTour] = useState(firstTourSteps)
  const [stepsMirroringTour] = useState(mirroringTourSteps)
  const [chartMirroringTourNeeded] = useState(false)
  const { onTour, isTourStep5 } = useSelector((state) => state.appFlow)
  const { isChartReady } = useSelector((state) => state.charts)
  const { showMarketItems } = useSelector((state) => state.market)
  const handleOnIdle = (event) => {
    dispatch(logout())
  }

  useIdleTimer({
    timeout: 1000 * 60 * 60 * 24 * 2,
    onIdle: handleOnIdle,
    debounce: 500,
    crossTab: {
      emitOnAllTabs: true,
    },
  })

  const isNotMobile = useMediaQuery({ query: `(min-width: 992px)` })

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update state to advance the tour
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      // Need to set our running state to false, so we can restart if we click start again.
      setRun(false)
      dispatch(updateShowMarketItems(false))
      dispatch(updateIsTourFinished(true))
      //setOnTour(false)
      setTimeout(() => {
        dispatch(updateOnSecondTour(true))
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
      dispatch(saveStripeUsers({ chartMirroringTourFinished: true }))
    }
  }

  useEffect(() => {
    if (stepIndex === 4) {
      dispatch(updateIsTourStep5(!isTourStep5))
      dispatch(updateShowMarketItems(!showMarketItems))
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
