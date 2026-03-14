import React, { useMemo } from "react";
import { motion } from "framer-motion";

const THEMES = {
  desert: {
    gradient: "linear-gradient(180deg, #f4a460 0%, #daa520 50%, #cd853f 100%)",
    layers: [
      { color: "#f5c542", shape: "circle", count: 10, sizeRange: [4, 8], opacity: 0.3 },
      { color: "#e8a317", shape: "circle", count: 8, sizeRange: [6, 14], opacity: 0.2 },
      { color: "#fff4c1", shape: "ray", count: 6, sizeRange: [2, 40], opacity: 0.15 },
    ],
  },
  ocean: {
    gradient: "linear-gradient(180deg, #0077b6 0%, #00b4d8 50%, #90e0ef 100%)",
    layers: [
      { color: "#caf0f8", shape: "circle", count: 12, sizeRange: [4, 10], opacity: 0.4 },
      { color: "#48cae4", shape: "circle", count: 8, sizeRange: [8, 18], opacity: 0.25 },
      { color: "#ade8f4", shape: "wave", count: 6, sizeRange: [30, 60], opacity: 0.15 },
    ],
  },
  forest: {
    gradient: "linear-gradient(180deg, #2d6a4f 0%, #40916c 50%, #74c69d 100%)",
    layers: [
      { color: "#b7e4c7", shape: "leaf", count: 10, sizeRange: [6, 12], opacity: 0.35 },
      { color: "#d8f3dc", shape: "circle", count: 8, sizeRange: [4, 10], opacity: 0.25 },
      { color: "#ffffcc", shape: "circle", count: 6, sizeRange: [3, 7], opacity: 0.4 },
    ],
  },
  night: {
    gradient: "linear-gradient(180deg, #0d0221 0%, #1a0a3e 50%, #2d1b69 100%)",
    layers: [
      { color: "#ffffff", shape: "star", count: 12, sizeRange: [2, 5], opacity: 0.6 },
      { color: "#e0aaff", shape: "circle", count: 8, sizeRange: [3, 8], opacity: 0.2 },
      { color: "#c8b6ff", shape: "circle", count: 4, sizeRange: [20, 40], opacity: 0.08 },
    ],
  },
  sunrise: {
    gradient: "linear-gradient(180deg, #ff6b6b 0%, #ffa07a 40%, #ffd993 100%)",
    layers: [
      { color: "#ffffff", shape: "cloud", count: 6, sizeRange: [30, 60], opacity: 0.25 },
      { color: "#ffe0e0", shape: "cloud", count: 5, sizeRange: [20, 40], opacity: 0.2 },
      { color: "#fff5e1", shape: "circle", count: 8, sizeRange: [4, 10], opacity: 0.3 },
    ],
  },
  space: {
    gradient: "linear-gradient(180deg, #0b0c10 0%, #1a1a2e 50%, #16213e 100%)",
    layers: [
      { color: "#ffffff", shape: "star", count: 12, sizeRange: [1, 4], opacity: 0.7 },
      { color: "#a855f7", shape: "circle", count: 6, sizeRange: [10, 30], opacity: 0.06 },
      { color: "#6366f1", shape: "circle", count: 5, sizeRange: [15, 40], opacity: 0.05 },
    ],
  },
  garden: {
    gradient: "linear-gradient(180deg, #a7c957 0%, #dde5b6 50%, #f2e8cf 100%)",
    layers: [
      { color: "#f4a0c0", shape: "petal", count: 10, sizeRange: [6, 14], opacity: 0.35 },
      { color: "#f9d5e5", shape: "circle", count: 8, sizeRange: [4, 8], opacity: 0.25 },
      { color: "#a7c957", shape: "leaf", count: 6, sizeRange: [8, 16], opacity: 0.2 },
    ],
  },
  city: {
    gradient: "linear-gradient(180deg, #2c3e50 0%, #34495e 50%, #5d6d7e 100%)",
    layers: [
      { color: "#f1c40f", shape: "square", count: 10, sizeRange: [2, 5], opacity: 0.4 },
      { color: "#85929e", shape: "building", count: 6, sizeRange: [12, 30], opacity: 0.15 },
      { color: "#aed6f1", shape: "circle", count: 8, sizeRange: [3, 7], opacity: 0.3 },
    ],
  },
};

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getShapeStyle(shape, size, color) {
  const base = {
    backgroundColor: color,
    width: size,
    height: size,
    borderRadius: "50%",
  };

  switch (shape) {
    case "circle":
      return base;

    case "square":
      return { ...base, borderRadius: "2px" };

    case "star":
      return {
        ...base,
        borderRadius: "50%",
        boxShadow: `0 0 ${size}px ${size * 0.5}px ${color}`,
      };

    case "leaf":
      return {
        ...base,
        borderRadius: "50% 0 50% 0",
        transform: "rotate(45deg)",
      };

    case "petal":
      return {
        ...base,
        borderRadius: "50% 50% 0 50%",
        height: size * 1.4,
      };

    case "ray":
      return {
        backgroundColor: color,
        width: size * 0.3,
        height: size,
        borderRadius: "50%",
      };

    case "wave":
      return {
        backgroundColor: color,
        width: size,
        height: size * 0.25,
        borderRadius: "50%",
      };

    case "cloud":
      return {
        backgroundColor: color,
        width: size,
        height: size * 0.5,
        borderRadius: `${size}px`,
      };

    case "building":
      return {
        backgroundColor: color,
        width: size * 0.4,
        height: size,
        borderRadius: "2px 2px 0 0",
      };

    default:
      return base;
  }
}

