import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../contexts/GameContext";
import FloatingPoints from "./FloatingPoints";

export default function GameHUD() {
  const { points, streak, multiplier, difficulty, floatingPoints } = useGame();

  const difficultyLabels = { 1: "سهل", 2: "متوسط", 3: "صعب" };
  const difficultyColors = { 1: "#22c55e", 2: "#f59e0b", 3: "#ef4444" };

  return (
    <div style={styles.hud}>
      {/* Streak */}
      <AnimatePresence>
        {streak >= 2 && (
          <motion.div
            style={styles.streakBadge}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              style={styles.fireEmoji}
            >
              🔥
            </motion.span>
            <span style={styles.streakText}>x{multiplier}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Difficulty badge */}
      <motion.div
        key={difficulty}
        style={{
          ...styles.diffBadge,
          backgroundColor: `${difficultyColors[difficulty]}15`,
          border: `2px solid ${difficultyColors[difficulty]}`,
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: difficultyColors[difficulty], fontFamily: "'Cairo', sans-serif" }}>
          {difficultyLabels[difficulty]}
        </span>
      </motion.div>

      {/* Points */}
      <motion.div
        style={styles.pointsBox}
        key={points}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.3 }}
      >
        <span style={styles.pointsIcon}>⭐</span>
        <span style={styles.pointsNum}>{points}</span>
      </motion.div>

      {/* Floating Points */}
      <FloatingPoints items={floatingPoints} />
    </div>
  );
}

const styles = {
  hud: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 14,
    boxShadow: "0 2px 12px rgba(139,21,56,0.1)",
    position: "relative",
    gap: 12,
    backdropFilter: "blur(8px)",
  },
  streakBadge: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#fff3e0",
    border: "2px solid #f59e0b",
    borderRadius: 20,
    padding: "2px 10px",
  },
  fireEmoji: {
    fontSize: "1.1rem",
    display: "inline-block",
  },
  streakText: {
    fontSize: "0.9rem",
    fontWeight: 800,
    color: "#d97706",
    fontFamily: "'Cairo', sans-serif",
  },
  pointsBox: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fef9c3",
    border: "2px solid #facc15",
    borderRadius: 20,
    padding: "2px 12px",
  },
  diffBadge: {
    borderRadius: 20,
    padding: "2px 10px",
    display: "flex",
    alignItems: "center",
  },
  pointsIcon: {
    fontSize: "1rem",
  },
  pointsNum: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#92400e",
    fontFamily: "'Cairo', sans-serif",
    minWidth: 32,
    textAlign: "center",
  },
};
