import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { playCorrect, playWrong, playStamp } from '../../utils/sounds';
import ConfettiExplosion from '../../components/ConfettiExplosion';

const TrueFalseActivity = ({ data, onComplete, activityIcon }) => {
  const game = useGame();
  const statements = data?.statements || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [stampType, setStampType] = useState(null); // 'true' | 'false' | null
  const [isAnimating, setIsAnimating] = useState(false);
  const [exitDir, setExitDir] = useState(null); // 'published' | 'rejected'
  const [results, setResults] = useState([]); // track each result

  const currentStatement = statements[currentIndex];
  const isFinished = currentIndex >= statements.length;

  const handleStamp = useCallback((userAnswer) => {
    if (isAnimating || isFinished) return;
    setIsAnimating(true);
    playStamp();

    const isCorrect = userAnswer === currentStatement.answer;
    setStampType(userAnswer ? 'true' : 'false');
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      game.addPoints(50);
      game.incrementStreak();
      setConfettiTrigger(t => t + 1);
    } else {
      game.resetStreak();
    }

    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
    setResults(prev => [...prev, { id: currentStatement.id, correct: isCorrect }]);

    // After stamp animation, slide card away
    setTimeout(() => {
      setExitDir(isCorrect ? 'published' : 'rejected');
      if (isCorrect) playCorrect();
      else playWrong();
    }, 600);

    // Move to next card
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setFeedback(null);
      setStampType(null);
      setExitDir(null);
      setIsAnimating(false);

      if (nextIndex >= statements.length) {
        onComplete?.(newScore / statements.length);
      }
    }, 1400);
  }, [isAnimating, isFinished, currentStatement, currentIndex, score, statements.length, onComplete, game]);

  // Finished screen
  if (isFinished && !isAnimating) {
    const finalScore = score / statements.length;
    const pct = Math.round(finalScore * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        style={styles.resultContainer}
      >
        <div style={styles.resultEmoji}>
          {pct >= 80 ? '📰' : pct >= 50 ? '👍' : '📝'}
        </div>
        <h2 style={styles.resultTitle}>
          {pct >= 80 ? 'محررة متميزة!' : pct >= 50 ? 'عمل جيد !' : 'حاولي مرة أخرى!'}
        </h2>
        <div style={styles.scoreCircle}>
          <span style={styles.scoreNumber}>{score}</span>
          <span style={styles.scoreDivider}>/</span>
          <span style={styles.scoreTotal}>{statements.length}</span>
        </div>
        <p style={styles.resultMessage}>
          {pct >= 80
            ? 'أحسنتِ! تم التحقق من جميع الأخبار بدقة'
            : pct >= 50
            ? 'جيد، لكن بعض الأخبار تحتاج مراجعة أدق'
            : 'لا بأس، التحقق من الأخبار يحتاج تدريب'}
        </p>
      </motion.div>
    );
  }

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Desk header */}
      <div style={styles.deskHeader}>
        {activityIcon ? (
          <img src={activityIcon} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />
        ) : (
          <span style={styles.deskIcon}>📰</span>
        )}
        <span style={styles.deskTitle}>صح أو خطأ</span>
        <span style={styles.deskSubtitle}>حددي إذا كانت العبارة صحيحة أم خاطئة</span>
      </div>

      {/* Progress counter */}
      <div style={styles.progressBar}>
        <span style={styles.progressText}>
          العبارة {currentIndex + 1} من {statements.length}
        </span>
        <div style={styles.progressDots}>
          {statements.map((_, idx) => (
            <motion.div
              key={idx}
              style={{
                ...styles.dot,
                backgroundColor: idx < currentIndex
                  ? (results[idx]?.correct ? '#22c55e' : '#ef4444')
                  : idx === currentIndex ? '#8B1538' : '#d4c5a9',
              }}
              animate={{ scale: idx === currentIndex ? 1.4 : 1 }}
            />
          ))}
        </div>
      </div>

      {/* News card area */}
      <div style={styles.cardArea}>
        <AnimatePresence mode="wait">
          {currentStatement && (
            <motion.div
              key={currentStatement.id}
              style={styles.newsCard}
              initial={{ y: 80, opacity: 0, rotate: -2 }}
              animate={{
                y: 0,
                opacity: 1,
                rotate: 0,
                x: exitDir === 'published' ? 300 : exitDir === 'rejected' ? -300 : 0,
              }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 20,
                x: { duration: 0.5, ease: 'easeIn' },
              }}
            >
              {/* Newspaper header */}
              <div style={styles.cardHeader}>
                <div style={styles.cardHeaderLine} />
                <span style={styles.cardHeaderText}>العبارة</span>
                <div style={styles.cardHeaderLine} />
              </div>

              {/* Emoji */}
              <div style={styles.cardEmoji}>{currentStatement.emoji}</div>

              {/* Headline text */}
              <p style={styles.cardText}>{currentStatement.text}</p>

              {/* Decorative lines */}
              <div style={styles.cardFooterLines}>
                <div style={styles.fakeLine} />
                <div style={{ ...styles.fakeLine, width: '60%' }} />
              </div>

              {/* Stamp overlay */}
              <AnimatePresence>
                {stampType && (
                  <motion.div
                    style={{
                      ...styles.stampOverlay,
                      borderColor: feedback === 'correct' ? '#22c55e' : '#ef4444',
                      color: feedback === 'correct' ? '#22c55e' : '#ef4444',
                    }}
                    initial={{ scale: 3, opacity: 0, rotate: -30 }}
                    animate={{ scale: 1, opacity: 0.85, rotate: -12 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {stampType === 'true' ? '✅ صح' : '❌ خطأ'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              style={{
                ...styles.feedbackToast,
                backgroundColor: feedback === 'correct'
                  ? 'rgba(34,197,94,0.95)'
                  : 'rgba(239,68,68,0.95)',
              }}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {feedback === 'correct' ? '✅ إجابة صحيحة!' : '❌ إجابة خاطئة!'}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stamp buttons */}
      <div style={styles.buttonsRow}>
        <motion.button
          style={styles.stampButtonTrue}
          whileHover={{ scale: 1.06, boxShadow: '0 8px 25px rgba(34,197,94,0.4)' }}
          whileTap={{ scale: 0.88 }}
          onClick={() => handleStamp(true)}
          disabled={isAnimating}
        >
          <span style={styles.stampIcon}>✅</span>
          <span style={styles.stampLabel}>صح</span>
        </motion.button>

        <motion.button
          style={styles.stampButtonFalse}
          whileHover={{ scale: 1.06, boxShadow: '0 8px 25px rgba(239,68,68,0.4)' }}
          whileTap={{ scale: 0.88 }}
          onClick={() => handleStamp(false)}
          disabled={isAnimating}
        >
          <span style={styles.stampIcon}>❌</span>
          <span style={styles.stampLabel}>خطأ</span>
        </motion.button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1.2rem',
    fontFamily: "'Cairo', sans-serif",
    minHeight: '520px',
    position: 'relative',
    background: 'linear-gradient(135deg, #5c3d2e 0%, #8b6f47 30%, #6b4c3b 60%, #4a3228 100%)',
    borderRadius: '20px',
    overflow: 'hidden',
  },
  deskHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    marginBottom: '12px',
  },
  deskIcon: {
    fontSize: '2rem',
  },
  deskTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#fef3c7',
    fontFamily: "'Cairo', sans-serif",
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  deskSubtitle: {
    fontSize: '0.8rem',
    color: '#d4c5a9',
    fontFamily: "'Cairo', sans-serif",
  },
  progressBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  progressText: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fef3c7',
    fontFamily: "'Cairo', sans-serif",
  },
  progressDots: {
    display: 'flex',
    gap: '6px',
    flexDirection: 'row-reverse',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  cardArea: {
    position: 'relative',
    width: '100%',
    maxWidth: '380px',
    minHeight: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  newsCard: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#fdfbf5',
    borderRadius: '4px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.1)',
    border: '1px solid #e8dcc8',
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    marginBottom: '16px',
  },
  cardHeaderLine: {
    flex: 1,
    height: '2px',
    backgroundColor: '#1a1a1a',
  },
  cardHeaderText: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: "'Cairo', sans-serif",
    letterSpacing: '2px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  cardEmoji: {
    fontSize: '3rem',
    marginBottom: '12px',
    lineHeight: 1,
  },
  cardText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: '1.9',
    fontFamily: "'Cairo', sans-serif",
    margin: '0 0 16px',
  },
  cardFooterLines: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'center',
  },
  fakeLine: {
    width: '80%',
    height: '3px',
    backgroundColor: '#e0d8c8',
    borderRadius: '2px',
  },
  stampOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '2rem',
    fontWeight: '900',
    fontFamily: "'Cairo', sans-serif",
    border: '4px solid',
    borderRadius: '12px',
    padding: '8px 24px',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  feedbackToast: {
    position: 'absolute',
    bottom: '-10px',
    padding: '8px 24px',
    borderRadius: '12px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1rem',
    fontFamily: "'Cairo', sans-serif",
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
  buttonsRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    maxWidth: '380px',
  },
  stampButtonTrue: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '14px 12px',
    borderRadius: '16px',
    border: '3px solid #22c55e',
    backgroundColor: '#f0fdf4',
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    boxShadow: '0 4px 15px rgba(34,197,94,0.25)',
  },
  stampButtonFalse: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '14px 12px',
    borderRadius: '16px',
    border: '3px solid #ef4444',
    backgroundColor: '#fef2f2',
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    boxShadow: '0 4px 15px rgba(239,68,68,0.25)',
  },
  stampIcon: {
    fontSize: '1.8rem',
    lineHeight: 1,
  },
  stampLabel: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#333',
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 2rem',
    fontFamily: "'Cairo', sans-serif",
    textAlign: 'center',
  },
  resultEmoji: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  resultTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#8B1538',
    marginBottom: '1rem',
    fontFamily: "'Cairo', sans-serif",
  },
  scoreCircle: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    backgroundColor: '#f8f0f2',
    padding: '1rem 2.5rem',
    borderRadius: '20px',
    marginBottom: '1rem',
    border: '2px solid rgba(139,21,56,0.15)',
  },
  scoreNumber: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#8B1538',
  },
  scoreDivider: {
    fontSize: '1.5rem',
    color: '#999',
  },
  scoreTotal: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#666',
  },
  resultMessage: {
    fontSize: '1rem',
    color: '#555',
    lineHeight: '1.8',
    fontFamily: "'Cairo', sans-serif",
  },
};

export default TrueFalseActivity;
