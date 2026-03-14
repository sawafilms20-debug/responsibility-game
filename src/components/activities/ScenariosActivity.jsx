import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCorrect, playWrong, playSwipe, playClick } from '../../utils/sounds';
import { useGame } from '../../contexts/GameContext';
import ConfettiExplosion from "../../components/ConfettiExplosion";

const PRIMARY = '#8B1538';
const GREEN = '#2E7D32';
const RED = '#C62828';
const GOLD = '#D4A853';

const getSceneGradient = (emoji) => {
  if (!emoji) return 'linear-gradient(180deg, #2c1338 0%, #4a1942 40%, #6b2158 100%)';
  const e = emoji.trim();
  if (e.includes('💰') || e.includes('👛') || e.includes('💵') || e.includes('🪙'))
    return 'linear-gradient(180deg, #3d1c0a 0%, #5c3317 40%, #7a4a2a 100%)';
  if (e.includes('📝') || e.includes('📖') || e.includes('📚') || e.includes('✏️'))
    return 'linear-gradient(180deg, #0a1c3d 0%, #132e5c 40%, #1b4a7a 100%)';
  if (e.includes('💧') || e.includes('🌊') || e.includes('🚰'))
    return 'linear-gradient(180deg, #0a2d2d 0%, #0e4545 40%, #126060 100%)';
  if (e.includes('🏠') || e.includes('👨‍👩‍👧'))
    return 'linear-gradient(180deg, #2d1a0a 0%, #4a2e15 40%, #6b4425 100%)';
  if (e.includes('🕌') || e.includes('☪️') || e.includes('🤲'))
    return 'linear-gradient(180deg, #1a0a2d 0%, #2e1545 40%, #44256b 100%)';
  return 'linear-gradient(180deg, #2c1338 0%, #4a1942 40%, #6b2158 100%)';
};

const pageVariants = {
  enter: {
    x: -300,
    opacity: 0,
    scale: 0.95,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    x: 300,
    opacity: 0,
    scale: 0.95,
  },
};