function FloatingElement({ shape, color, size, x, y, opacity, layerIndex, index }) {
  const durationBase = 3 + ((layerIndex * 7 + index * 3) % 5);
  const delayBase = (index * 0.7) % durationBase;

  const isHorizontal = shape === "wave" || shape === "cloud" || shape === "ray";

  const animateProps = isHorizontal
    ? { x: [0, 15 + layerIndex * 5, -10, 0] }
    : { y: [0, -(10 + layerIndex * 5), 8, 0] };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: [opacity * 0.6, opacity, opacity * 0.7, opacity],
        ...animateProps,
      }}
      transition={{
        duration: durationBase,
        delay: delayBase,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        pointerEvents: "none",
        willChange: "transform, opacity",
        ...getShapeStyle(shape, size, color),
      }}
    />
  );
}

const AnimatedBackground = React.memo(function AnimatedBackground({ theme = "ocean" }) {
  const themeConfig = THEMES[theme] || THEMES.ocean;

  const elements = useMemo(() => {
    const result = [];
    themeConfig.layers.forEach((layer, layerIndex) => {
      const rand = seededRandom(layerIndex * 1000 + (theme.charCodeAt(0) || 0));
      for (let i = 0; i < layer.count; i++) {
        const sizeMin = layer.sizeRange[0];
        const sizeMax = layer.sizeRange[1];
        result.push({
          key: `${layerIndex}-${i}`,
          shape: layer.shape,
          color: layer.color,
          size: sizeMin + rand() * (sizeMax - sizeMin),
          x: rand() * 95,
          y: rand() * 95,
          opacity: layer.opacity,
          layerIndex,
          index: i,
        });
      }
    });
    return result;
  }, [theme, themeConfig]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: themeConfig.gradient,
        pointerEvents: "none",
      }}
    >
      {elements.map((el) => (
        <FloatingElement
          key={el.key}
          shape={el.shape}
          color={el.color}
          size={el.size}
          x={el.x}
          y={el.y}
          opacity={el.opacity}
          layerIndex={el.layerIndex}
          index={el.index}
        />
      ))}
    </div>
  );
});

export default AnimatedBackground;
