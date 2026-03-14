import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { gameData } from './data/gameData'
import { GameProvider, useGame } from './contexts/GameContext'
import { AchievementsProvider } from './contexts/AchievementsContext'
import AchievementPopup from './components/AchievementPopup'
import MainLanding from './components/MainLanding'
import ValuesPage from './components/ValuesPage'
import LessonsPage from './components/LessonsPage'
import ActivitiesPage from './components/ActivitiesPage'
import EventsPage from './components/EventsPage'
import LandingPage from './components/LandingPage'
import VideoScreen from './components/VideoScreen'
import ActivityWrapper from './components/ActivityWrapper'
import NameEntryScreen from './components/NameEntryScreen'
import CompletionScreen from './components/CompletionScreen'

/*
  URL routes:
  /                    → MainLanding (4 section cards)
  /القيم               → ValuesPage (choose a value)
  /القيم/المسؤولية     → Game flow (landing → video → activities → name → complete)
  /الدروس             → LessonsPage
  /الأنشطة            → ActivitiesPage
  /الفعاليات           → EventsPage
*/

function MainLandingRoute() {
  const navigate = useNavigate()
  const handleNavigate = useCallback((sectionId) => {
    if (sectionId === 'values') navigate('/القيم')
    else if (sectionId === 'lessons') navigate('/الدروس')
    else if (sectionId === 'activities') navigate('/الأنشطة')
    else if (sectionId === 'events') navigate('/الفعاليات')
  }, [navigate])
  return <MainLanding onNavigate={handleNavigate} />
}

function ValuesRoute() {
  const navigate = useNavigate()
  const handleSelectValue = useCallback((valueId) => {
    if (valueId === 'responsibility') navigate('/القيم/المسؤولية')
  }, [navigate])
  return <ValuesPage onSelectValue={handleSelectValue} onBack={() => navigate('/')} />
}

function LessonsRoute() {
  const navigate = useNavigate()
  return <LessonsPage onBack={() => navigate('/')} />
}

function ActivitiesRoute() {
  const navigate = useNavigate()
  return <ActivitiesPage onBack={() => navigate('/')} />
}

function EventsRoute() {
  const navigate = useNavigate()
  return <EventsPage onBack={() => navigate('/')} />
}

function GameFlowRoute() {
  const navigate = useNavigate()
  const [screen, setScreen] = useState('gameLanding')
  const [currentActivity, setCurrentActivity] = useState(0)
  const [scores, setScores] = useState({})
  const [stars, setStars] = useState(0)
  const [studentName, setStudentName] = useState('')
  const game = useGame()

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
    navigate('/')
    setCurrentActivity(0)
    setScores({})
    setStars(0)
    setStudentName('')
    game.resetGame()
  }, [game, navigate])

  return (
    <AnimatePresence mode="wait">
      {screen === 'gameLanding' && (
        <LandingPage key="gameLanding" onStart={handleStart} onBack={() => navigate('/القيم')} />
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
  )
}

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <AchievementsProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<MainLandingRoute />} />
              <Route path="/القيم" element={<ValuesRoute />} />
              <Route path="/القيم/المسؤولية" element={<GameFlowRoute />} />
              <Route path="/الدروس" element={<LessonsRoute />} />
              <Route path="/الأنشطة" element={<ActivitiesRoute />} />
              <Route path="/الفعاليات" element={<EventsRoute />} />
            </Routes>
          </div>
          <AchievementPopup />
        </AchievementsProvider>
      </GameProvider>
    </BrowserRouter>
  )
}

export default App
