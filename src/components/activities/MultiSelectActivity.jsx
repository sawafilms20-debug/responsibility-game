import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { playCorrect, playWrong, playSelect, playStar } from '../../utils/sounds';
import ConfettiExplosion from "../../components/ConfettiExplosion";

const MAROON = '#8B1538';
const MAROON_LIGHT = '#A91D45';
const GREEN = '#2E7D32';
const RED = '#C62828';
const GOLD = '#D4A853';

const AXES = [
  { label: 'النفس', angle: -90 },
  { label: 'الأسرة', angle: -90 + 72 },
  { label: 'المدرسة', angle: -90 + 144 },
  { label: 'الدين', angle: -90 + 216 },
  { label: 'الوطن', angle: -90 + 288 },
];

const CX = 140;
const CY = 140;
const R = 100;

const getVertex = (axisIndex, scale = 1) => {
  const angleDeg = AXES[axisIndex].angle;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CX + R * scale * Math.cos(angleRad),
    y: CY + R * scale * Math.sin(angleRad),
  };
};

const getPentagonPoints = (scale = 1) => {
  return AXES.map((_, i) => getVertex(i, scale));
};

const pointsToSVG = (pts) => pts.map((p) => `${p.x},${p.y}`).join(' ');

const RadarChart = ({ levels, completed }) => {
  const gridScales = [0.33, 0.66, 1.0];
  const axisVertices = getPentagonPoints(1.0);

  const fillPoints = AXES.map((_, i) => {
    const val = levels[i] || 0;
    return getVertex(i, val);
  });

  const labelPositions = AXES.map((_, i) => getVertex(i, 1.22));

  return (
    <svg
      viewBox="0 0 280 280"
      style={{ width: '100%', maxWidth: 280, height: 'auto' }}
    >
      {/* Grid pentagons */}
      {gridScales.map((s, i) => (
        <polygon
          key={i}
          points={pointsToSVG(getPentagonPoints(s))}
          fill="none"
          stroke="rgba(139,21,56,0.12)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {axisVertices.map((v, i) => (
        <line
          key={i}
          x1={CX}
          y1={CY}
          x2={v.x}
          y2={v.y}
          stroke="rgba(139,21,56,0.15)"
          strokeWidth="1"
        />
      ))}

      {/* Glow filter for completed state */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="radarFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={completed ? GOLD : MAROON} stopOpacity="0.35" />
          <stop offset="100%" stopColor={completed ? '#f5d990' : MAROON_LIGHT} stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Fill polygon */}
      <motion.polygon
        points={pointsToSVG(fillPoints)}
        fill="url(#radarFill)"
        stroke={completed ? GOLD : MAROON}
        strokeWidth={completed ? 2.5 : 2}
        filter={completed ? 'url(#glow)' : 'none'}
        initial={false}
        animate={{
          points: pointsToSVG(fillPoints),
        }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
      />

      {/* Vertex dots */}
      {fillPoints.map((p, i) => (
        <motion.circle
          key={i}
          r={levels[i] > 0 ? 4 : 0}
          fill={completed ? GOLD : MAROON}
          initial={false}
          animate={{ cx: p.x, cy: p.y, r: levels[i] > 0 ? 4 : 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        />
      ))}

      {/* Axis labels */}
      {AXES.map((axis, i) => {
        const pos = labelPositions[i];
        return (
          <text
            key={i}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: 11,
              fontWeight: 700,
              fill: levels[i] > 0 ? (completed ? GOLD : MAROON) : '#999',
              fontFamily: "'Cairo', sans-serif",
              transition: 'fill 0.3s',
            }}
          >
            {axis.label}
          </text>
        );
      })}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r="3" fill="rgba(139,21,56,0.3)" />
    </svg>
  );
};

const MultiSelectActivity = ({ data, onComplete, activityIcon }) => {
  const { question, hint, options } = data;
  const game = useGame();

  const [optionStates, setOptionStates] = useState({});
  const [correctFound, setCorrectFound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [shakeRadar, setShakeRadar] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const totalCorrect = useMemo(() => options.filter((o) => o.correct).length, [options]);
  const correctOptions = useMemo(() => options.filter((o) => o.correct), [options]);

  // Radar fills proportionally based on how many correct options found
  const radarLevels = useMemo(() => {
    const fillLevel = totalCorrect > 0 ? correctFound / totalCorrect : 0;
    return [fillLevel, fillLevel, fillLevel, fillLevel, fillLevel];
  }, [correctFound, totalCorrect]);

  const responsibilityPercent = Math.round((correctFound / totalCorrect) * 100);

  // Check completion
  useEffect(() => {
    if (correctFound >= totalCorrect && totalCorrect > 0 && !finished) {
      setFinished(true);
      playStar();
      setTimeout(() => {
        onComplete?.(correctFound / totalCorrect);
      }, 2000);
    }
  }, [correctFound, totalCorrect, finished, onComplete]);

  const handleSelect = useCallback(
    (opt) => {
      if (finished) return;
      if (optionStates[opt.id]) return;

      playSelect();

      if (opt.correct) {
        setOptionStates((prev) => ({ ...prev, [opt.id]: 'correct' }));
        setCorrectFound((prev) => prev + 1);
        game.addPoints(30);
        game.incrementStreak();
        setConfettiTrigger(t => t + 1);
        setTimeout(() => playCorrect(), 150);
      } else {
        setOptionStates((prev) => ({ ...prev, [opt.id]: 'wrong' }));
        game.resetStreak();
        playWrong();

        // Shake radar
        setShakeRadar(true);
        setTimeout(() => {
          setShakeRadar(false);
          // Reset wrong option after brief display
          setTimeout(() => {
            setOptionStates((prev) => ({ ...prev, [opt.id]: 'disabled' }));
          }, 400);
        }, 500);
      }
    },
    [finished, optionStates, game]
  );

  const allCompleted = correctFound >= totalCorrect && totalCorrect > 0;

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Title */}
      <motion.div
        style={styles.titleBanner}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activityIcon ? (
          <img src={activityIcon} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: 22 }}>📊</span>
        )}
        <span style={styles.titleText}>رادار المسؤولية</span>
      </motion.div>

      {/* Question */}
      <motion.div
        style={styles.questionBox}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <p style={styles.questionText}>{question}</p>
        {hint && <p style={styles.hintText}>{hint}</p>}
      </motion.div>

      {/* Radar Chart */}
      <motion.div
        style={styles.radarContainer}
        animate={
          shakeRadar
            ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: { duration: 0.5 } }
            : {}
        }
      >
        <RadarChart levels={radarLevels} completed={allCompleted} />

        {/* Responsibility level */}
        <motion.div
          style={{
            ...styles.levelBadge,
            borderColor: allCompleted ? GOLD : MAROON,
            backgroundColor: allCompleted ? 'rgba(212,168,83,0.08)' : 'rgba(139,21,56,0.05)',
          }}
          animate={allCompleted ? { scale: [1, 1.05, 1] } : {}}
          transition={allCompleted ? { duration: 1.5, repeat: Infinity } : {}}
        >
          <span
            style={{
              ...styles.levelLabel,
              color: allCompleted ? GOLD : MAROON,
            }}
          >
            مستوى المسؤولية
          </span>
          <motion.span
            style={{
              ...styles.levelValue,
              color: allCompleted ? GOLD : MAROON,
            }}
            key={responsibilityPercent}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {responsibilityPercent}%
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Completion message */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            style={styles.completionBanner}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <span style={{ fontSize: 28 }}>🌟</span>
            <span style={styles.completionText}>شخصية مسؤولة بتميّز!</span>
            <span style={{ fontSize: 28 }}>🌟</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Options Grid */}
      <div style={styles.grid}>
        {options.map((opt, index) => {
          const state = optionStates[opt.id] || null;
          const isCorrect = state === 'correct';
          const isWrong = state === 'wrong';
          const isDisabled = state === 'disabled';

          let cardBg = '#fff';
          let cardBorder = 'rgba(139,21,56,0.1)';
          let cardShadow = '0 2px 10px rgba(0,0,0,0.05)';
          let textColor = '#333';

          if (isCorrect) {
            cardBg = '#E8F5E9';
            cardBorder = GREEN;
            cardShadow = `0 3px 14px rgba(46,125,50,0.2)`;
          } else if (isWrong) {
            cardBg = '#FFEBEE';
            cardBorder = RED;
            cardShadow = `0 3px 14px rgba(198,40,40,0.2)`;
          } else if (isDisabled) {
            cardBg = '#f5f5f5';
            cardBorder = '#e0e0e0';
            textColor = '#bbb';
          }

          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.07, duration: 0.35 }}
            >
              <motion.button
                style={{
                  ...styles.card,
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  boxShadow: cardShadow,
                  cursor: finished || isCorrect || isDisabled ? 'default' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                onClick={() => handleSelect(opt)}
                disabled={finished || isCorrect || isDisabled}
                whileHover={
                  !finished && !isCorrect && !isDisabled
                    ? { scale: 1.04, y: -3, boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }
                    : {}
                }
                whileTap={!finished && !isCorrect && !isDisabled ? { scale: 0.96 } : {}}
                animate={
                  isWrong
                    ? { x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } }
                    : isCorrect
                    ? { scale: [1, 1.08, 1], transition: { duration: 0.35 } }
                    : {}
                }
              >
                {/* Status overlay icon */}
                <AnimatePresence>
                  {isCorrect && (
                    <motion.div
                      style={styles.statusIcon}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      ✓
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.span
                  style={styles.cardEmoji}
                  animate={isCorrect ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {opt.emoji}
                </motion.span>
                <span style={{ ...styles.cardText, color: textColor }}>{opt.text}</span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    direction: 'rtl',
    fontFamily: "'Cairo', sans-serif",
    maxWidth: 600,
    margin: '0 auto',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  titleBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 800,
    color: MAROON,
    fontFamily: "'Cairo', sans-serif",
  },
  questionBox: {
    background: `linear-gradient(135deg, ${MAROON}, ${MAROON_LIGHT})`,
    color: '#fff',
    padding: '14px 22px',
    borderRadius: 14,
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(139, 21, 56, 0.3)',
  },
  questionText: {
    fontSize: 17,
    fontWeight: 700,
    lineHeight: 1.7,
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  hintText: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.7)',
    margin: '6px 0 0',
    fontFamily: "'Cairo', sans-serif",
  },
  radarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 12,
    padding: '6px 18px',
    transition: 'all 0.3s',
  },
  levelLabel: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Cairo', sans-serif",
  },
  levelValue: {
    fontSize: 22,
    fontWeight: 800,
    fontFamily: "'Cairo', sans-serif",
  },
  completionBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: `linear-gradient(135deg, rgba(212,168,83,0.12), rgba(212,168,83,0.05))`,
    border: `2px solid ${GOLD}`,
    borderRadius: 16,
    padding: '12px 24px',
    boxShadow: `0 0 30px rgba(212,168,83,0.2)`,
  },
  completionText: {
    fontSize: 20,
    fontWeight: 800,
    color: GOLD,
    fontFamily: "'Cairo', sans-serif",
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    width: '100%',
  },
  card: {
    width: '100%',
    borderRadius: 14,
    padding: '14px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderStyle: 'solid',
    fontFamily: "'Cairo', sans-serif",
    userSelect: 'none',
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
    transition: 'background-color 0.3s, border-color 0.3s',
  },
  statusIcon: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: GREEN,
    color: '#fff',
    fontSize: 13,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(46,125,50,0.3)',
  },
  cardEmoji: {
    fontSize: 30,
    lineHeight: 1,
  },
  cardText: {
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.5,
    fontFamily: "'Cairo', sans-serif",
  },
};

export default MultiSelectActivity;
