import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const scaleIn = {
  hidden: { opacity: 1, scale: 1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

const LessonIcons = {
  quran: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      <path d="M12 6v7l3-2"/>
    </svg>
  ),
  hadith: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  seerah: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4l3 3"/>
    </svg>
  ),
  fiqh: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  aqeedah: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  akhlaq: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
};

const LESSONS_LIST = [
  { id: "quran", label: "القرآن الكريم", active: false },
  { id: "hadith", label: "الحديث الشريف", active: false },
  { id: "seerah", label: "السيرة النبوية", active: false },
  { id: "fiqh", label: "الفقه", active: false },
  { id: "aqeedah", label: "العقيدة", active: false },
  { id: "akhlaq", label: "الأخلاق", active: false },
];

export default function LessonsPage({ onBack }) {
  return (
    <motion.div
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.wrapper}
    >
      <div style={styles.topHeader}>
        <div style={styles.headerInner}>
          <button onClick={onBack} style={styles.backBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            الرجوع
          </button>
          <h1 style={styles.headerTitle}>الدروس</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div style={styles.content}>
        <motion.p variants={fadeUp} style={styles.subtitle}>
          اختاري الدرس الذي تريدين دراسته
        </motion.p>

        <div style={styles.grid}>
          {LESSONS_LIST.map((lesson) => (
            <motion.button
              key={lesson.id}
              variants={scaleIn}
              style={{
                ...styles.card,
                opacity: lesson.active ? 1 : 0.45,
                cursor: lesson.active ? "pointer" : "not-allowed",
              }}
              disabled={!lesson.active}
            >
              <div style={{
                ...styles.iconWrap,
                backgroundColor: lesson.active ? "#8B1538" : "#d1d5db",
                color: "#fff",
              }}>
                {LessonIcons[lesson.id]}
              </div>
              <span style={styles.cardLabel}>{lesson.label}</span>
              {lesson.active && <span style={styles.arrow}>←</span>}
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
    padding: "1.2rem 0",
  },
  headerInner: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "0 1.5rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    background: "rgba(255,255,255,0.12)",
    border: "none",
    borderRadius: 10,
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#fff",
  },
  content: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "1.5rem",
  },
  subtitle: {
    margin: "0 0 1.5rem",
    fontSize: "0.95rem",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "1rem",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.6rem",
    padding: "1.5rem 1rem",
    borderRadius: 16,
    border: "none",
    backgroundColor: "#fff",
    fontFamily: "inherit",
    position: "relative",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    transition: "box-shadow 0.2s",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  arrow: {
    fontSize: "0.9rem",
    color: "#8B1538",
    fontWeight: 700,
  },
};
