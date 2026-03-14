import React, { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

export default function NameEntryScreen({ onSubmit, onBack }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit?.(name.trim());
    }
  };

  return (
    <motion.div
      dir="rtl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={styles.wrapper}
    >
      <motion.div style={styles.card} variants={fadeUp}>
        {/* Back */}
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

        {/* Character */}
        <motion.img
          src="/images/characters/maryam_waving.png"
          alt="الشخصية"
          style={styles.character}
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />

        <motion.h1 variants={fadeUp} style={styles.title}>
          أحسنتِ! أكملتِ جميع الأنشطة
        </motion.h1>

        <motion.p variants={fadeUp} style={styles.subtitle}>
          أدخلي اسمكِ لعرض النتيجة وحفظها
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="أدخلي اسمكِ هنا..."
            style={styles.input}
            autoFocus
          />
          <motion.button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: name.trim() ? 1 : 0.5,
            }}
            whileHover={name.trim() ? { scale: 1.05 } : {}}
            whileTap={name.trim() ? { scale: 0.95 } : {}}
            disabled={!name.trim()}
          >
            عرض النتيجة
          </motion.button>
        </motion.form>
      </motion.div>
    </motion.div>
  );
}

const styles = {
  backBtn: {
    alignSelf: "flex-start",
    background: "#f3f4f6",
    border: "none",
    borderRadius: 10,
    padding: "0.4rem 1rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#8B1538",
    cursor: "pointer",
    fontFamily: "inherit",
    marginBottom: "0.5rem",
  },
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    background: "linear-gradient(135deg, #fdf2f8, #fce7f3, #f3e8ff)",
    padding: "1.5rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: "2.5rem 2rem",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(139,21,56,0.12)",
    border: "2px solid #f3e5f5",
  },
  character: {
    width: 200,
    height: 200,
    objectFit: "contain",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#8B1538",
    margin: "0 0 0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#6b7280",
    margin: "0 0 1.5rem",
    lineHeight: 1.7,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.9rem 1.2rem",
    borderRadius: 14,
    border: "2px solid #e5e7eb",
    fontSize: "1.1rem",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  submitBtn: {
    background: "linear-gradient(135deg, #8B1538, #c62853)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "0.9rem 2rem",
    fontSize: "1.15rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(139,21,56,0.25)",
  },
};
