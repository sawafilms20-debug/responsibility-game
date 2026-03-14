import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingPoints({ items = [] }) {
  return (
    <div style={styles.container}>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.id}
            style={{
              ...styles.float,
              color: item.multiplier >= 3 ? "#ef4444" : item.multiplier >= 2 ? "#f59e0b" : "#22c55e",
            }}
            initial={{ opacity: 1, y: 0, scale: 0.5 }}
            animate={{ opacity: 0, y: -60, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            +{item.amount}
            {item.multiplier > 1 && (
              <span style={styles.multi}>x{item.multiplier}</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    position: "absolute",
    top: 8,
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "none",
    zIndex: 50,
  },
  float: {
    fontSize: "1.4rem",
    fontWeight: 800,
    fontFamily: "'Cairo', sans-serif",
    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
    display: "flex",
    alignItems: "center",
    gap: 4,
    whiteSpace: "nowrap",
  },
  multi: {
    fontSize: "0.85rem",
    fontWeight: 700,
    opacity: 0.8,
  },
};
