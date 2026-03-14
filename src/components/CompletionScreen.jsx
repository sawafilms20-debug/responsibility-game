import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import ConfettiExplosion from "react-confetti-explosion";
import { playCelebration } from "../utils/sounds";
import { useGame } from "../contexts/GameContext";
import { gameData } from "../data/gameData";

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, staggerChildren: 0.15, delayChildren: 0.3 },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const trophy = {
  initial: { opacity: 0, scale: 0, rotate: -20 },
  animate: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 150, damping: 10, delay: 0.5 },
  },
};

function getMessage(earnedStars, totalActivities) {
  if (earnedStars >= totalActivities) return "ما شاء الله! أنتِ قدوة في المسؤولية!";
  if (earnedStars >= 6) return "أحسنتِ! أنتِ شخصية مسؤولة ورائعة!";
  if (earnedStars >= 4) return "جيد! استمري في تطوير مسؤوليتكِ!";
  return "لا بأس! يمكنكِ المحاولة مرة أخرى!";
}

export default function CompletionScreen({
  scores = {},
  stars = 0,
  totalActivities = 10,
  studentName = "",
  onRestart,
  onHome,
}) {
  const game = useGame();
  const earnedStars = typeof stars === "number" ? stars : 0;
  const message = useMemo(() => getMessage(earnedStars, totalActivities), [earnedStars, totalActivities]);
  const successCount = Object.values(scores).filter(Boolean).length || earnedStars;

  // Save result to localStorage
  useEffect(() => {
    if (studentName) {
      const results = JSON.parse(localStorage.getItem("gameResults") || "[]");
      results.push({
        name: studentName,
        score: successCount,
        total: totalActivities,
        points: game.points,
        date: new Date().toISOString(),
        details: scores,
      });
      localStorage.setItem("gameResults", JSON.stringify(results));
    }
  }, [studentName, successCount, totalActivities, game.points, scores]);

  useEffect(() => {
    const timer = setTimeout(() => playCelebration(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className="completion-screen"
      dir="rtl"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={styles.wrapper}
    >
      {/* Confetti */}
      <div style={styles.confettiContainer}>
        <ConfettiExplosion
          force={0.7}
          duration={3500}
          particleCount={120}
          width={1200}
          colors={["#8B1538", "#D4A853", "#F5D0DC", "#FFD700", "#fff"]}
        />
      </div>

      <motion.div style={styles.card} variants={fadeUp}>
        {/* Character */}
        <motion.div variants={trophy} style={styles.trophySection}>
          <img
            src="/images/characters/maryam_celebrating.png"
            alt="احتفال"
            style={{ width: 200, height: 200, objectFit: "contain" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </motion.div>

        {/* Student name */}
        {studentName && (
          <motion.div variants={fadeUp} style={styles.nameTag}>
            <span style={styles.nameLabel}>الطالبة</span>
            <span style={styles.nameValue}>{studentName}</span>
          </motion.div>
        )}

        {/* Heading */}
        <motion.h1 variants={fadeUp} style={styles.heading}>أحسنتِ!</motion.h1>

        {/* Score summary */}
        <motion.p variants={fadeUp} style={styles.scoreText}>
          أكملتِ {successCount} من {totalActivities} أنشطة بنجاح
        </motion.p>

        {/* Points */}
        <motion.div variants={fadeUp} style={styles.pointsDisplay}>
          <span style={{ fontSize: "1.3rem" }}>⭐</span>
          <span style={styles.pointsValue}>{game.points}</span>
          <span style={styles.pointsLabel}>نقطة</span>
        </motion.div>

        {/* Per-activity results */}
        <motion.div variants={fadeUp} style={styles.resultsGrid}>
          <h3 style={styles.resultsTitle}>تفاصيل النتائج</h3>
          {gameData.activities.map((activity, i) => {
            const score = scores[activity.id];
            const attempted = score !== undefined;
            const totalItems = activity.questions?.length || activity.statements?.length || activity.pairs?.length || activity.steps?.length || activity.scenarios?.length || activity.options?.filter(o => o.correct)?.length || 1;
            const correctCount = attempted ? Math.round(score * totalItems) : 0;
            const passed = score >= 0.7;
            return (
              <div key={activity.id} style={styles.resultRow}>
                <span style={styles.resultNum}>{i + 1}</span>
                <span style={styles.resultTitle}>{activity.title}</span>
                {attempted ? (
                  <span style={{
                    ...styles.resultBadge,
                    backgroundColor: passed ? "#dcfce7" : "#fee2e2",
                    color: passed ? "#16a34a" : "#dc2626",
                  }}>
                    {correctCount} / {totalItems}
                  </span>
                ) : (
                  <span style={{
                    ...styles.resultBadge,
                    backgroundColor: "#f3f4f6",
                    color: "#9ca3af",
                  }}>
                    —
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Message */}
        <motion.p variants={fadeUp} style={styles.message}>{message}</motion.p>

        {/* Buttons */}
        <motion.div variants={fadeUp} style={styles.buttonsRow}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRestart}
            style={styles.restartButton}
          >
            أعيدي اللعبة
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    position: "relative",
    overflow: "hidden",
    backgroundImage: "linear-gradient(rgba(253,242,244,0.6), rgba(255,255,255,0.65)), url(/images/backgrounds/bg_completion.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  confettiContainer: {
    position: "fixed",
    top: "30%",
    left: "50%",
    zIndex: 10,
    pointerEvents: "none",
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "2rem 1.5rem",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 8px 40px rgba(139,21,56,0.12)",
    textAlign: "center",
    border: "2px solid #f3e5f5",
    position: "relative",
    zIndex: 5,
  },
  trophySection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "0.5rem",
  },
  nameTag: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "0.8rem",
    padding: "0.6rem 1.5rem",
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    border: "2px solid #fbbf24",
  },
  nameLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#92400e",
  },
  nameValue: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#92400e",
  },
  heading: {
    fontSize: "1.8rem",
    color: "#8B1538",
    margin: "0 0 0.5rem",
    fontWeight: 800,
  },
  scoreText: {
    fontSize: "1.1rem",
    color: "#4A4A4A",
    marginBottom: "0.8rem",
    fontWeight: 600,
  },
  pointsDisplay: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    marginBottom: "1rem",
    padding: "0.5rem 1.2rem",
    background: "linear-gradient(135deg, #fef9c3, #fde68a)",
    borderRadius: 14,
    border: "2px solid #facc15",
  },
  pointsValue: {
    fontSize: "1.5rem",
    fontWeight: 900,
    color: "#92400e",
  },
  pointsLabel: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#a16207",
  },
  resultsGrid: {
    textAlign: "right",
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#fafafa",
    borderRadius: 16,
  },
  resultsTitle: {
    margin: "0 0 0.8rem",
    fontSize: "1rem",
    fontWeight: 700,
    color: "#8B1538",
    textAlign: "center",
  },
  resultRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.45rem 0",
    borderBottom: "1px solid #f0f0f0",
  },
  resultNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#8B1538",
    color: "#fff",
    fontSize: "0.7rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultTitle: {
    flex: 1,
    fontSize: "0.82rem",
    color: "#374151",
    fontWeight: 500,
  },
  resultBadge: {
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "0.2rem 0.6rem",
    borderRadius: 8,
    flexShrink: 0,
  },
  message: {
    fontSize: "1.15rem",
    color: "#8B1538",
    fontWeight: 700,
    marginBottom: "1.2rem",
    lineHeight: 1.8,
  },
  buttonsRow: {
    display: "flex",
    gap: "0.8rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  restartButton: {
    background: "linear-gradient(135deg, #8B1538, #A91D45)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    boxShadow: "0 4px 16px rgba(139,21,56,0.25)",
  },
  homeButton: {
    background: "#fff",
    color: "#8B1538",
    border: "2px solid #8B1538",
    borderRadius: 14,
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
  },
};
