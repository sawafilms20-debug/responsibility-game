import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAchievements } from "../contexts/AchievementsContext";

export default function AchievementPopup() {
  const { popup } = useAchievements();

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          key={popup.id}
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            style={styles.card}
            initial={{ scale: 0, rotate: -10, y: 50 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              style={styles.emojiWrap}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span style={styles.emoji}>{popup.emoji}</span>
            </motion.div>
            <div style={styles.label}>إنجاز جديد!</div>
            <div style={styles.title}>{popup.title}</div>
            <div style={styles.desc}>{popup.desc}</div>
            <motion.div
              style={styles.shimmer}
              animate={{ x: [-200, 200] }}
              transition={{ duration: 1.5, repeat: 1, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    pointerEvents: "none",
  },
  card: {
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    borderRadius: 24,
    padding: "32px 40px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245,158,11,0.3)",
    border: "2px solid rgba(245,158,11,0.4)",
    position: "relative",
    overflow: "hidden",
    maxWidth: 320,
  },
  emojiWrap: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f59e0b, #ef4444)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    boxShadow: "0 0 30px rgba(245,158,11,0.5)",
  },
  emoji: {
    fontSize: "2.5rem",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#f59e0b",
    letterSpacing: 2,
    textTransform: "uppercase",
    fontFamily: "'Cairo', sans-serif",
    marginBottom: 4,
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#fff",
    fontFamily: "'Cairo', sans-serif",
    marginBottom: 8,
  },
  desc: {
    fontSize: "0.9rem",
    color: "rgba(255,255,255,0.7)",
    fontFamily: "'Cairo', sans-serif",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
    pointerEvents: "none",
  },
};
