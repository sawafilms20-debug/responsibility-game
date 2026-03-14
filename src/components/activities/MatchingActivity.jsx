import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../contexts/GameContext';
import { playCorrect, playWrong, playSelect, playStreak } from '../../utils/sounds';
import ConfettiExplosion from '../../components/ConfettiExplosion';

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const AVATAR_COLORS = ['#e91e63', '#9c27b0', '#2196f3', '#009688', '#ff5722', '#795548', '#607d8b', '#4caf50'];
const AVATAR_INITIALS = ['م', 'ن', 'س', 'ل', 'ع', 'ف', 'ه', 'ر'];

const MatchingActivity = ({ data, onComplete, activityIcon }) => {
  const { instruction, pairs } = data;
  const game = useGame();

  // Shuffle hashtag badges order
  const shuffledHashtags = useMemo(() => shuffleArray(pairs), [pairs]);
  // Shuffle posts order
  const shuffledPosts = useMemo(() => shuffleArray(pairs), [pairs]);

  const [selectedHashtag, setSelectedHashtag] = useState(null); // pair id
  const [matched, setMatched] = useState({}); // { pairId: true }
  const [shaking, setShaking] = useState(null); // pair id of post shaking
  const [heartAnim, setHeartAnim] = useState(null); // pair id showing heart
  const [done, setDone] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const completedRef = useRef(false);

  const matchedCount = Object.keys(matched).length;

  // Random like counts for visual flair
  const likeCounts = useMemo(() => {
    const map = {};
    pairs.forEach((p) => {
      map[p.id] = Math.floor(Math.random() * 200) + 10;
    });
    return map;
  }, [pairs]);

  const handleHashtagClick = (pairId) => {
    if (done || shaking || matched[pairId]) return;
    playSelect();
    setSelectedHashtag((prev) => (prev === pairId ? null : pairId));
  };

  const handlePostClick = (pairId) => {
    if (done || shaking || matched[pairId]) return;

    if (!selectedHashtag) return; // Must select a hashtag first

    if (selectedHashtag === pairId) {
      // Correct match
      playCorrect();
      game.addPoints(40);
      game.incrementStreak();
      setConfettiTrigger(t => t + 1);

      const newMatched = { ...matched, [pairId]: true };
      setMatched(newMatched);
      setSelectedHashtag(null);

      // Heart animation
      setHeartAnim(pairId);
      setTimeout(() => setHeartAnim(null), 1000);

      // Check completion
      if (Object.keys(newMatched).length === pairs.length) {
        completedRef.current = true;
        setDone(true);
        setTimeout(() => playStreak(pairs.length), 300);
        setTimeout(() => onComplete(Object.keys(newMatched).length / pairs.length), 1500);
      }
    } else {
      // Wrong match - auto-match the correct pair and move on
      playWrong();
      game.resetStreak();
      setShaking(pairId);
      setTimeout(() => {
        // Match the selected hashtag with its correct post
        const newMatched = { ...matched, [selectedHashtag]: true };
        setMatched(newMatched);
        setShaking(null);
        setSelectedHashtag(null);

        // Check completion
        if (Object.keys(newMatched).length === pairs.length) {
          completedRef.current = true;
          setDone(true);
          setTimeout(() => onComplete(Object.keys(newMatched).filter(id => matched[id]).length / pairs.length), 1500);
        }
      }, 600);
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Activity icon */}
      {activityIcon && (
        <div style={{ display: "flex", justifyContent: "center", margin: "0.5rem 0" }}>
          <img src={activityIcon} alt="" style={{ width: 150, height: 150, objectFit: "contain" }} />
        </div>
      )}
      {/* App header bar */}
      <div style={styles.appBar}>
        <span style={styles.appBarTitle}>📱 المسؤولية - فيد</span>
        <span style={styles.appBarUser}>@student</span>
      </div>

      {/* Instruction */}
      <motion.p
        style={styles.instruction}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {instruction || 'طابقي كل هاشتاق بالمنشور المناسب'}
      </motion.p>

      {/* Progress */}
      <div style={styles.progressRow}>
        <span style={styles.progressText}>
          {matchedCount} / {pairs.length} تم المطابقة
        </span>
      </div>

      {/* Hashtag badges */}
      <div style={styles.hashtagRow}>
        {shuffledHashtags.map((pair) => {
          const isMatched = matched[pair.id];
          const isSelected = selectedHashtag === pair.id;
          return (
            <motion.button
              key={`tag-${pair.id}`}
              onClick={() => handleHashtagClick(pair.id)}
              style={{
                ...styles.hashtagBadge,
                backgroundColor: isMatched
                  ? '#dcfce7'
                  : isSelected
                  ? '#8B1538'
                  : '#f3f4f6',
                color: isMatched
                  ? '#16a34a'
                  : isSelected
                  ? '#fff'
                  : '#333',
                border: isMatched
                  ? '2px solid #22c55e'
                  : isSelected
                  ? '2px solid #8B1538'
                  : '2px solid #e5e7eb',
                cursor: isMatched ? 'default' : 'pointer',
                opacity: isMatched ? 0.6 : 1,
              }}
              whileHover={!isMatched ? { scale: 1.05 } : {}}
              whileTap={!isMatched ? { scale: 0.95 } : {}}
              animate={isSelected ? { y: -3 } : { y: 0 }}
            >
              <span>{pair.right.emoji}</span>
              <span style={styles.hashtagText}>#{pair.right.text}</span>
              {isMatched && <span>✓</span>}
            </motion.button>
          );
        })}
      </div>

      {/* Posts feed */}
      <div style={styles.feed}>
        {shuffledPosts.map((pair, idx) => {
          const isMatched = matched[pair.id];
          const isShaking = shaking === pair.id;
          const showHeart = heartAnim === pair.id;
          const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
          const avatarInitial = AVATAR_INITIALS[idx % AVATAR_INITIALS.length];

          return (
            <motion.div
              key={`post-${pair.id}`}
              onClick={() => handlePostClick(pair.id)}
              style={{
                ...styles.postCard,
                cursor: isMatched ? 'default' : selectedHashtag ? 'pointer' : 'default',
                borderColor: isMatched ? '#22c55e' : selectedHashtag && !isMatched ? '#8B153844' : '#e5e7eb',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={
                isShaking
                  ? { opacity: 1, y: 0, x: [0, -8, 8, -8, 8, 0] }
                  : { opacity: 1, y: 0, x: 0 }
              }
              transition={
                isShaking
                  ? { x: { duration: 0.5 } }
                  : { duration: 0.4, delay: idx * 0.08 }
              }
              whileHover={selectedHashtag && !isMatched ? { scale: 1.01, boxShadow: '0 4px 20px rgba(139,21,56,0.15)' } : {}}
            >
              {/* Post header with avatar */}
              <div style={styles.postHeader}>
                <div style={{ ...styles.avatar, backgroundColor: avatarColor }}>
                  <span style={styles.avatarText}>{avatarInitial}</span>
                </div>
                <div style={styles.postHeaderInfo}>
                  <span style={styles.postUsername}>طالبة_{idx + 1}</span>
                  <span style={styles.postTime}>منذ {Math.floor(Math.random() * 12) + 1} ساعة</span>
                </div>
                {isMatched && (
                  <motion.span
                    style={styles.verifiedBadge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    ✅
                  </motion.span>
                )}
              </div>

              {/* Post content */}
              <div style={styles.postBody}>
                <p style={styles.postText}>{pair.left.text}</p>
              </div>

              {/* Post footer - likes, etc. */}
              <div style={styles.postFooter}>
                <div style={styles.postActions}>
                  <span style={{
                    ...styles.likeButton,
                    color: isMatched ? '#ef4444' : '#666',
                  }}>
                    {isMatched ? '❤️' : '🤍'} {isMatched ? likeCounts[pair.id] + 1 : likeCounts[pair.id]}
                  </span>
                  <span style={styles.commentButton}>💬 {Math.floor(Math.random() * 20) + 1}</span>
                </div>

                {/* Matched hashtag pinned on post */}
                {isMatched && (
                  <motion.div
                    style={styles.pinnedHashtag}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <span>{pair.right.emoji}</span>
                    <span style={styles.pinnedHashtagText}>#{pair.right.text}</span>
                  </motion.div>
                )}
              </div>

              {/* Heart burst animation */}
              <AnimatePresence>
                {showHeart && (
                  <motion.div
                    style={styles.heartBurst}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  >
                    ❤️
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Hint text */}
      {!selectedHashtag && matchedCount < pairs.length && (
        <motion.p
          style={styles.hintText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1 }}
        >
          اختاري هاشتاق ثم انقري على المنشور المناسب
        </motion.p>
      )}

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
                {matchedCount === pairs.length ? '🌟' : '📱'}
              </motion.span>
              <h2 style={styles.doneTitle}>
                {matchedCount === pairs.length ? 'ممتازة !' : 'انتهت المطابقة!'}
              </h2>
              <p style={styles.doneSubtitle}>
                {matchedCount === pairs.length
                  ? 'تم مطابقة جميع الهاشتاقات بنجاح'
                  : `تم مطابقة ${matchedCount} من ${pairs.length} منشورات`}
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
    padding: '0',
    maxWidth: '500px',
    margin: '0 auto',
    position: 'relative',
    minHeight: '520px',
    backgroundColor: '#fafafa',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
  },
  appBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  appBarTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: "'Cairo', sans-serif",
  },
  appBarUser: {
    fontSize: '0.8rem',
    color: '#8B1538',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
  },
  instruction: {
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#555',
    margin: '12px 16px 8px',
    lineHeight: '1.7',
    fontFamily: "'Cairo', sans-serif",
  },
  progressRow: {
    textAlign: 'center',
    marginBottom: '12px',
  },
  progressText: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#8B1538',
    fontFamily: "'Cairo', sans-serif",
    backgroundColor: '#f8f0f2',
    padding: '3px 14px',
    borderRadius: '10px',
    display: 'inline-block',
  },
  hashtagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    padding: '8px 16px 16px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  hashtagBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
    outline: 'none',
    transition: 'all 0.2s',
  },
  hashtagText: {
    fontFamily: "'Cairo', sans-serif",
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: '14px',
    border: '2px solid #e5e7eb',
    overflow: 'hidden',
    position: 'relative',
    transition: 'border-color 0.2s',
  },
  postHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px 0',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '700',
    fontFamily: "'Cairo', sans-serif",
  },
  postHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  postUsername: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: "'Cairo', sans-serif",
  },
  postTime: {
    fontSize: '0.7rem',
    color: '#999',
    fontFamily: "'Cairo', sans-serif",
  },
  verifiedBadge: {
    fontSize: '1.2rem',
  },
  postBody: {
    padding: '10px 14px',
  },
  postText: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.8',
    margin: 0,
    fontFamily: "'Cairo', sans-serif",
  },
  postFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 14px 12px',
    borderTop: '1px solid #f3f4f6',
  },
  postActions: {
    display: 'flex',
    gap: '16px',
  },
  likeButton: {
    fontSize: '0.8rem',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  commentButton: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '600',
    fontFamily: "'Cairo', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  pinnedHashtag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '3px 10px',
    borderRadius: '12px',
    backgroundColor: '#ede9fe',
    border: '1px solid #8B1538',
  },
  pinnedHashtagText: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#8B1538',
    fontFamily: "'Cairo', sans-serif",
  },
  heartBurst: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '3rem',
    pointerEvents: 'none',
    zIndex: 5,
  },
  hintText: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#999',
    fontFamily: "'Cairo', sans-serif",
    padding: '8px 16px',
    margin: 0,
  },
  doneOverlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250,250,250,0.92)',
    borderRadius: '20px',
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

export default MatchingActivity;
