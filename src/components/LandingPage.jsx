import React from "react";
import { motion } from "framer-motion";
import { playStart } from "../utils/sounds";
// AnimatedBackground available but using real photo background for landing

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.35, delayChildren: 0.2 },
  },
  exit: { opacity: 0, y: -40, transition: { duration: 0.5 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 12 },
  },
};

const starVariants = {
  hidden: { opacity: 0, scale: 0, rotate: -180 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { delay: 1.8 + i * 0.15, type: "spring", stiffness: 200 },
  }),
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
};

export default function LandingPage({ onStart, onBack }) {
  return (
    <motion.div
      className="landing-page full-screen-bg"
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.wrapper}
    >
      <div style={styles.content}>
        {/* Back button */}
        {onBack && (
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={styles.backBtn}
          >
            → الرجوع
          </motion.button>
        )}

        {/* Bismillah */}
        <motion.p variants={fadeUp} style={styles.bismillah}>
          بسم الله الرحمن الرحيم
        </motion.p>

        {/* Title */}
        <motion.div variants={scaleIn} style={styles.titleBlock}>
          <h1 style={styles.title}>القيمة</h1>
          <h1 style={styles.titleAccent}>المسؤولية</h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p variants={fadeUp} style={styles.subtitle}>
          تعلّمي عن قيمة المسؤولية تجاه نفسكِ وأهلكِ ومدرستكِ ودينكِ ووطنكِ
        </motion.p>

        {/* Golden stars */}
        <motion.div variants={fadeUp} style={styles.starsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              custom={i}
              variants={starVariants}
              style={styles.star}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Character */}
        <motion.div variants={fadeUp} style={styles.characterSection}>
          <motion.img
            src="/images/characters/maryam_waving.png"
            alt="الشخصية"
            className="landing-character"
            animate={floatAnimation}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </motion.div>

        {/* CTA Button */}
        <motion.button
          variants={fadeUp}
          whileHover={{ scale: 1.08, boxShadow: "0 8px 30px rgba(139,21,56,0.5)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playStart(); onStart?.(); }}
          style={styles.ctaButton}
        >
          <motion.span
            animate={{ x: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            style={styles.playIcon}
          >
            ▶
          </motion.span>
          ابدأي الرحلة
        </motion.button>
      </div>
    </motion.div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontFamily: "'Tajawal', 'Cairo', sans-serif",
    position: "relative",
    overflow: "hidden",
    backgroundImage: "linear-gradient(rgba(139,21,56,0.25), rgba(0,0,0,0.3)), url(/images/backgrounds/bg_nature.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.9)",
    border: "none",
    borderRadius: 12,
    padding: "0.5rem 1.2rem",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#8B1538",
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    marginBottom: "0.5rem",
  },
  content: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    width: "100%",
  },
  bismillah: {
    fontSize: "1.8rem",
    color: "#fff",
    marginBottom: "0.8rem",
    fontWeight: 600,
    textShadow: "0 2px 12px rgba(0,0,0,0.3), 0 0 20px rgba(212,168,83,0.4)",
    letterSpacing: "0.02em",
  },
  titleBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "0.6rem",
  },
  title: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#fff",
    margin: 0,
    lineHeight: 1.1,
    textShadow: "0 3px 15px rgba(0,0,0,0.35), 0 0 30px rgba(139,21,56,0.3)",
  },
  titleAccent: {
    fontSize: "4.5rem",
    fontWeight: 900,
    color: "#fff",
    margin: 0,
    lineHeight: 1.1,
    textShadow: "0 3px 15px rgba(0,0,0,0.4), 0 0 40px rgba(255,255,255,0.3)",
  },
  subtitle: {
    fontSize: "1.3rem",
    color: "#fff",
    maxWidth: "540px",
    lineHeight: 1.9,
    marginBottom: "0.8rem",
    fontWeight: 600,
    textShadow: "0 2px 10px rgba(0,0,0,0.35)",
    backgroundColor: "rgba(0,0,0,0.15)",
    padding: "0.6rem 1.5rem",
    borderRadius: 16,
    backdropFilter: "blur(4px)",
  },
  starsRow: {
    display: "flex",
    gap: "0.6rem",
    marginBottom: "1.2rem",
  },
  star: {
    fontSize: "2.2rem",
    display: "inline-block",
    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
  },
  characterSection: {
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  characterImg: {
    width: 520,
    height: 520,
    objectFit: "contain",
    filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.25))",
    flexShrink: 0,
  },
  speechBubble: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: "1.2rem",
    padding: "1.2rem 1.6rem",
    maxWidth: 320,
    boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
    position: "relative",
    border: "2px solid rgba(139,21,56,0.2)",
    backdropFilter: "blur(8px)",
  },
  speechText: {
    margin: 0,
    fontSize: "1.15rem",
    color: "#333",
    lineHeight: 1.8,
    fontWeight: 600,
  },
  speechTail: {
    position: "absolute",
    right: "100%",
    top: "50%",
    marginTop: -8,
    width: 0,
    height: 0,
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
    borderLeft: "none",
    borderRight: "12px solid rgba(255,255,255,0.95)",
  },
  ctaButton: {
    background: "linear-gradient(135deg, #8B1538, #C62853)",
    color: "#fff",
    border: "3px solid rgba(255,255,255,0.3)",
    borderRadius: "3rem",
    padding: "1.1rem 3.5rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    fontFamily: "'Tajawal', 'Cairo', sans-serif",
    boxShadow: "0 6px 25px rgba(139,21,56,0.4), 0 0 40px rgba(139,21,56,0.15)",
    letterSpacing: "0.02em",
  },
  playIcon: {
    display: "inline-block",
    fontSize: "1.1rem",
  },
};