const ScenariosActivity = ({ data, onComplete, activityIcon }) => {
  const game = useGame();
  const { scenarios } = data;
  const total = scenarios.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showConsequence, setShowConsequence] = useState(false);
  const [consequenceData, setConsequenceData] = useState(null);
  const [showNext, setShowNext] = useState(false);
  const [scores, setScores] = useState([]);
  const [flashColor, setFlashColor] = useState(null);
  const [showCorrectReveal, setShowCorrectReveal] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const current = scenarios[currentIndex];

  const handleSelect = useCallback(
    (option) => {
      if (selectedId) return;
      playClick();
      setSelectedId(option.id);

      const isCorrect = option.correct;

      if (isCorrect) {
        // --- CORRECT: positive consequence scene ---
        setFlashColor('rgba(46, 125, 50, 0.15)');
        setTimeout(() => playCorrect(), 200);
        game.addPoints(80);
        game.incrementStreak();
        setConfettiTrigger((t) => t + 1);
        setScores((prev) => [...prev, 1]);

        setTimeout(() => setFlashColor(null), 600);

        setTimeout(() => {
          setConsequenceData({
            isCorrect: true,
            feedback: option.feedback,
          });
          setShowConsequence(true);
        }, 800);

        // Auto-advance after showing feedback
        setTimeout(() => autoNext(), 3000);
      } else {
        // --- WRONG: dramatic consequence scene ---
        setFlashColor('rgba(198, 40, 40, 0.15)');
        setTimeout(() => playWrong(), 200);
        game.resetStreak();

        setTimeout(() => setFlashColor(null), 600);

        setTimeout(() => {
          setConsequenceData({
            isCorrect: false,
            feedback: option.feedback,
          });
          setShowConsequence(true);
        }, 800);

        setScores((prev) => [...prev, 0]);
        setTimeout(() => {
          setShowCorrectReveal(true);
        }, 2800);
        // Auto-advance after showing correct reveal
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
    setShowNext(false);
    setFlashColor(null);
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
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
          style={styles.pageWrapper}
        >
          {/* Scene Area - Visual Novel top 2/3 */}
          <div
            style={{
              ...styles.sceneArea,
              background: getSceneGradient(current.emoji),
            }}
          >
            {/* Flash overlay */}
            <AnimatePresence>
              {flashColor && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: flashColor,
                    zIndex: 5,
                    borderRadius: '20px 20px 0 0',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            {/* Decorative particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: 4 + Math.random() * 4,
                  height: 4 + Math.random() * 4,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  top: `${15 + Math.random() * 60}%`,
                  left: `${10 + Math.random() * 80}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              />
            ))}

            {/* Activity icon / Character visual */}
            {activityIcon ? (
              <motion.img
                src={activityIcon}
                alt=""
                style={{ ...styles.sceneCharacter, width: 220, height: 220 }}
                initial={{ scale: 0.7, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
              />
            ) : (
              <motion.img
                src="/images/characters/maryam_thinking.png"
                alt=""
                style={styles.sceneCharacter}
                initial={{ scale: 0.7, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.2 }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            {/* Progress dots overlay */}
            <div style={styles.progressOverlay}>
              {scenarios.map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    width: i === currentIndex ? 20 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i < currentIndex
                        ? scores[i] === 1
                          ? GREEN
                          : RED
                        : i === currentIndex
                        ? '#fff'
                        : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.3s',
                  }}
                  animate={i === currentIndex ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
          </div>

          {/* Text Box Area - Visual Novel bottom 1/3 */}
          <div style={styles.textArea}>
            {/* Situation text */}
            <motion.div
              style={styles.dialogueBox}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <p style={styles.dialogueText}>{current.situation}</p>
            </motion.div>

            {/* Options as thought bubbles */}
            <AnimatePresence>
              {!showConsequence && (
                <motion.div
                  style={styles.optionsArea}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.4 }}
                >
                  {current.options.map((option, idx) => {
                    const isSelected = selectedId === option.id;
                    const isCorrectOption = option.correct;
                    let bubbleStyle = styles.thoughtBubble;
                    if (selectedId) {
                      if (isSelected && isCorrectOption) {
                        bubbleStyle = { ...styles.thoughtBubble, ...styles.bubbleCorrect };
                      } else if (isSelected && !isCorrectOption) {
                        bubbleStyle = { ...styles.thoughtBubble, ...styles.bubbleWrong };
                      } else if (isCorrectOption && showCorrectReveal) {
                        bubbleStyle = { ...styles.thoughtBubble, ...styles.bubbleHighlight };
                      } else {
                        bubbleStyle = { ...styles.thoughtBubble, ...styles.bubbleFaded };
                      }
                    }

                    return (
                      <motion.button
                        key={option.id}
                        style={bubbleStyle}
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.5 + idx * 0.12 }}
                        whileHover={!selectedId ? { scale: 1.04, y: -3 } : {}}
                        whileTap={!selectedId ? { scale: 0.96 } : {}}
                        onClick={() => handleSelect(option)}
                        disabled={!!selectedId}
                      >
                        {/* Bubble tail */}
                        <div style={styles.bubbleTail} />
                        <span style={styles.bubbleText}>{option.text}</span>
                        {selectedId && isSelected && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                              fontSize: 18,
                              marginRight: 6,
                            }}
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

            {/* Consequence scene */}
            <AnimatePresence>
              {showConsequence && consequenceData && (
                <motion.div
                  style={{
                    ...styles.consequencePanel,
                    ...(consequenceData.isCorrect
                      ? styles.consequencePanelCorrect
                      : styles.consequencePanelWrong),
                    borderRightColor: consequenceData.isCorrect ? GREEN : RED,
                  }}
                  initial={{ y: 60, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 60, opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {/* Dramatic icon */}
                  <motion.div
                    style={styles.consequenceIconContainer}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
                  >
                    <span style={{ fontSize: 42 }}>
                      {consequenceData.isCorrect ? '✅' : '❌'}
                    </span>
                  </motion.div>

                  <div style={styles.consequenceHeader}>
                    <span
                      style={{
                        ...styles.consequenceTitle,
                        color: consequenceData.isCorrect ? GREEN : RED,
                      }}
                    >
                      {consequenceData.isCorrect ? 'اختيار حكيم!' : 'ليس الخيار الأفضل'}
                    </span>
                  </div>
                  <motion.p
                    style={styles.consequenceFeedback}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {consequenceData.feedback}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Correct answer reveal (second wrong attempt) */}
            <AnimatePresence>
              {showCorrectReveal && (
                <motion.div
                  style={styles.correctRevealPanel}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <span style={{ fontSize: 20 }}>💡</span>
                  <span style={styles.correctRevealText}>
                    الإجابة الصحيحة: {current.options.find((o) => o.correct)?.text}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
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
    padding: '12px',
    direction: 'rtl',
  },
  pageWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 560,
  },
  sceneArea: {
    position: 'relative',
    flex: '0 0 55%',
    minHeight: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px 20px 0 0',
    overflow: 'hidden',
  },
  sceneCharacter: {
    width: 260,
    height: 260,
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))',
    zIndex: 2,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f8e8ee, #fff)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255,255,255,0.7)',
    boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
  },
  avatarNameplate: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    padding: '2px 10px',
  },
  avatarName: {
    fontSize: 11,
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Cairo', sans-serif",
  },
  progressOverlay: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 6,
    zIndex: 4,
  },
  textArea: {
    flex: '0 0 45%',
    background: 'linear-gradient(180deg, rgba(20,10,15,0.92) 0%, rgba(30,15,22,0.96) 100%)',
    padding: '0 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    position: 'relative',
  },
  nameplate: {
    alignSelf: 'flex-start',
    background: `linear-gradient(135deg, ${PRIMARY}, #A91D45)`,
    borderRadius: '0 0 12px 12px',
    padding: '4px 20px',
    marginBottom: 2,
  },
  nameplateText: {
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    fontFamily: "'Cairo', sans-serif",
  },
  dialogueBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12,
    padding: '12px 16px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  dialogueText: {
    fontSize: 15,
    lineHeight: 1.8,
    color: '#e8dde2',
    fontWeight: 500,
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
    textAlign: 'center',
  },
  optionsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  thoughtBubble: {
    position: 'relative',
    width: '100%',
    background: 'rgba(255,255,255,0.12)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: '10px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
  },
  bubbleCorrect: {
    background: 'rgba(46, 125, 50, 0.25)',
    borderColor: GREEN,
    boxShadow: `0 0 16px rgba(46,125,50,0.3)`,
  },
  bubbleWrong: {
    background: 'rgba(198, 40, 40, 0.25)',
    borderColor: RED,
    boxShadow: `0 0 16px rgba(198,40,40,0.3)`,
  },
  bubbleHighlight: {
    background: 'rgba(46, 125, 50, 0.15)',
    borderColor: 'rgba(46,125,50,0.5)',
  },
  bubbleFaded: {
    opacity: 0.35,
  },
  bubbleTail: {
    position: 'absolute',
    top: -6,
    right: 20,
    width: 12,
    height: 12,
    backgroundColor: 'inherit',
    borderTop: '2px solid rgba(255,255,255,0.2)',
    borderRight: '2px solid rgba(255,255,255,0.2)',
    transform: 'rotate(-45deg)',
    borderRadius: 2,
  },
  bubbleText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#f0e6ea',
    flex: 1,
    lineHeight: 1.6,
    fontFamily: "'Cairo', sans-serif",
    textAlign: 'right',
  },
  consequencePanel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '14px 18px',
    borderRight: '4px solid',
    backdropFilter: 'blur(6px)',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center',
  },
  consequencePanelCorrect: {
    background: 'linear-gradient(135deg, rgba(46,125,50,0.2) 0%, rgba(46,125,50,0.08) 100%)',
    border: '1px solid rgba(46,125,50,0.3)',
    borderRight: '4px solid',
  },
  consequencePanelWrong: {
    background: 'linear-gradient(135deg, rgba(198,40,40,0.2) 0%, rgba(30,0,0,0.3) 100%)',
    border: '1px solid rgba(198,40,40,0.3)',
    borderRight: '4px solid',
  },
  consequenceIconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 4,
  },
  consequenceHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  consequenceTitle: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
  },
  consequenceFeedback: {
    fontSize: 14,
    lineHeight: 1.7,
    color: '#d8cdd2',
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  correctRevealPanel: {
    backgroundColor: 'rgba(46,125,50,0.15)',
    borderRadius: 12,
    padding: '10px 16px',
    border: '1px solid rgba(46,125,50,0.4)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'center',
  },
  correctRevealText: {
    fontSize: 14,
    fontWeight: 600,
    color: '#a5d6a7',
    fontFamily: "'Cairo', sans-serif",
  },
  nextContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 4,
  },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${PRIMARY}, #A91D45)`,
    border: '2px solid rgba(255,255,255,0.2)',
    color: '#fff',
    fontSize: 22,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 20px rgba(139,21,56,0.4)`,
    fontFamily: "'Cairo', sans-serif",
  },
};

export default ScenariosActivity;
