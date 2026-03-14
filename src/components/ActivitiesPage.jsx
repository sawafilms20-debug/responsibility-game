import React from "react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 140, damping: 14 } },
};

const ActivityIcons = {
  quiz: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  matching: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  sorting: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  scenarios: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  truefalse: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  fillblank: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="10" x2="3" y2="10"/>
      <line x1="21" y1="6" x2="3" y2="6"/>
      <line x1="21" y1="14" x2="3" y2="14"/>
      <line x1="17" y1="18" x2="3" y2="18"/>
    </svg>
  ),
};

const ACTIVITIES_LIST = [
  { id: "quiz", label: "اختبارات", active: false },
  { id: "matching", label: "مطابقة", active: false },
  { id: "sorting", label: "ترتيب", active: false },
  { id: "scenarios", label: "مواقف", active: false },
  { id: "truefalse", label: "صح وخطأ", active: false },
  { id: "fillblank", label: "أكملي الفراغ", active: false },
];

export default function ActivitiesPage({ onBack }) {
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
          <h1 style={styles.headerTitle}>الأنشطة</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div style={styles.content}>
        <motion.p variants={fadeUp} style={styles.subtitle}>
          اختاري النشاط الذي تريدين القيام به
        </motion.p>

        <div style={styles.grid}>
          {ACTIVITIES_LIST.map((activity) => (
            <motion.button
              key={activity.id}
              variants={scaleIn}
              style={{
                ...styles.card,
                opacity: activity.active ? 1 : 0.45,
                cursor: activity.active ? "pointer" : "not-allowed",
              }}
              disabled={!activity.active}
            >
              <div style={{
                ...styles.iconWrap,
                backgroundColor: activity.active ? "#8B1538" : "#d1d5db",
                color: "#fff",
              }}>
                {ActivityIcons[activity.id]}
              </div>
              <span style={styles.cardLabel}>{activity.label}</span>
              {activity.active && <span style={styles.arrow}>←</span>}
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
