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

const EventIcons = {
  nationalDay: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  competitions: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  workshops: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  trips: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 7 8 11.7z"/>
    </svg>
  ),
  exhibitions: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  ceremonies: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const EVENTS_LIST = [
  { id: "nationalDay", label: "اليوم الوطني", active: false },
  { id: "competitions", label: "المسابقات", active: false },
  { id: "workshops", label: "ورش العمل", active: false },
  { id: "trips", label: "الرحلات", active: false },
  { id: "exhibitions", label: "المعارض", active: false },
  { id: "ceremonies", label: "الحفلات", active: false },
];

export default function EventsPage({ onBack }) {
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
          <h1 style={styles.headerTitle}>الفعاليات</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>

      <div style={styles.content}>
        <motion.p variants={fadeUp} style={styles.subtitle}>
          اختاري الفعالية التي تريدين المشاركة فيها
        </motion.p>

        <div style={styles.grid}>
          {EVENTS_LIST.map((event) => (
            <motion.button
              key={event.id}
              variants={scaleIn}
              style={{
                ...styles.card,
                opacity: event.active ? 1 : 0.45,
                cursor: event.active ? "pointer" : "not-allowed",
              }}
              disabled={!event.active}
            >
              <div style={{
                ...styles.iconWrap,
                backgroundColor: event.active ? "#8B1538" : "#d1d5db",
                color: "#fff",
              }}>
                {EventIcons[event.id]}
              </div>
              <span style={styles.cardLabel}>{event.label}</span>
              {event.active && <span style={styles.arrow}>←</span>}
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
