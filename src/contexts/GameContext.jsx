import React, { createContext, useContext, useState, useCallback } from "react";

const GameContext = createContext(null);

let floatingId = 0;

export function GameProvider({ children }) {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [difficulty, setDifficulty] = useState(1); // 1=easy, 2=medium, 3=hard
  const [correctInRow, setCorrectInRow] = useState(0);
  const [wrongInRow, setWrongInRow] = useState(0);

  const multiplier = streak >= 6 ? 3 : streak >= 3 ? 2 : 1;

  const addPoints = useCallback(
    (base) => {
      const earned = base * multiplier;
      setPoints((p) => p + earned);
      const id = ++floatingId;
      setFloatingPoints((prev) => [
        ...prev,
        { id, amount: earned, multiplier, ts: Date.now() },
      ]);
      setTimeout(() => {
        setFloatingPoints((prev) => prev.filter((f) => f.id !== id));
      }, 1200);
      return earned;
    },
    [multiplier]
  );

  const incrementStreak = useCallback(() => {
    setStreak((s) => s + 1);
    setCorrectInRow((c) => {
      const next = c + 1;
      if (next >= 5 && difficulty < 3) setDifficulty((d) => Math.min(3, d + 1));
      return next;
    });
    setWrongInRow(0);
  }, [difficulty]);

  const resetStreak = useCallback(() => {
    setStreak(0);
    setWrongInRow((w) => {
      const next = w + 1;
      if (next >= 3 && difficulty > 1) setDifficulty((d) => Math.max(1, d - 1));
      return next;
    });
    setCorrectInRow(0);
  }, [difficulty]);

  const resetGame = useCallback(() => {
    setPoints(0);
    setStreak(0);
    setFloatingPoints([]);
    setDifficulty(1);
    setCorrectInRow(0);
    setWrongInRow(0);
  }, []);

  return (
    <GameContext.Provider
      value={{
        points,
        streak,
        multiplier,
        difficulty,
        floatingPoints,
        addPoints,
        incrementStreak,
        resetStreak,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be inside GameProvider");
  return ctx;
}
