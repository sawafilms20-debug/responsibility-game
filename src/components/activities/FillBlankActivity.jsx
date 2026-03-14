import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCorrect, playWrong, playReveal, playClick } from '../../utils/sounds';
import { useGame } from '../../contexts/GameContext';
import ConfettiExplosion from "../../components/ConfettiExplosion";

const GOLD = '#D4A853';
const GOLD_DARK = '#b8860b';
const PARCHMENT = '#f5e6c8';
const PARCHMENT_LIGHT = '#faf3e0';
const INK = '#3d2b1f';
const INK_LIGHT = '#5c4033';

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FillBlankActivity = ({ data, onComplete, activityIcon }) => {
  const game = useGame();

  const [wrongIds, setWrongIds] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [filledOptionId, setFilledOptionId] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [shakingId, setShakingId] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const blankRef = useRef(null);

  const verse = data?.verse || '';
  const rawOptions = data?.options || [];
  const options = useMemo(() => shuffleArray(rawOptions), []);
  const explanation = data?.explanation || '';

  const correctOption = options.find((o) => o.correct);
  const filledVerse = correctOption ? verse.replace('___', correctOption.text) : verse;
  const verseParts = verse.split('___');
  const hasBlank = verseParts.length > 1;

  const wrongCount = wrongIds.length;
  const remainingWrong = options.filter((o) => !o.correct && !wrongIds.includes(o.id));

  const handleOptionClick = (option) => {
    if (isCorrect || wrongIds.includes(option.id) || completed) return;
    playClick();

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (option.correct) {
      playReveal();
      setFilledOptionId(option.id);

      game.incrementStreak();
      const pointsMap = { 1: 100, 2: 50, 3: 25 };
      const pts = pointsMap[newAttempts] || 25;
      game.addPoints(pts);
      setConfettiTrigger(t => t + 1);

      setTimeout(() => {
        setIsCorrect(true);
        setShowBurst(true);

        setTimeout(() => {
          setShowBurst(false);
          setShowExplanation(true);
        }, 800);

        setTimeout(() => {
          const scoreMap = { 1: 1.0, 2: 0.5, 3: 0.33 };
          const finalScore = scoreMap[newAttempts] || 0.25;
          setCompleted(true);
          onComplete?.(finalScore);
        }, 2500);
      }, 500);
    } else {
      playWrong();
      game.resetStreak();
      setShakingId(option.id);
      setWrongIds((prev) => [...prev, option.id]);

      setTimeout(() => setShakingId(null), 600);

      // Wrong answer — show correct answer and move on
      setTimeout(() => {
        setFilledOptionId(correctOption?.id);
        setIsCorrect(true);
        setShowExplanation(true);
        setCompleted(true);
        onComplete?.(0);
      }, 1000);
    }
  };

  const burstParticles = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    angle: (i * 25.7) * (Math.PI / 180),
  }));

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Header */}
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {activityIcon ? (
          <img src={activityIcon} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />
        ) : (
          <span style={styles.scrollEmoji}>{'\u{1F4DC}'}</span>
        )}
        <div>
          <h2 style={styles.headerTitle}>{'\u0627\u0643\u062A\u0634\u0627\u0641 \u0627\u0644\u0645\u062E\u0637\u0648\u0637\u0629 \u0627\u0644\u0642\u062F\u064A\u0645\u0629'}</h2>
          <p style={styles.headerSubtitle}>{'\u0648\u062C\u062F\u062A \u0645\u0631\u064A\u0645 \u0645\u062E\u0637\u0648\u0637\u0629 \u0642\u062F\u064A\u0645\u0629 \u0641\u064A \u0645\u0643\u062A\u0628\u0629 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0644\u0643\u0646 \u062C\u0632\u0621\u064B\u0627 \u0645\u0646\u0647\u0627 \u0628\u0627\u0647\u062A...'}</p>
        </div>
      </motion.div>

      {/* Scroll / Parchment Card */}
      <motion.div
        style={styles.scrollCard}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: 1,
          scale: 1,
          boxShadow: isCorrect
            ? `0 0 40px rgba(212,168,83,0.5), 0 8px 32px rgba(0,0,0,0.15)`
            : '0 8px 32px rgba(0,0,0,0.1)',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
      >
        {/* Islamic decorative border */}
        <div style={styles.islamicBorderOuter}>
          <div style={styles.islamicBorderInner}>
            {/* Corner ornaments */}
            <div style={{ ...styles.corner, top: -2, right: -2, borderTop: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderTopRightRadius: 8 }} />
            <div style={{ ...styles.corner, top: -2, left: -2, borderTop: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`, borderTopLeftRadius: 8 }} />
            <div style={{ ...styles.corner, bottom: -2, right: -2, borderBottom: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}`, borderBottomRightRadius: 8 }} />
            <div style={{ ...styles.corner, bottom: -2, left: -2, borderBottom: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}`, borderBottomLeftRadius: 8 }} />
          </div>
        </div>

        {/* Top decorative divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerStar}>{'\u2726'}</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Verse text */}
        <div style={styles.verseContainer}>
          {isCorrect ? (
            <motion.p
              style={styles.verseText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {filledVerse}
            </motion.p>
          ) : hasBlank ? (
            <p style={styles.verseText}>
              {verseParts[0]}
              <span ref={blankRef} style={styles.blankWrapper}>
                {filledOptionId ? (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={styles.filledWord}
                  >
                    {correctOption?.text}
                  </motion.span>
                ) : (
                  <motion.span
                    style={styles.blankGap}
                    animate={{
                      boxShadow: [
                        `0 0 8px ${GOLD}40`,
                        `0 0 20px ${GOLD}80`,
                        `0 0 8px ${GOLD}40`,
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {'       '}
                  </motion.span>
                )}
              </span>
              {verseParts[1]}
            </p>
          ) : (
            <p style={styles.verseText}>{verse}</p>
          )}
        </div>

        {/* Bottom decorative divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerStar}>{'\u2726'}</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Burst particles */}
        <AnimatePresence>
          {showBurst && (
            <div style={styles.burstCenter}>
              {burstParticles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos(p.angle) * 90,
                    y: Math.sin(p.angle) * 90,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  style={styles.burstDot}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Word Options */}
      <AnimatePresence>
        {!isCorrect && !completed && (
          <motion.div
            style={styles.optionsArea}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.3 }}
          >
            <p style={styles.optionsLabel}>{'\u0627\u062E\u062A\u0627\u0631\u064A \u0627\u0644\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0641\u0642\u0648\u062F\u0629:'}</p>
            <div style={styles.optionsGrid}>
              {options.map((option, idx) => {
                const isWrong = wrongIds.includes(option.id);
                const isShaking = shakingId === option.id;

                return (
                  <motion.button
                    key={option.id}
                    style={{
                      ...styles.optionPill,
                      ...(isWrong ? styles.optionPillWrong : {}),
                      cursor: isWrong ? 'not-allowed' : 'pointer',
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                      opacity: isWrong ? 0.45 : 1,
                      y: 0,
                      x: isShaking ? [0, -8, 8, -8, 8, -4, 4, 0] : 0,
                    }}
                    transition={{
                      delay: idx * 0.08,
                      x: { duration: 0.5, times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1] },
                    }}
                    whileHover={!isWrong ? { scale: 1.06, boxShadow: `0 4px 18px ${GOLD}50` } : {}}
                    whileTap={!isWrong ? { scale: 0.94 } : {}}
                    onClick={() => handleOptionClick(option)}
                    disabled={isWrong}
                  >
                    <span style={styles.optionText}>{option.text}</span>
                    {isWrong && <span style={styles.wrongX}>{'\u2717'}</span>}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && explanation && (
          <motion.div
            style={styles.explanationBox}
            initial={{ opacity: 0, y: 25, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          >
            <span style={styles.explanationIcon}>{'\u{1F4A1}'}</span>
            <p style={styles.explanationText}>{explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempts indicator */}
      {!isCorrect && !completed && attempts > 0 && (
        <motion.div
          style={styles.attemptsBar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {`\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0627\u062A: ${attempts}`}
        </motion.div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.5rem',
    fontFamily: "'Cairo', sans-serif",
    minHeight: '500px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '1.5rem',
    width: '100%',
    maxWidth: '480px',
  },
  scrollEmoji: {
    fontSize: '2.8rem',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: INK,
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: INK_LIGHT,
    margin: '2px 0 0',
    fontFamily: "'Cairo', sans-serif",
    lineHeight: 1.6,
  },
  scrollCard: {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    background: `linear-gradient(145deg, ${PARCHMENT_LIGHT} 0%, ${PARCHMENT} 40%, #ecdbb4 100%)`,
    borderRadius: '20px',
    padding: '2rem 1.8rem',
    marginBottom: '1.8rem',
    border: `2px solid ${GOLD}`,
    overflow: 'hidden',
  },
  islamicBorderOuter: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    padding: '10px',
  },
  islamicBorderInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    border: `1px solid ${GOLD}40`,
    borderRadius: '14px',
  },
  corner: {
    position: 'absolute',
    width: '22px',
    height: '22px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    justifyContent: 'center',
    margin: '0.5rem 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: `linear-gradient(to left, transparent, ${GOLD}, transparent)`,
  },
  dividerStar: {
    color: GOLD,
    fontSize: '1rem',
  },
  verseContainer: {
    padding: '1.2rem 0',
    position: 'relative',
    zIndex: 2,
  },
  verseText: {
    fontSize: '1.35rem',
    fontWeight: '600',
    color: INK,
    textAlign: 'center',
    lineHeight: '2.4',
    fontFamily: "'Cairo', sans-serif",
    margin: 0,
  },
  blankWrapper: {
    display: 'inline-block',
    minWidth: '90px',
    textAlign: 'center',
    verticalAlign: 'bottom',
    margin: '0 6px',
  },
  blankGap: {
    display: 'inline-block',
    minWidth: '80px',
    borderBottom: `3px dashed ${GOLD}`,
    paddingBottom: '4px',
    borderRadius: '4px',
    background: `${GOLD}15`,
  },
  filledWord: {
    color: GOLD_DARK,
    fontWeight: '800',
    borderBottom: `3px solid ${GOLD}`,
    paddingBottom: '2px',
    fontSize: '1.35rem',
  },
  burstCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 10,
  },
  burstDot: {
    position: 'absolute',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: GOLD,
  },
  optionsArea: {
    width: '100%',
    maxWidth: '480px',
    marginBottom: '1.5rem',
  },
  optionsLabel: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: INK_LIGHT,
    marginBottom: '0.8rem',
    textAlign: 'center',
    fontFamily: "'Cairo', sans-serif",
  },
  optionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.8rem',
    justifyContent: 'center',
  },
  optionPill: {
    position: 'relative',
    padding: '0.8rem 1.6rem',
    borderRadius: '50px',
    border: `2px solid ${GOLD}`,
    background: `linear-gradient(135deg, ${PARCHMENT_LIGHT}, #fff)`,
    fontFamily: "'Cairo', sans-serif",
    fontSize: '1.1rem',
    fontWeight: '700',
    color: INK,
    boxShadow: `0 3px 10px ${GOLD}30`,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  optionPillWrong: {
    border: '2px solid #ccc',
    background: '#eee',
    color: '#999',
    boxShadow: 'none',
    textDecoration: 'line-through',
  },
  optionText: {
    lineHeight: '1.6',
  },
  wrongX: {
    color: '#dc2626',
    fontSize: '1rem',
    fontWeight: '800',
  },
  explanationBox: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: '#f0fdf4',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #bbf7d0',
    textAlign: 'center',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  explanationIcon: {
    fontSize: '1.8rem',
    display: 'block',
    marginBottom: '0.5rem',
  },
  explanationText: {
    fontSize: '1.05rem',
    fontWeight: '500',
    color: '#166534',
    lineHeight: '1.9',
    fontFamily: "'Cairo', sans-serif",
    margin: 0,
  },
  attemptsBar: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: INK_LIGHT,
    fontFamily: "'Cairo', sans-serif",
    marginTop: '0.5rem',
  },
};

export default FillBlankActivity;
