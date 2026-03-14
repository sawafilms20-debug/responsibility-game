import { useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { gameData } from './data/gameData'
import { GameProvider, useGame } from './contexts/GameContext'
import { AchievementsProvider } from './contexts/AchievementsContext'
import AchievementPopup from './components/AchievementPopup'
import MainLanding from './components/MainLanding'
import ValuesPage from './components/ValuesPage'
import LandingPage from './components/LandingPage'
import VideoScreen from './components/VideoScreen'
import ActivityWrapper from './components/ActivityWrapper'
import NameEntryScreen from './components/NameEntryScreen'
import CompletionScreen from './components/CompletionScreen'

/*
  Screen flow:
  mainLanding → values → gameLanding → video → activity → nameEntry → complete
*/

function AppInner() {
  const [screen, setScreen] = useState('mainLanding')
  const [currentActivity, setCurrentActivity] = useState(0)
  const [scores, setScores] = useState({})
  const [stars, setStars] = useState(0)
  const [studentName, setStudentName] = useState('')
  const game = useGame()

  /* ── Navigation handlers ── */
  const handleMainNavigate = useCallback((sectionId) => {
    if (sectionId === 'values') {
      setScreen('values')
    }
    // Other sections can be added later
  }, [])

  const handleSelectValue = useCallback((valueId) => {
    if (valueId === 'responsibility') {
      setScreen('gameLanding')
    }
  }, [])

  const handleBackToMain = useCallback(() => {
    setScreen('mainLanding')
  }, [])

  const handleStart = useCallback(() => {
    setScreen('video')
  }, [])

  const handleSkipVideo = useCallback(() => {
    setScreen('activity')
    setCurrentActivity(0)
  }, [])

  const handleActivityComplete = useCallback((activityId, score) => {
    setScores(prev => ({ ...prev, [activityId]: score }))
    if (score >= 0.7) {
      setStars(prev => prev + 1)
    }
    setTimeout(() => {
      setCurrentActivity(prev => {
        if (prev < gameData.activities.length - 1) {
          return prev + 1
        } else {
          setScreen('nameEntry')
          return prev
        }
      })
    }, 1500)
  }, [])

  const handleNext = useCallback(() => {
    if (currentActivity < gameData.activities.length - 1) {
      setCurrentActivity(prev => prev + 1)
    } else {
      setScreen('nameEntry')
    }
  }, [currentActivity])

  const handlePrev = useCallback(() => {
    if (currentActivity > 0) {
      setCurrentActivity(prev => prev - 1)
    }
  }, [currentActivity])

  const handleGoToActivity = useCallback((index) => {
    setCurrentActivity(index)
  }, [])

  const handleNameSubmit = useCallback((name) => {
    setStudentName(name)
    setScreen('complete')
  }, [])

  const handleRestart = useCallback(() => {
    setScreen('gameLanding')
    setCurrentActivity(0)
    setScores({})
    setStars(0)
    setStudentName('')
    game.resetGame()
  }, [game])

  const handleHome = useCallback(() => {
    setScreen('mainLanding')
    setCurrentActivity(0)
    setScores({})
    setStars(0)
    setStudentName('')
    game.resetGame()
  }, [game])

  return (
    <div className="app">
      <AnimatePresence mode="wait">
        {screen === 'mainLanding' && (
          <MainLanding key="mainLanding" onNavigate={handleMainNavigate} />
        )}
        {screen === 'values' && (
          <ValuesPage key="values" onSelectValue={handleSelectValue} onBack={handleBackToMain} />
        )}
        {screen === 'gameLanding' && (
          <LandingPage key="gameLanding" onStart={handleStart} onBack={() => setScreen('values')} />
        )}
        {screen === 'video' && (
          <VideoScreen key="video" onSkip={handleSkipVideo} onBack={() => setScreen('gameLanding')} />
        )}
        {screen === 'activity' && (
          <ActivityWrapper
            key={`activity-${currentActivity}`}
            activity={gameData.activities[currentActivity]}
            currentIndex={currentActivity}
            totalActivities={gameData.activities.length}
            scores={scores}
            stars={stars}
            onComplete={handleActivityComplete}
            onNext={handleNext}
            onPrev={handlePrev}
            onGoTo={handleGoToActivity}
            onBack={() => setScreen('gameLanding')}
          />
        )}
        {screen === 'nameEntry' && (
          <NameEntryScreen key="nameEntry" onSubmit={handleNameSubmit} onBack={() => setScreen('activity')} />
        )}
        {screen === 'complete' && (
          <CompletionScreen
            key="complete"
            scores={scores}
            stars={stars}
            totalActivities={gameData.activities.length}
            studentName={studentName}
            onRestart={handleRestart}
            onHome={handleHome}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <GameProvider>
      <AchievementsProvider>
        <AppInner />
        <AchievementPopup />
      </AchievementsProvider>
    </GameProvider>
  )
}

export default App
