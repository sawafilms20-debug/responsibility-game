import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../../contexts/GameContext";
import { playCorrect, playWrong, playSend, playSelect } from "../../utils/sounds";
import ConfettiExplosion from "../../components/ConfettiExplosion";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MCQActivity({ data, onComplete, activityIcon }) {
  const game = useGame();
  const questions = data.questions || [{ question: data.question, options: data.options }];
  const [currentQ, setCurrentQ] = useState(0);
  const [phase, setPhase] = useState("typing"); // typing → question → sent → result → (next typing → ...)
  const [selected, setSelected] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const chatRef = useRef(null);

  // Show first question after typing
  useEffect(() => {
    const t = setTimeout(() => setPhase("question"), 1500);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, phase]);

  const handlePick = (option) => {
    if (phase !== "question") return;
    setSelected(option);
    setPhase("sent");
    playSelect();

    const isCorrect = option.correct;
    const correctOption = questions[currentQ].options.find(o => o.correct);

    setTimeout(() => {
      playSend();
      setTimeout(() => {
        if (isCorrect) {
          playCorrect();
          game.addPoints(100);
          game.incrementStreak();
          setConfettiTrigger(t => t + 1);
          setCorrectCount(c => c + 1);
        } else {
          playWrong();
          game.resetStreak();
        }

        // Add to chat history
        setChatHistory(prev => [
          ...prev,
          { type: "question", text: questions[currentQ].question },
          { type: "answer", text: option.text },
          { type: "reaction", correct: isCorrect, correctText: correctOption.text },
        ]);

        // Move to next question or finish
        const nextQ = currentQ + 1;
        if (nextQ < questions.length) {
          setCurrentQ(nextQ);
          setSelected(null);
          setPhase("typing");
          setTimeout(() => setPhase("question"), 1500);
        } else {
          setPhase("done");
          const finalCorrect = isCorrect ? correctCount + 1 : correctCount;
          const score = finalCorrect / questions.length;
          setTimeout(() => onComplete?.(score >= 0.5 ? 1 : 0), 2000);
        }
      }, 1000);
    }, 500);
  };

  const currentQuestion = questions[currentQ];
  const shuffledOptions = useMemo(() => shuffleArray(currentQuestion.options), [currentQ]);

  return (
    <div style={styles.phoneFrame} dir="rtl">
      <ConfettiExplosion trigger={confettiTrigger} />

      <div style={styles.chatBody} ref={chatRef}>
        {/* Activity icon */}
        {activityIcon && (
          <div style={{ display: "flex", justifyContent: "center", margin: "0.25rem 0" }}>
            <img src={activityIcon} alt="" style={{ width: 90, height: 90, objectFit: "contain" }} />
          </div>
        )}

        {/* Date badge */}
        <div style={styles.dateBadge}>
          <span style={styles.dateText}>اليوم</span>
        </div>

        {/* Previous Q&A history */}
        {chatHistory.map((msg, i) => {
          if (msg.type === "question") {
            return (
              <div key={i} style={styles.incomingRow}>
                <div style={styles.incomingBubble}>
                  <p style={styles.bubbleText}>{msg.text}</p>
                </div>
              </div>
            );
          }
          if (msg.type === "answer") {
            return (
              <div key={i} style={styles.outgoingRow}>
                <div style={styles.outgoingBubble}>
                  <p style={styles.bubbleText}>{msg.text}</p>
                  <span style={styles.timeStamp}>✓✓</span>
                </div>
              </div>
            );
          }
          if (msg.type === "reaction") {
            return (
              <div key={i} style={styles.incomingRow}>
                <div style={styles.incomingBubble}>
                  {msg.correct ? (
                    <p style={styles.bubbleText}>صحيح تماما، أحسنت</p>
                  ) : (
                    <>
                      <p style={styles.bubbleText}>ليست الإجابة الصحيحة، الصواب هو:</p>
                      <p style={{ ...styles.bubbleText, ...styles.correctHighlight }}>{msg.correctText}</p>
                    </>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {phase === "typing" && (
            <motion.div
              style={styles.incomingRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={styles.incomingBubble}>
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current question */}
        <AnimatePresence>
          {(phase === "question" || phase === "sent") && (
            <motion.div
              style={styles.incomingRow}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div style={styles.incomingBubble}>
                <p style={styles.bubbleText}>{currentQuestion.question}</p>
                <span style={styles.timeStamp}>
                  {currentQ + 1} / {questions.length}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reply options */}
        <AnimatePresence>
          {phase === "question" && (
            <motion.div
              style={styles.repliesSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p style={styles.replyPrompt}>اختاري ردّك</p>
              {shuffledOptions.map((opt, i) => (
                <motion.button
                  key={opt.id}
                  style={styles.replyOption}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.15 }}
                  whileHover={{ scale: 1.02, backgroundColor: "#dcf8c6" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePick(opt)}
                >
                  <span style={styles.replyText}>{opt.text}</span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sent answer for current question */}
        <AnimatePresence>
          {selected && phase === "sent" && (
            <motion.div
              style={styles.outgoingRow}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div style={styles.outgoingBubble}>
                <p style={styles.bubbleText}>{selected.text}</p>
                <span style={styles.timeStamp}>✓</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div style={styles.typingDots}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={styles.dot}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

const styles = {
  phoneFrame: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
    backgroundColor: "#e5ddd5",
    display: "flex",
    flexDirection: "column",
    minHeight: 520,
    border: "3px solid #ccc",
  },
  chatBody: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    maxHeight: 600,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c5b89a' fill-opacity='0.08'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
  },
  dateBadge: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 8,
  },
  dateText: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: "4px 16px",
    borderRadius: 8,
    fontSize: "0.75rem",
    color: "#666",
    fontFamily: "'Cairo', sans-serif",
  },
  incomingRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  incomingBubble: {
    backgroundColor: "#fff",
    borderRadius: "12px 0 12px 12px",
    padding: "10px 14px",
    maxWidth: "85%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  outgoingRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  outgoingBubble: {
    backgroundColor: "#dcf8c6",
    borderRadius: "0 12px 12px 12px",
    padding: "10px 14px",
    maxWidth: "85%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  bubbleText: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "#303030",
    fontFamily: "'Cairo', sans-serif",
  },
  timeStamp: {
    fontSize: "0.65rem",
    color: "#999",
    display: "block",
    textAlign: "left",
    marginTop: 4,
    fontFamily: "'Cairo', sans-serif",
  },
  correctHighlight: {
    fontWeight: 700,
    color: "#075e54",
    backgroundColor: "#e8f5e9",
    padding: "6px 10px",
    borderRadius: 8,
    marginTop: 6,
  },
  repliesSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "8px 0",
  },
  replyPrompt: {
    fontSize: "0.8rem",
    color: "#8B1538",
    fontWeight: 700,
    textAlign: "center",
    margin: "4px 0",
    fontFamily: "'Cairo', sans-serif",
  },
  replyOption: {
    background: "#fff",
    border: "2px solid #d4edda",
    borderRadius: 12,
    padding: "10px 14px",
    cursor: "pointer",
    textAlign: "right",
    fontFamily: "'Cairo', sans-serif",
  },
  replyText: {
    fontSize: "0.9rem",
    color: "#303030",
    lineHeight: 1.5,
  },
  typingDots: {
    display: "flex",
    gap: 4,
    padding: "4px 0",
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#999",
    display: "inline-block",
  },
};
