import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClick, playSwipe, playStar } from "../utils/sounds";
import GameHUD from "./GameHUD";

function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);
  return isMobile;
}
// Background per activity ID
const ACTIVITY_BACKGROUNDS = {
  1: "/images/backgrounds/bg_classroom.jpg",
  2: "/images/backgrounds/bg_home.jpg",
  3: "/images/backgrounds/bg_nature.jpg",
  4: "/images/backgrounds/bg_classroom.jpg",
  5: "/images/backgrounds/bg_mosque.jpg",
  6: "/images/backgrounds/bg_hallway.png",
  7: "/images/backgrounds/bg_home2.jpg",
  8: "/images/backgrounds/bg_nature.jpg",
  9: "/images/backgrounds/bg_qatar.jpg",
  10: "/images/backgrounds/bg_qatar.jpg",
};

import MCQActivity from "./activities/MCQActivity";
import ClassifyActivity from "./activities/ClassifyActivity";
import MatchingActivity from "./activities/MatchingActivity";
import TrueFalseActivity from "./activities/TrueFalseActivity";
import FillBlankActivity from "./activities/FillBlankActivity";
import OrderingActivity from "./activities/OrderingActivity";
import ScenariosActivity from "./activities/ScenariosActivity";
import MultiSelectActivity from "./activities/MultiSelectActivity";

const ACTIVITY_COMPONENTS = {
  mcq: MCQActivity,
  classify: ClassifyActivity,
  matching: MatchingActivity,
  truefalse: TrueFalseActivity,
  fillblank: FillBlankActivity,
  ordering: OrderingActivity,
  scenarios: ScenariosActivity,
  multiselect: MultiSelectActivity,
};

const ACTIVITY_ICONS = {
  mcq: "❓",
  classify: "📂",
  matching: "🔗",
  truefalse: "✅",
  fillblank: "✏️",
  ordering: "🔢",
  scenarios: "🎭",
  multiselect: "☑️",
};

