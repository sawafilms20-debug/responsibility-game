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

const ValuesIcons = {
  responsibility: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  honesty: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  ),
  respect: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  patience: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  generosity: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  compassion: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/>
      <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/>
      <line x1="10" y1="1" x2="10" y2="4"/>
      <line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
};

const VALUES_LIST = [
  { id: "responsibility", label: "المسؤولية", active: true },
  { id: "honesty", label: "الصدق", active: false },
  { id: "respect", label: "الاحترام", active: false },
  { id: "patience", label: "الصبر", active: false },
  { id: "generosity", label: "الكرم", active: false },
  { id: "compassion", label: "الرحمة", active: false },
];

export default function ValuesPage({ onSelectValue, onBack }) {
  return (
    <motion.div
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.wrapper}
    >
      {/* Top header */}
      <div style={styles.topHeader}>
        <div style={styles.headerInner}>
          <button onClick={onBack} style={styles.backBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            الرجوع
          </button>
          <h1 style={styles.headerTitle}>القيم</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <motion.p variants={fadeUp} style={styles.subtitle}>
          اختاري القيمة التي تريدين التعرف عليها
        </motion.p>

        <div style={styles.grid}>
          {VALUES_LIST.map((value) => (
            <motion.button
              key={value.id}
              variants={scaleIn}
              whileHover={value.active ? { y: -4, boxShadow: "0 12px 32px rgba(139,21,56,0.18)" } : {}}
              whileTap={value.active ? { scale: 0.97 } : {}}
              style={{
                ...styles.card,
                opacity: value.active ? 1 : 0.45,
                cursor: value.active ? "pointer" : "not-allowed",
              }}
              onClick={() => value.active && onSelectValue?.(value.id)}
              disabled={!value.active}
            >
              <div style={{
                ...styles.iconWrap,
                backgroundColor: value.active ? "#8B1538" : "#d1d5db",
                color: "#fff",
              }}>
                {ValuesIcons[value.id]}
              </div>
              <span style={styles.cardLabel}>{value.label}</span>
              {value.active && <span style={styles.arrow}>←</span>}
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
