import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCorrect, playWrong, playSwipe, playClick } from '../../utils/sounds';
import { useGame } from '../../contexts/GameContext';
import ConfettiExplosion from "../../components/ConfettiExplosion";

const PRIMARY = '#8B1538';
const GREEN = '#2E7D32';
const RED = '#C62828';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ScenariosActivity = ({ data, onComplete, activityIcon }) => {
  const game = useGame();
  const { scenarios } = data;
  const total = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [consequenceData, setConsequenceData] = useState(null);
  const [scores, setScores] = useState([]);
  const [showCorrectReveal, setShowCorrectReveal] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const current = scenarios[currentIndex];
  const shuffledOptions = useMemo(() => shuffleArray(current.options), [currentIndex]);

  const handleSelect = useCallback(
    (option) => {
      if (selectedId) return;
      playClick();
      setSelectedId(option.id);

      const isCorrect = option.correct;

      if (isCorrect) {
        setTimeout(() => playCorrect(), 200);
        game.addPoints(80);
        game.incrementStreak();
        setConfettiTrigger((t) => t + 1);
        setScores((prev) => [...prev, 1]);

        setTimeout(() => {
          setConsequenceData({ isCorrect: true, feedback: option.feedback });
          setShowConsequence(true);
        }, 600);

        setTimeout(() => autoNext(), 3000);
      } else {
        setTimeout(() => playWrong(), 200);
        game.resetStreak();
        setScores((prev) => [...prev, 0]);

        setTimeout(() => {
          setConsequenceData({ isCorrect: false, feedback: option.feedback });
          setShowConsequence(true);
        }, 600);

        setTimeout(() => setShowCorrectReveal(true), 2800);
        setTimeout(() => autoNext(), 4500);
      }
    },
    [selectedId, game]
  );

  const scoresRef = useRef(scores);
  scoresRef.current = scores;

  const [finished, setFinished] = useState(false);

  const autoNext = useCallback(() => {
    const s = scoresRef.current;
    setCurrentIndex((prev) => {
      const nextIdx = prev + 1;
      if (nextIdx >= total) {
        setFinished(true);
        return prev;
      }
      return nextIdx;
    });
    playSwipe();
    setSelectedId(null);
    setShowConsequence(false);
    setConsequenceData(null);
    setShowCorrectReveal(false);
  }, [total]);

  useEffect(() => {
    if (finished) {
      const s = scoresRef.current;
      const correctCount = s.reduce((a, b) => a + b, 0);
      onComplete?.(correctCount / total);
    }
  }, [finished, total, onComplete]);

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />

      {/* Character icon */}
      {activityIcon && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.25rem 0' }}>
          <img src={activityIcon} alt="" className="activity-character" />
        </div>
      )}

      {/* Progress */}
      <div style={styles.progressRow}>
        <span style={styles.progressText}>
          الموقف {currentIndex + 1} من {total}
        </span>
        <div style={styles.progressDots}>
          {scenarios.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentIndex ? 18 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor:
                  i < currentIndex
                    ? scores[i] === 1 ? GREEN : RED
                    : i === currentIndex ? PRIMARY : '#ddd',
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          {/* Scenario card */}
          <div style={styles.scenarioCard}>
            <span style={styles.scenarioEmoji}>{current.emoji}</span>
            <p style={styles.scenarioText}>{current.situation}</p>
          </div>

          {/* Options */}
          <AnimatePresence>
            {!showConsequence && (
              <motion.div
                style={styles.optionsArea}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p style={styles.optionsLabel}>اختاري التصرف المناسب:</p>
                {shuffledOptions.map((option, idx) => {
                  const isSelected = selectedId === option.id;
                  const isCorrectOption = option.correct;
                  let optStyle = styles.optionBtn;

                  if (selectedId) {
                    if (isSelected && isCorrectOption) {
                      optStyle = { ...styles.optionBtn, ...styles.optionCorrect };
                    } else if (isSelected && !isCorrectOption) {
                      optStyle = { ...styles.optionBtn, ...styles.optionWrong };
                    } else if (isCorrectOption && showCorrectReveal) {
                      optStyle = { ...styles.optionBtn, ...styles.optionHighlight };
                    } else {
                      optStyle = { ...styles.optionBtn, opacity: 0.5 };
                    }
                  }

                  return (
                    <motion.button
                      key={option.id}
                      style={optStyle}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      whileHover={!selectedId ? { scale: 1.02, boxShadow: '0 4px 16px rgba(139,21,56,0.15)' } : {}}
                      whileTap={!selectedId ? { scale: 0.97 } : {}}
                      onClick={() => handleSelect(option)}
                      disabled={!!selectedId}
                    >
                      <span style={styles.optionText}>{option.text}</span>
                      {selectedId && isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{ fontSize: 18 }}
                        >
                          {isCorrectOption ? '✅' : '❌'}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback */}
          <AnimatePresence>
            {showConsequence && consequenceData && (
              <motion.div
                style={{
                  ...styles.feedbackCard,
                  borderColor: consequenceData.isCorrect ? GREEN : RED,
                  backgroundColor: consequenceData.isCorrect ? '#e8f5e9' : '#ffebee',
                }}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <span style={{ fontSize: 36 }}>
                  {consequenceData.isCorrect ? '✅' : '❌'}
                </span>
                <h3 style={{
                  ...styles.feedbackTitle,
                  color: consequenceData.isCorrect ? GREEN : RED,
                }}>
                  {consequenceData.isCorrect ? 'اختيار حكيم!' : 'ليس الخيار الأفضل'}
                </h3>
                <p style={styles.feedbackText}>{consequenceData.feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Correct reveal */}
          <AnimatePresence>
            {showCorrectReveal && (
              <motion.div
                style={styles.correctReveal}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>💡</span>
                <span style={styles.correctRevealText}>
                  الإجابة الصحيحة: {current.options.find((o) => o.correct)?.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Cairo', sans-serif",
    maxWidth: 650,
    margin: '0 auto',
    padding: '8px 12px',
  },
  progressRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  progressText: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: PRIMARY,
    backgroundColor: '#f8f0f2',
    padding: '3px 14px',
    borderRadius: 10,
  },
  progressDots: {
    display: 'flex',
    gap: 4,
    justifyContent: 'center',
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: '16px 18px',
    marginBottom: 12,
    border: '2px solid #f0e0e5',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(139,21,56,0.06)',
  },
  scenarioEmoji: {
    fontSize: '2rem',
    display: 'block',
    marginBottom: 8,
  },
  scenarioText: {
    fontSize: '0.95rem',
    lineHeight: 1.8,
    color: '#333',
    fontWeight: 600,
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  optionsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  optionsLabel: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: PRIMARY,
    textAlign: 'center',
    margin: '0 0 4px',
    fontFamily: "'Cairo', sans-serif",
  },
  optionBtn: {
    width: '100%',
    background: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.2s',
  },
  optionCorrect: {
    borderColor: GREEN,
    backgroundColor: '#e8f5e9',
    boxShadow: '0 0 0 3px rgba(46,125,50,0.1)',
  },
  optionWrong: {
    borderColor: RED,
    backgroundColor: '#ffebee',
    boxShadow: '0 0 0 3px rgba(198,40,40,0.1)',
  },
  optionHighlight: {
    borderColor: GREEN,
    backgroundColor: '#e8f5e9',
    opacity: 1,
  },
  optionText: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#333',
    flex: 1,
    lineHeight: 1.6,
    textAlign: 'right',
  },
  feedbackCard: {
    borderRadius: 14,
    padding: '16px 18px',
    border: '2px solid',
    textAlign: 'center',
    marginTop: 10,
  },
  feedbackTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    margin: '6px 0',
    fontFamily: "'Cairo', sans-serif",
  },
  feedbackText: {
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: '#555',
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  correctReveal: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: '10px 14px',
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    border: '1px solid #ffe082',
    marginTop: 10,
  },
  correctRevealText: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#5d4037',
    fontFamily: "'Cairo', sans-serif",
  },
};

export default ScenariosActivity;
