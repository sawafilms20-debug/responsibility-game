import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playCorrect, playWrong, playClick, playSwipe } from '../../utils/sounds';
import { useGame } from '../../contexts/GameContext';
import ConfettiExplosion from "../../components/ConfettiExplosion";

/**
 * Step-by-step interactive story simulation.
 * The student lives through the situation
 * and picks the right action at each stage from 3 options.
 *
 * Data: { scenario, steps: [{ id, text, emoji, order }] }
 * The steps define the correct sequence. We generate wrong options per stage.
 */

const WRONG_OPTIONS = [
  [
    "أتجاهل الأمر فهو لا يخصني",
    "أصور الموقف وأنشره على التواصل",
  ],
  [
    "أخبرها أن تتجاهل الموضوع",
    "أبتعد عنها حتى لا أتعرض للتنمر أيضاً",
  ],
  [
    "أحاول حل المشكلة بنفسي دون إخبار أحد",
    "أواجه المتنمرة بالصراخ والعنف",
  ],
  [
    "أنسى الأمر بعد الإبلاغ",
    "أنشر القصة في مجموعة الصف",
  ],
  [
    "أتجنب الحديث عن التنمر حتى لا أُحرج أحداً",
    "أسخر من الموقف مع زميلاتي",
  ],
];

export default function OrderingActivity({ data, onComplete, activityIcon }) {
  const game = useGame();
  const { scenario, steps } = data;
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const totalSteps = sorted.length;

  const [currentStep, setCurrentStep] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [typewriterText, setTypewriterText] = useState("");
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const typewriterRef = useRef(null);

  // Generate shuffled options for current step
  const options = useCallback(() => {
    if (currentStep >= totalSteps) return [];
    const correct = sorted[currentStep];
    const wrongs = WRONG_OPTIONS[currentStep] || WRONG_OPTIONS[0];
    const all = [
      { id: "correct", text: correct.text, isCorrect: true },
      { id: "wrong1", text: wrongs[0], isCorrect: false },
      { id: "wrong2", text: wrongs[1], isCorrect: false },
    ];
    // Deterministic shuffle based on step
    const seed = currentStep;
    return all.sort((a, b) => {
      const ha = (a.id.charCodeAt(0) * 31 + seed) % 7;
      const hb = (b.id.charCodeAt(0) * 31 + seed) % 7;
      return ha - hb;
    });
  }, [currentStep, sorted, totalSteps]);

  // Typewriter effect for feedback
  const startTypewriter = useCallback((text) => {
    setTypewriterText("");
    let i = 0;
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    typewriterRef.current = setInterval(() => {
      i++;
      setTypewriterText(text.slice(0, i));
      if (i >= text.length) clearInterval(typewriterRef.current);
    }, 25);
  }, []);

  useEffect(() => {
    return () => {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, []);

  const handleSelect = (opt) => {
    if (answered) return;
    setSelectedId(opt.id);
    setAnswered(true);
    playClick();

    const correct = opt.isCorrect;
    setIsCorrect(correct);

    if (correct) {
      playCorrect();
      game.addPoints(50);
      game.incrementStreak();
      setCorrectCount((c) => c + 1);
      setConfettiTrigger(t => t + 1);
      startTypewriter(`✅ أحسنتِ! "${sorted[currentStep].text}" هو التصرف الصحيح في هذه المرحلة.`);
    } else {
      playWrong();
      game.resetStreak();
      startTypewriter(`❌ ليس تماماً. التصرف الصحيح هو: "${sorted[currentStep].text}"`);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      playSwipe();
      setCurrentStep((s) => s + 1);
      setAnswered(false);
      setSelectedId(null);
      setIsCorrect(null);
      setTypewriterText("");
    } else {
      setCompleted(true);
      setShowSummary(true);
      const score = correctCount / totalSteps;
      setTimeout(() => onComplete?.(score), 2500);
    }
  };

  const stepEmoji = sorted[currentStep]?.emoji || "📌";

  return (
    <div style={styles.container} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />
      {/* Scene header */}
      <div style={styles.sceneHeader}>
        {activityIcon ? (
          <img src={activityIcon} alt="" style={{ width: 140, height: 140, objectFit: "contain" }} />
        ) : (
          <span style={styles.sceneEmoji}>🎬</span>
        )}
        <span style={styles.sceneTitle}>اختاري التصرف الصحيح</span>
      </div>

      {/* Scenario banner */}
      <div style={styles.scenarioBanner}>
        <p style={styles.scenarioText}>{scenario}</p>
      </div>

      {/* Progress bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            animate={{ width: `${((currentStep + (answered ? 1 : 0)) / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span style={styles.progressLabel}>
          المرحلة {currentStep + 1} من {totalSteps}
        </span>
      </div>

      {/* Step dots */}
      <div style={styles.dotsRow}>
        {sorted.map((_, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.dot,
              backgroundColor:
                i < currentStep
                  ? "#22c55e"
                  : i === currentStep
                  ? "#8B1538"
                  : "#ddd",
            }}
            animate={i === currentStep ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.5, repeat: i === currentStep ? Infinity : 0, repeatDelay: 1 }}
          />
        ))}
      </div>

      {/* Current scene */}
      <AnimatePresence mode="wait">
        {!showSummary && (
          <motion.div
            key={currentStep}
            style={styles.sceneCard}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -80 }}
            transition={{ duration: 0.35 }}
          >
            {/* Stage illustration */}
            <div style={styles.stageVisual}>
              <motion.span
                style={styles.stageEmoji}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stepEmoji}
              </motion.span>
              <div style={styles.stageNumber}>
                <span style={styles.stageNum}>{currentStep + 1}</span>
              </div>
            </div>

            <p style={styles.stageQuestion}>
              ما التصرف المسؤول في هذه المرحلة؟
            </p>

            {/* Options */}
            <div style={styles.optionsColumn}>
              {options().map((opt, i) => {
                const isSelected = selectedId === opt.id;
                const showCorrectHighlight = answered && opt.isCorrect;
                const showWrongHighlight = answered && isSelected && !opt.isCorrect;

                return (
                  <motion.button
                    key={opt.id}
                    style={{
                      ...styles.optionBtn,
                      ...(showCorrectHighlight ? styles.correctOption : {}),
                      ...(showWrongHighlight ? styles.wrongOption : {}),
                      ...(answered && !isSelected && !opt.isCorrect
                        ? styles.fadedOption
                        : {}),
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      x: showWrongHighlight ? [0, -8, 8, -8, 0] : 0,
                    }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={!answered ? { scale: 1.02, backgroundColor: "#f3e8ff" } : {}}
                    whileTap={!answered ? { scale: 0.97 } : {}}
                    onClick={() => handleSelect(opt)}
                    disabled={answered}
                  >
                    <span style={styles.optionLetter}>
                      {String.fromCharCode(1571 + i)}
                    </span>
                    <span style={styles.optionText}>{opt.text}</span>
                    {showCorrectHighlight && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={styles.checkMark}
                      >
                        ✅
                      </motion.span>
                    )}
                    {showWrongHighlight && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={styles.checkMark}
                      >
                        ❌
                      </motion.span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback typewriter */}
            <AnimatePresence>
              {answered && typewriterText && (
                <motion.div
                  style={{
                    ...styles.feedbackBox,
                    borderColor: isCorrect ? "#22c55e" : "#ef4444",
                    backgroundColor: isCorrect
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p style={styles.feedbackText}>{typewriterText}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next button */}
            <AnimatePresence>
              {answered && (
                <motion.button
                  style={styles.nextBtn}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                >
                  {currentStep < totalSteps - 1 ? "المرحلة التالية ▶" : "عرض النتيجة ✨"}
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            style={styles.summaryCard}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <motion.span
              style={styles.summaryEmoji}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 1, repeat: 2 }}
            >
              {correctCount >= totalSteps - 1 ? "🌟" : correctCount >= 3 ? "👍" : "📝"}
            </motion.span>
            <h3 style={styles.summaryTitle}>
              {correctCount >= totalSteps - 1
                ? "ممتازة! اخترتِ التصرف الصحيح في كل مرحلة!"
                : correctCount >= 3
                ? "جيد! أصبتِ في معظم المراحل"
                : "لا بأس! تعلمتِ كيف تتصرفين بمسؤولية"}
            </h3>
            <p style={styles.summaryScore}>
              {correctCount} من {totalSteps} مراحل صحيحة
            </p>

            {/* Step recap */}
            <div style={styles.recapList}>
              <p style={styles.recapTitle}>الخطوات الصحيحة بالترتيب:</p>
              {sorted.map((step, i) => (
                <div key={step.id} style={styles.recapItem}>
                  <span style={styles.recapNum}>{i + 1}</span>
                  <span style={styles.recapEmoji}>{step.emoji}</span>
                  <span style={styles.recapText}>{step.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    maxWidth: 560,
    margin: "0 auto",
    fontFamily: "'Cairo', 'Tajawal', sans-serif",
  },
  sceneHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  sceneEmoji: { fontSize: "1.5rem" },
  sceneTitle: {
    fontSize: "1.3rem",
    fontWeight: 800,
    color: "#8B1538",
  },
  scenarioBanner: {
    background: "linear-gradient(135deg, #8B1538, #a91d45)",
    borderRadius: 16,
    padding: "14px 20px",
    marginBottom: 16,
  },
  scenarioText: {
    margin: 0,
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 600,
    textAlign: "center",
    lineHeight: 1.7,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#eee",
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
    background: "linear-gradient(90deg, #D4A853, #8B1538)",
  },
  progressLabel: {
    fontSize: "0.8rem",
    color: "#888",
    textAlign: "center",
    display: "block",
  },
  dotsRow: {
    display: "flex",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    transition: "background-color 0.3s",
  },
  sceneCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "24px 20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "2px solid #f0e0e5",
  },
  stageVisual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  stageEmoji: {
    fontSize: "3rem",
    display: "inline-block",
  },
  stageNumber: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#8B1538",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  stageNum: {
    color: "#fff",
    fontWeight: 800,
    fontSize: "1rem",
  },
  stageQuestion: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#4a4a4a",
    textAlign: "center",
    marginBottom: 16,
  },
  optionsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    backgroundColor: "#fafafa",
    border: "2px solid #e5e5e5",
    borderRadius: 14,
    cursor: "pointer",
    textAlign: "right",
    fontFamily: "'Cairo', sans-serif",
    transition: "all 0.2s",
  },
  correctOption: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  wrongOption: {
    backgroundColor: "#fef2f2",
    borderColor: "#ef4444",
  },
  fadedOption: {
    opacity: 0.4,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: "#8B1538",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  optionText: {
    flex: 1,
    fontSize: "0.95rem",
    color: "#333",
    lineHeight: 1.5,
  },
  checkMark: {
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  feedbackBox: {
    marginTop: 14,
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid",
  },
  feedbackText: {
    margin: 0,
    fontSize: "0.9rem",
    lineHeight: 1.7,
    color: "#333",
  },
  nextBtn: {
    display: "block",
    margin: "16px auto 0",
    padding: "12px 32px",
    background: "linear-gradient(135deg, #8B1538, #a91d45)",
    color: "#fff",
    border: "none",
    borderRadius: 30,
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: "28px 24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "2px solid #D4A853",
    textAlign: "center",
  },
  summaryEmoji: {
    fontSize: "3rem",
    display: "block",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: "1.2rem",
    fontWeight: 800,
    color: "#8B1538",
    margin: "0 0 8px",
  },
  summaryScore: {
    fontSize: "1rem",
    color: "#666",
    marginBottom: 20,
  },
  recapList: {
    textAlign: "right",
    backgroundColor: "#fef9f0",
    borderRadius: 12,
    padding: 16,
  },
  recapTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#8B1538",
    marginBottom: 10,
    margin: "0 0 10px",
  },
  recapItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 0",
    borderBottom: "1px solid #f0e0d0",
  },
  recapNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    backgroundColor: "#D4A853",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 800,
    flexShrink: 0,
  },
  recapEmoji: {
    fontSize: "1.2rem",
    flexShrink: 0,
  },
  recapText: {
    fontSize: "0.85rem",
    color: "#444",
    lineHeight: 1.5,
  },
};
