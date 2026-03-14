import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { playCorrect, playWrong, playDrop, playClick } from '../../utils/sounds';
import ConfettiExplosion from '../../components/ConfettiExplosion';

// Unified soft colors matching category themes
const CATEGORY_SOFT = {
  self_school: { bg: '#ede9fe', border: '#8B1538', header: '#8B1538', noteBg: '#f5f3ff' },
  family_religion: { bg: '#fce7f3', border: '#8B1538', header: '#8B1538', noteBg: '#fdf2f8' },
  country: { bg: '#fef3c7', border: '#8B1538', header: '#8B1538', noteBg: '#fffbeb' },
};

const ClassifyActivity = ({ data, onComplete, activityIcon }) => {
  const { instruction, items, categories } = data;
  const game = useGame();

  const [placed, setPlaced] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [shaking, setShaking] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [done, setDone] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const completedRef = useRef(false);

  // Get soft color for each item based on its category
  const getItemColor = useCallback((item) => {
    const cat = CATEGORY_SOFT[item.category] || CATEGORY_SOFT.self_school;
    return cat.noteBg;
  }, []);

  const unplacedItems = useMemo(
    () => items.filter((item) => !placed[item.id]),
    [items, placed]
  );

  const placedInCategory = useCallback(
    (catId) => items.filter((item) => placed[item.id] === catId),
    [items, placed]
  );

  const handleItemClick = (item) => {
    if (done || shaking) return;
    playClick();
    setSelectedItem((prev) => (prev?.id === item.id ? null : item));
  };

  const handleCategoryClick = (categoryId) => {
    if (done || !selectedItem || shaking) return;

    const isCorrect = selectedItem.category === categoryId;

    if (isCorrect) {
      playDrop();
      game.addPoints(30);
      game.incrementStreak();
      setConfettiTrigger(t => t + 1);

      const newPlaced = { ...placed, [selectedItem.id]: categoryId };
      setPlaced(newPlaced);
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setSelectedItem(null);

      // Check if all items placed
      const allPlaced = items.every((i) => newPlaced[i.id]);
      if (allPlaced && !completedRef.current) {
        completedRef.current = true;
        setDone(true);
        setTimeout(() => playCorrect(), 300);
        setTimeout(() => onComplete(newCorrect / items.length), 1500);
      }
    } else {
      playWrong();
      game.resetStreak();
      setWrongCount((prev) => prev + 1);
      setShaking(selectedItem.id);
      setTimeout(() => {
        // Auto-place in correct category and move on
        const correctCat = selectedItem.category;
        const newPlaced = { ...placed, [selectedItem.id]: correctCat };
        setPlaced(newPlaced);
        setShaking(null);
        setSelectedItem(null);

        // Check if all items placed
        const allPlaced = items.every((i) => newPlaced[i.id]);
        if (allPlaced && !completedRef.current) {
          completedRef.current = true;
          setDone(true);
          setTimeout(() => onComplete(correctCount / items.length), 1500);
        }
      }, 600);
    }
  };

  const totalPlaced = Object.keys(placed).length;

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Notebook spiral binding hint */}
      <div style={styles.spiralRow}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={styles.spiralRing} />
        ))}
      </div>

      {/* Header */}
      <div style={styles.header}>
        {activityIcon ? (
          <img src={activityIcon} alt="" className="activity-character" />
        ) : (
          <span style={styles.headerIcon}>📅</span>
        )}
        <span style={styles.headerTitle}>المخطط الأسبوعي</span>
      </div>

      {/* Instruction */}
      <motion.p
        style={styles.instruction}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {instruction}
      </motion.p>

      {/* Progress */}
      <div style={styles.progressRow}>
        <span style={styles.progressText}>
          تم ترتيب {totalPlaced} من {items.length}
        </span>
      </div>

      {/* Category columns */}
      <div style={styles.categoriesRow}>
        {categories.map((cat) => {
          const catItems = placedInCategory(cat.id);
          const isTarget = selectedItem !== null;
          const catTheme = CATEGORY_SOFT[cat.id] || CATEGORY_SOFT.self_school;
          return (
            <motion.div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                ...styles.categoryBox,
                borderColor: catTheme.border,
                backgroundColor: catTheme.bg,
                cursor: isTarget ? 'pointer' : 'default',
              }}
              whileHover={isTarget ? { scale: 1.03, boxShadow: '0 0 0 3px rgba(139,21,56,0.25)' } : {}}
              whileTap={isTarget ? { scale: 0.97 } : {}}
              animate={isTarget ? { borderStyle: 'dashed' } : { borderStyle: 'solid' }}
            >
              {/* Category header */}
              <div
                style={{
                  ...styles.categoryHeader,
                  backgroundColor: catTheme.header,
                }}
              >
                <span style={styles.categoryEmoji}>{cat.emoji}</span>
                <span style={styles.categoryLabel}>{cat.label}</span>
              </div>

              {/* Placed items inside category */}
              <div style={styles.categoryContent}>
                <AnimatePresence>
                  {catItems.map((item) => (
                    <motion.div
                      key={item.id}
                      style={{
                        ...styles.placedNote,
                        backgroundColor: getItemColor(item),
                      }}
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <span>{item.emoji}</span>
                      <span style={styles.placedNoteText}>{item.text}</span>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        style={styles.checkMark}
                      >
                        ✓
                      </motion.span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {catItems.length === 0 && isTarget && (
                  <p style={styles.dropHint}>ضعي هنا</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sticky notes pool */}
      <div style={styles.stickyPool}>
        <p style={styles.poolLabel}>المهام:</p>
        <div style={styles.stickyGrid}>
          <AnimatePresence>
            {unplacedItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isShaking = shaking === item.id;
              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    ...styles.stickyNote,
                    backgroundColor: '#fff',
                    border: isSelected ? '2px solid #8B1538' : '1px solid #e5e7eb',
                    boxShadow: isSelected
                      ? '0 4px 16px rgba(139,21,56,0.2)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  initial={{ opacity: 0, scale: 0.7, y: 20 }}
                  animate={
                    isShaking
                      ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 10, -10, 10, 0] }
                      : { opacity: 1, scale: isSelected ? 1.08 : 1, y: isSelected ? -5 : 0, x: 0 }
                  }
                  exit={{ opacity: 0, scale: 0.3, y: -30 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span style={styles.stickyEmoji}>{item.emoji}</span>
                  <span style={styles.stickyText}>{item.text}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {unplacedItems.length === 0 && !done && (
          <p style={styles.emptyText}>تم توزيع جميع المهام!</p>
        )}
      </div>

      {/* Done overlay */}
      <AnimatePresence>
        {done && (
          <motion.div
            style={styles.doneOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              style={styles.doneCard}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <motion.span
                style={styles.doneEmoji}
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {correctCount === items.length ? '🎉' : '📅'}
              </motion.span>
              <h2 style={styles.doneTitle}>
                {correctCount === items.length ? 'أحسنتِ !' : 'تم الترتيب!'}
              </h2>
              <p style={styles.doneSubtitle}>
                {correctCount === items.length
                  ? 'تم ترتيب جميع المهام بشكل صحيح'
                  : `تم ترتيب ${correctCount} من ${items.length} مهام بشكل صحيح`}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Cairo', sans-serif",
    padding: '16px 20px',
    maxWidth: '900px',
    margin: '0 auto',
    position: 'relative',
    minHeight: '520px',
    background: 'repeating-linear-gradient(transparent, transparent 27px, #e0ddd4 28px)',
    backgroundColor: '#faf8f0',
    borderRadius: '16px',
    border: '1px solid #d4cfc0',
  },
  spiralRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '28px',
    marginBottom: '8px',
    marginTop: '-8px',
  },
  spiralRing: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    border: '3px solid #999',
    backgroundColor: 'transparent',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  headerIcon: {
    fontSize: '1.6rem',
  },
  headerTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#8B1538',
    fontFamily: "'Cairo', sans-serif",
  },
  instruction: {
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#555',
    margin: '0 0 12px',
    lineHeight: '1.8',
    fontFamily: "'Cairo', sans-serif",
  },
  progressRow: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  progressText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#8B1538',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#f8f0f2',
    padding: '4px 16px',
    borderRadius: '12px',
    display: 'inline-block',
  },
  categoriesRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  categoryBox: {
    borderRadius: '14px',
    border: '2px solid',
    overflow: 'hidden',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 14px',
    color: '#fff',
  },
  categoryEmoji: {
    fontSize: '1.2rem',
  },
  categoryLabel: {
    fontSize: '0.95rem',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
  },
  categoryContent: {
    flex: 1,
    padding: '10px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignContent: 'flex-start',
    justifyContent: 'center',
    minHeight: '60px',
  },
  placedNote: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
    boxShadow: '1px 2px 4px rgba(0,0,0,0.1)',
  },
  placedNoteText: {
    color: '#333',
  },
  checkMark: {
    color: '#16a34a',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  dropHint: {
    color: '#aaa',
    fontSize: '0.8rem',
    fontFamily: "'Cairo', sans-serif",
    textAlign: 'center',
    width: '100%',
    margin: 'auto 0',
    fontStyle: 'italic',
  },
  stickyPool: {
    marginTop: '8px',
  },
  poolLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#8B1538',
    margin: '0 0 8px',
    fontFamily: "'Cairo', sans-serif",
  },
  stickyGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
  },
  stickyNote: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    minWidth: '100px',
    maxWidth: '160px',
    fontFamily: "'Cairo', sans-serif",
  },
  stickyEmoji: {
    fontSize: '1.4rem',
  },
  stickyText: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    lineHeight: '1.5',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: '0.85rem',
    fontFamily: "'Cairo', sans-serif",
  },
  doneOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250,248,240,0.92)',
    borderRadius: '16px',
    zIndex: 10,
  },
  doneCard: {
    textAlign: 'center',
    padding: '36px 44px',
    borderRadius: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 8px 30px rgba(139,21,56,0.18)',
  },
  doneEmoji: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '10px',
  },
  doneTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#8B1538',
    margin: '0 0 8px',
    fontFamily: "'Cairo', sans-serif",
  },
  doneSubtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
    lineHeight: '1.8',
  },
};

export default ClassifyActivity;
