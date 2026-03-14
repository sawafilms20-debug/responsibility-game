import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 120, damping: 14 } },
};

/* SVG Icons — clean, professional, no emojis */
const Icons = {
  values: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  lessons: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <path d="M8 7h8M8 11h6"/>
    </svg>
  ),
  activities: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <path d="M9 14l2 2 4-4"/>
    </svg>
  ),
  events: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
    </svg>
  ),
};

const SECTIONS = [
  { id: "values", label: "القيم", icon: "values", desc: "تعرّفي على القيم والأخلاق" },
  { id: "lessons", label: "الدروس", icon: "lessons", desc: "الدروس التعليمية" },
  { id: "activities", label: "الأنشطة", icon: "activities", desc: "أنشطة تفاعلية" },
  { id: "events", label: "الفعاليات", icon: "events", desc: "الفعاليات والمناسبات" },
];

export default function MainLanding({ onNavigate }) {
  return (
    <motion.div
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.wrapper}
    >
      {/* Top maroon header */}
      <div style={styles.topHeader}>
        <div style={styles.headerInner}>
          <div style={styles.headerRight}>
            <div style={styles.avatarCircle}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h1 style={styles.teacherName}>أ. منال القحطاني</h1>
              <p style={styles.stage}>المرحلة الإعدادية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={styles.content}>
        {/* Welcome */}
        <motion.div variants={fadeUp} style={styles.welcomeSection}>
          <h2 style={styles.welcomeTitle}>مرحباً بكنّ</h2>
          <p style={styles.welcomeText}>اختاري القسم الذي تريدين الدخول إليه</p>
        </motion.div>

        {/* Section cards */}
        <div style={styles.grid}>
          {SECTIONS.map((section) => (
            <motion.button
              key={section.id}
              variants={scaleIn}
              whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(139,21,56,0.18)" }}
              whileTap={{ scale: 0.97 }}
              style={styles.card}
              onClick={() => onNavigate?.(section.id)}
            >
              <div style={styles.iconWrap}>
                {Icons[section.icon]}
              </div>
              <span style={styles.cardLabel}>{section.label}</span>
              <span style={styles.cardDesc}>{section.desc}</span>
              <span style={styles.arrow}>←</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    backgroundColor: "#f8f4f5",
  },
  topHeader: {
    background: "linear-gradient(135deg, #8B1538, #6b0f2b)",
    padding: "1.5rem 0",
  },
  headerInner: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "2px solid rgba(255,255,255,0.25)",
  },
  teacherName: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.3,
  },
  stage: {
    margin: 0,
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.7)",
    fontWeight: 500,
  },
  content: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "2rem 1.5rem",
  },
  welcomeSection: {
    marginBottom: "2rem",
  },
  welcomeTitle: {
    margin: "0 0 0.3rem",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  welcomeText: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.5rem",
    padding: "1.5rem",
    borderRadius: 16,
    border: "none",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "right",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.2s, transform 0.2s",
    position: "relative",
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fce4ec",
    color: "#8B1538",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "0.3rem",
  },
  cardLabel: {
    fontSize: "1.15rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  cardDesc: {
    fontSize: "0.78rem",
    color: "#9ca3af",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  arrow: {
    position: "absolute",
    bottom: 16,
    left: 16,
    fontSize: "1.1rem",
    color: "#8B1538",
    fontWeight: 700,
  },
};
