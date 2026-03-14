import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { playClick } from "../utils/sounds";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.4 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6, ease: "easeOut" } },
};

export default function VideoScreen({ onSkip, onBack }) {
  const isMobile = useIsMobile();

  return (
    <motion.div
      className="video-screen"
      dir="rtl"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        ...styles.wrapper,
        ...(isMobile ? { padding: 0, alignItems: "stretch" } : {}),
      }}
    >
      <motion.div variants={cardVariants} initial="initial" animate="animate" style={{
        ...styles.card,
        ...(isMobile ? { borderRadius: 0, border: "none", padding: "1rem", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" } : {}),
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h2 style={{ ...styles.heading, marginBottom: 0 }}>فيديو المسؤولية</h2>
          {onBack && (
            <button onClick={() => { playClick(); onBack(); }} style={styles.backBtn}>
              الرجوع →
            </button>
          )}
        </div>

        <div style={styles.videoContainer}>
          <iframe
            src="https://drive.google.com/file/d/1G7kwbM8p35rzKD-k3yOwfwKaudUBResJ/preview"
            style={styles.iframe}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen={true}
            webkitallowfullscreen="true"
            mozallowfullscreen="true"
            frameBorder="0"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { playClick(); onSkip?.(); }}
          style={styles.skipButton}
        >
          تخطي الفيديو
        </motion.button>
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
    backgroundImage: "linear-gradient(rgba(253,242,244,0.5), rgba(255,255,255,0.55)), url(/images/backgrounds/bg_classroom.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    background: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    padding: "1.5rem",
    maxWidth: 800,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 8px 40px rgba(139,21,56,0.12)",
    border: "2px solid #f3e5f5",
  },
  heading: {
    fontSize: "1.3rem",
    color: "#8B1538",
    marginTop: 0,
    marginBottom: "1rem",
    fontWeight: 700,
  },
  backBtn: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: 10,
    padding: "0.4rem 0.8rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#8B1538",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  videoContainer: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: "1.2rem",
    backgroundColor: "#000",
    position: "relative",
    paddingTop: "56.25%", // 16:9 aspect ratio
  },
  iframe: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: 14,
  },
  skipButton: {
    background: "#8B1538",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "0.75rem 2rem",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    boxShadow: "0 4px 16px rgba(139,21,56,0.3)",
  },
};