/* ───────── slide transition variants ───────── */
const pageVariants = {
  enterFromRight: { x: "-100%", opacity: 0 },
  enterFromLeft: { x: "100%", opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitToLeft: { x: "100%", opacity: 0 },
  exitToRight: { x: "-100%", opacity: 0 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4,
};

/* ═══════════════════════════════════════════════
   ActivityWrapper
   ═══════════════════════════════════════════════ */
export default function ActivityWrapper({
  activity,
  currentIndex,
  totalActivities = 10,
  scores = {},
  stars = {},
  onComplete,
  onNext,
  onPrev,
  onGoTo,
  onBack,
}) {
  const isMobile = useIsMobile();
  const [direction, setDirection] = useState(1); // 1 = forward (RTL: slide from left), -1 = back
  const [characterState, setCharacterState] = useState("default");
  const [characterEmotion, setCharacterEmotion] = useState("thinking"); // thinking, happy, sad, excited, proud, worried

  /* ── character emotions with different expressions ── */
  const EMOTION_EMOJIS = {
    thinking: "🤔",
    happy: "😊",
    sad: "😟",
    excited: "🤩",
    proud: "😄",
    worried: "😰",
    cheering: "🥳",
  };

  const CHARACTER_IMAGES = {
    default: "/images/characters/maryam_thinking.png",
    correct: "/images/characters/maryam_thumbsup.png",
    wrong: "/images/characters/maryam_encouraging.png",
  };

  const EMOTION_MESSAGES = {
    thinking: activity?.characterMsg ?? "هيّا نبدأ، أنا متحمسة لنتعلم معا",
    happy: "أحسنت، إجابة رائعة",
    sad: "لا بأس، حاولي مرة أخرى",
    excited: "أنت رائعة، استمري هكذا",
    proud: "أحسنت",
    worried: "هذا السؤال يحتاج تركيزا أكثر، فكّري جيدا",
    cheering: "سلسلة إجابات صحيحة، استمري",
  };

  const CHARACTER_MESSAGES = {
    default: EMOTION_MESSAGES[characterEmotion] || EMOTION_MESSAGES.thinking,
    correct: EMOTION_MESSAGES[characterEmotion] || EMOTION_MESSAGES.happy,
    wrong: EMOTION_MESSAGES[characterEmotion] || EMOTION_MESSAGES.sad,
  };

  /* ── helpers ── */
  const handleNext = useCallback(() => {
    playSwipe();
    setDirection(1);
    setCharacterState("default");
    onNext?.();
  }, [onNext]);

  const handlePrev = useCallback(() => {
    playSwipe();
    setDirection(-1);
    setCharacterState("default");
    onPrev?.();
  }, [onPrev]);

  const handleGoTo = useCallback(
    (idx) => {
      playClick();
      setDirection(idx > currentIndex ? 1 : -1);
      setCharacterState("default");
      onGoTo?.(idx);
    },
    [currentIndex, onGoTo]
  );

  const handleComplete = useCallback(
    (score) => {
      if (score >= 0.9) {
        setCharacterState("correct");
        setCharacterEmotion("proud");
      } else if (score >= 0.7) {
        setCharacterState("correct");
        setCharacterEmotion("happy");
      } else if (score >= 0.5) {
        setCharacterState("wrong");
        setCharacterEmotion("worried");
      } else {
        setCharacterState("wrong");
        setCharacterEmotion("sad");
      }
      if (score >= 0.7) setTimeout(() => playStar(), 400);
      onComplete?.(activity.id, score);
    },
    [activity, onComplete]
  );

  /* ── resolve the activity component ── */
  const ActivityComponent = ACTIVITY_COMPONENTS[activity?.type] ?? null;
  const activityIcon = activity?.icon || ACTIVITY_ICONS[activity?.type] || "📝";
  const isIconSvg = typeof activityIcon === "string" && activityIcon.startsWith("/");
  const characterMsg = CHARACTER_MESSAGES[characterState];

  /* ── progress segments ── */
  const progressSegments = Array.from({ length: totalActivities }, (_, i) => {
    if (scores[i] === 1) return "completed";
    if (scores[i] === 0) return "wrong";
    if (i === currentIndex) return "current";
    return "pending";
  });

  const segmentColor = {
    completed: "#22c55e",
    wrong: "#ef4444",
    current: "#8B1538",
    pending: "#e5e7eb",
  };

  return (
    <div style={{
      ...styles.pageBg,
      backgroundImage: `linear-gradient(rgba(253,242,244,0.55), rgba(255,255,255,0.6)), url(${ACTIVITY_BACKGROUNDS[activity?.id] || "/images/backgrounds/bg_hallway.png"})`,
    }} dir="rtl">
    <div style={styles.outerWrapper}>
      {/* ──────────── TOP BAR ──────────── */}
      <div style={{ ...styles.topBar, padding: isMobile ? "0.5rem 0.6rem" : "0.75rem 1rem", flexWrap: "wrap", gap: isMobile ? 6 : 0 }}>
        <div style={styles.topBarRight}>
          <motion.span
            style={{ ...styles.badge, fontSize: isMobile ? "0.75rem" : "0.85rem", padding: isMobile ? "0.25rem 0.6rem" : "0.35rem 0.9rem" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isIconSvg ? (
              <img src={activityIcon} alt="" style={{ width: isMobile ? 16 : 22, height: isMobile ? 16 : 22 }} />
            ) : (
              <span style={styles.badgeIcon}>{activityIcon}</span>
            )}
            نشاط {currentIndex + 1}
          </motion.span>
          <h2 style={{ ...styles.activityTitle, fontSize: isMobile ? "0.85rem" : "1.05rem" }}>{activity?.title ?? ""}</h2>
        </div>

        <div style={styles.topBarLeft}>
          <span style={{ ...styles.counter, fontSize: isMobile ? "0.75rem" : "0.85rem" }}>
            {currentIndex + 1} / {totalActivities}
          </span>
          {onBack && (
            <button onClick={onBack} style={styles.backBtnSmall}>
              الرجوع
            </button>
          )}
        </div>
      </div>

      {/* ──────────── GAME HUD ──────────── */}
      <GameHUD />

      {/* ──────────── PROGRESS BAR ──────────── */}
      <div style={styles.progressTrack}>
        {progressSegments.map((status, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.progressSegment,
              backgroundColor: segmentColor[status],
            }}
            initial={false}
            animate={{
              backgroundColor: segmentColor[status],
              scale: i === currentIndex ? 1.08 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        ))}
      </div>

      {/* ──────────── CHARACTER + SPEECH BUBBLE (RIGHT SIDE) ──────────── */}
      <div style={{
        position: "relative",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-start",
        minHeight: isMobile ? 70 : 100,
        marginBottom: 0,
      }}>
        {/* Small speech bubble on the right next to character */}
        <motion.div
          key={characterEmotion + "-msg"}
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            padding: isMobile ? "0.5rem 0.7rem" : "0.6rem 1rem",
            fontSize: isMobile ? "0.78rem" : "0.9rem",
            fontWeight: 600,
            color: "#4a1942",
            boxShadow: "0 2px 10px rgba(139,21,56,0.08)",
            lineHeight: 1.6,
            maxWidth: isMobile ? "55%" : "50%",
            marginRight: isMobile ? 90 : 170,
            marginBottom: isMobile ? 8 : 12,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {characterMsg}
        </motion.div>
        {/* Character on the RIGHT side, goes behind the white content area */}
        <motion.img
          key={characterState}
          src={CHARACTER_IMAGES[characterState]}
          alt="الشخصية"
          style={{
            width: isMobile ? 120 : 210,
            height: isMobile ? 120 : 210,
            objectFit: "contain",
            flexShrink: 0,
            position: "absolute",
            right: isMobile ? 0 : 8,
            bottom: isMobile ? -45 : -65,
            zIndex: 0,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
          transition={{ y: { repeat: Infinity, duration: 2, ease: "easeInOut" }, scale: { duration: 0.3 }, opacity: { duration: 0.3 } }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* ──────────── MAIN CONTENT AREA ──────────── */}
      <div style={{ ...styles.contentArea, position: "relative", zIndex: 1 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activity?.id ?? currentIndex}
            initial={direction === 1 ? "enterFromRight" : "enterFromLeft"}
            animate="center"
            exit={direction === 1 ? "exitToLeft" : "exitToRight"}
            variants={pageVariants}
            transition={pageTransition}
            style={styles.motionPage}
          >
            {ActivityComponent ? (
              <ActivityComponent data={activity} onComplete={handleComplete} activityIcon={isIconSvg ? activityIcon : null} />
            ) : (
              <div style={styles.placeholder}>
                <p>نوع النشاط &quot;{activity?.type}&quot; غير متاح حالياً</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ──────────── BOTTOM NAVIGATION ──────────── */}
      <div style={{ ...styles.bottomNav, flexWrap: isMobile ? "wrap" : "nowrap", gap: isMobile ? 8 : 0, justifyContent: isMobile ? "center" : "space-between" }}>
        {/* Prev button */}
        <motion.button
          style={{
            ...styles.navBtn,
            opacity: currentIndex === 0 ? 0.4 : 1,
            fontSize: isMobile ? "0.75rem" : "0.9rem",
            padding: isMobile ? "0.4rem 0.8rem" : "0.55rem 1.4rem",
            order: isMobile ? 2 : 0,
          }}
          whileHover={currentIndex > 0 ? { scale: 1.05 } : {}}
          whileTap={currentIndex > 0 ? { scale: 0.95 } : {}}
          disabled={currentIndex === 0}
          onClick={handlePrev}
        >
          السابق ←
        </motion.button>

        {/* Page dots */}
        <div style={{ ...styles.dotsRow, order: isMobile ? 0 : 1, width: isMobile ? "100%" : "auto", justifyContent: "center", flexWrap: "wrap" }}>
          {Array.from({ length: totalActivities }, (_, i) => {
            const isCompleted = scores[i] === 1;
            const isFailed = scores[i] === 0;
            const isCurrent = i === currentIndex;

            let bg = "#e5e7eb";
            if (isCompleted) bg = "#22c55e";
            else if (isFailed) bg = "#ef4444";
            else if (isCurrent) bg = "#8B1538";

            return (
              <motion.button
                key={i}
                style={{
                  ...styles.dot,
                  width: isMobile ? 26 : 32,
                  height: isMobile ? 26 : 32,
                  fontSize: isMobile ? "0.65rem" : "0.78rem",
                  backgroundColor: bg,
                  color: isCurrent || isCompleted || isFailed ? "#fff" : "#6b7280",
                  border: isCurrent ? "2px solid #5a0d24" : "2px solid transparent",
                  fontWeight: isCurrent ? 700 : 500,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleGoTo(i)}
              >
                {i + 1}
              </motion.button>
            );
          })}
        </div>

        {/* Next button */}
        <motion.button
          style={{
            ...styles.navBtn,
            opacity: currentIndex === totalActivities - 1 ? 0.4 : 1,
            fontSize: isMobile ? "0.75rem" : "0.9rem",
            padding: isMobile ? "0.4rem 0.8rem" : "0.55rem 1.4rem",
            order: isMobile ? 1 : 2,
          }}
          whileHover={currentIndex < totalActivities - 1 ? { scale: 1.05 } : {}}
          whileTap={currentIndex < totalActivities - 1 ? { scale: 0.95 } : {}}
          disabled={currentIndex === totalActivities - 1}
          onClick={handleNext}
        >
          → التالي
        </motion.button>
      </div>
    </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════════ */
const styles = {
  pageBg: {
    minHeight: "100vh",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
  },
  outerWrapper: {
    direction: "rtl",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
    maxWidth: 900,
    margin: "0 auto",
    padding: "0.5rem 0.5rem 0.5rem 0.5rem",
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  /* ── top bar ── */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 1rem",
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(139,21,56,0.08)",
  },
  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(135deg, #8B1538, #a91d45)",
    color: "#fff",
    padding: "0.35rem 0.9rem",
    borderRadius: 20,
    fontSize: "0.85rem",
    fontWeight: 700,
    cursor: "default",
  },
  badgeIcon: {
    fontSize: "1rem",
  },
  activityTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "#1f2937",
  },
  videoBtn: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: 10,
    padding: "0.4rem 0.9rem",
    fontSize: "0.8rem",
    color: "#9ca3af",
    cursor: "not-allowed",
    fontFamily: "inherit",
  },
  counter: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8B1538",
    backgroundColor: "#fce4ec",
    padding: "0.3rem 0.7rem",
    borderRadius: 10,
  },
  backBtnSmall: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: 10,
    padding: "0.4rem 0.8rem",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "#8B1538",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  /* ── progress ── */
  progressTrack: {
    display: "flex",
    gap: 4,
    padding: "0 0.25rem",
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },

  /* ── character ── */
  characterRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: 0,
    margin: 0,
  },
  avatar: {
    width: 200,
    height: "auto",
    objectFit: "contain",
    flexShrink: 0,
  },
  speechBubble: {
    position: "relative",
    backgroundColor: "#fff",
    border: "1px solid #f3e5f5",
    borderRadius: 14,
    padding: "0.6rem 1rem",
    fontSize: "0.88rem",
    color: "#4a1942",
    fontWeight: 500,
    boxShadow: "0 1px 6px rgba(139,21,56,0.06)",
    lineHeight: 1.6,
  },
  bubbleArrow: {
    position: "absolute",
    right: -8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 0,
    height: 0,
    borderTop: "6px solid transparent",
    borderBottom: "6px solid transparent",
    borderLeft: "8px solid #fff",
  },
  emotionBubble: {
    position: "absolute",
    top: -4,
    right: -4,
    fontSize: "1.4rem",
    backgroundColor: "#fff",
    borderRadius: "50%",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    border: "2px solid #f0e6ea",
    zIndex: 5,
  },

  /* ── content ── */
  contentArea: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    backgroundColor: "#fff",
    boxShadow: "0 2px 16px rgba(139,21,56,0.06)",
  },
  motionPage: {
    width: "100%",
    padding: "0.75rem",
    boxSizing: "border-box",
  },
  placeholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
    color: "#9ca3af",
    fontSize: "1rem",
  },

  /* ── bottom nav ── */
  bottomNav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0.5rem",
  },
  navBtn: {
    background: "linear-gradient(135deg, #8B1538, #a91d45)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "0.55rem 1.4rem",
    fontSize: "0.9rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: 0.3,
  },
  dotsRow: {
    display: "flex",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "none",
    fontSize: "0.78rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "inherit",
    transition: "background-color 0.2s",
  },
};
