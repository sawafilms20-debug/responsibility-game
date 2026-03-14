import React, { createContext, useContext, useState, useCallback } from "react";

const AchievementsContext = createContext(null);

const BADGE_DEFS = {
  firstTry: { emoji: "🎯", title: "من أول محاولة!", desc: "أجبت بشكل صحيح من المحاولة الأولى" },
  perfectScore: { emoji: "💯", title: "درجة كاملة!", desc: "أكملت النشاط بدون أخطاء" },
  speedReader: { emoji: "⚡", title: "سريع البديهة!", desc: "أجبت خلال ٣ ثوانٍ" },
  streakMaster: { emoji: "🔥", title: "سلسلة ذهبية!", desc: "حققت سلسلة من ٥ إجابات صحيحة" },
  explorer: { emoji: "🧭", title: "مستكشف!", desc: "أكملت ٣ أنشطة مختلفة" },
  scholar: { emoji: "🎓", title: "عالم المسؤولية!", desc: "أكملت جميع الأنشطة" },
  collector: { emoji: "⭐", title: "جامع النجوم!", desc: "جمعت ٥٠٠ نقطة" },
  superCollector: { emoji: "🌟", title: "نجم ساطع!", desc: "جمعت ١٠٠٠ نقطة" },
  comeback: { emoji: "💪", title: "عودة قوية!", desc: "أجبت صحيحاً بعد خطأين متتاليين" },
  perfectStreak: { emoji: "👑", title: "الملك!", desc: "حققت سلسلة من ١٠ إجابات صحيحة" },
};

export function AchievementsProvider({ children }) {
  const [earned, setEarned] = useState([]);
  const [popup, setPopup] = useState(null);
  const [completedActivities, setCompletedActivities] = useState(new Set());
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);

  const unlock = useCallback(
    (badgeId) => {
      if (earned.includes(badgeId)) return false;
      setEarned((prev) => [...prev, badgeId]);
      const badge = BADGE_DEFS[badgeId];
      if (badge) {
        setPopup({ ...badge, id: badgeId });
        setTimeout(() => setPopup(null), 3000);
      }
      return true;
    },
    [earned]
  );

  const checkPointsBadges = useCallback(
    (totalPoints) => {
      if (totalPoints >= 1000) unlock("superCollector");
      else if (totalPoints >= 500) unlock("collector");
    },
    [unlock]
  );

  const checkStreakBadges = useCallback(
    (streak) => {
      if (streak >= 10) unlock("perfectStreak");
      else if (streak >= 5) unlock("streakMaster");
    },
    [unlock]
  );

  const trackCorrect = useCallback(() => {
    if (consecutiveWrong >= 2) unlock("comeback");
    setConsecutiveWrong(0);
  }, [consecutiveWrong, unlock]);

  const trackWrong = useCallback(() => {
    setConsecutiveWrong((c) => c + 1);
  }, []);

  const trackActivityComplete = useCallback(
    (activityType, score, totalActivities) => {
      if (score === 1) unlock("perfectScore");
      const updated = new Set(completedActivities);
      updated.add(activityType);
      setCompletedActivities(updated);
      if (updated.size >= 3) unlock("explorer");
      if (updated.size >= totalActivities) unlock("scholar");
    },
    [completedActivities, unlock]
  );

  const trackFastAnswer = useCallback(() => {
    unlock("speedReader");
  }, [unlock]);

  const trackFirstTry = useCallback(() => {
    unlock("firstTry");
  }, [unlock]);

  return (
    <AchievementsContext.Provider
      value={{
        earned,
        popup,
        badges: BADGE_DEFS,
        unlock,
        checkPointsBadges,
        checkStreakBadges,
        trackCorrect,
        trackWrong,
        trackActivityComplete,
        trackFastAnswer,
        trackFirstTry,
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements must be inside AchievementsProvider");
  return ctx;
}
