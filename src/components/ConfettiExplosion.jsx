import React, { useEffect, useState, useCallback } from "react";

const PARTICLE_COUNT = 30;
const COLORS = ["#f59e0b", "#ef4444", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];
const SHAPES = ["circle", "square", "star"];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function Particle({ color, shape, startX, startY, angle, speed, size, delay }) {
  const [style, setStyle] = useState({
    position: "absolute",
    left: startX,
    top: startY,
    width: size,
    height: size,
    opacity: 1,
    transform: "scale(1) rotate(0deg)",
    transition: `all ${randomBetween(0.8, 1.4)}s cubic-bezier(.15,.8,.3,1)`,
    transitionDelay: `${delay}s`,
    pointerEvents: "none",
    zIndex: 9999,
  });

  useEffect(() => {
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 40;
    requestAnimationFrame(() => {
      setStyle((s) => ({
        ...s,
        left: startX + dx,
        top: startY + dy + 120,
        opacity: 0,
        transform: `scale(0.3) rotate(${randomBetween(-360, 360)}deg)`,
      }));
    });
  }, []);

  const shapeStyle =
    shape === "circle"
      ? { borderRadius: "50%", backgroundColor: color }
      : shape === "star"
      ? { backgroundColor: "transparent", fontSize: size, lineHeight: 1, color }
      : { borderRadius: 2, backgroundColor: color };

  return (
    <div style={{ ...style, ...shapeStyle }}>
      {shape === "star" ? "★" : null}
    </div>
  );
}

export default function ConfettiExplosion({ trigger }) {
  const [particles, setParticles] = useState([]);

  const explode = useCallback(() => {
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: Date.now() + i,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      startX: randomBetween(30, 70),
      startY: randomBetween(20, 50),
      angle: randomBetween(-Math.PI, 0),
      speed: randomBetween(60, 180),
      size: randomBetween(6, 14),
      delay: randomBetween(0, 0.15),
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, []);

  useEffect(() => {
    if (trigger > 0) explode();
  }, [trigger, explode]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    >
      {particles.map((p) => (
        <Particle key={p.id} {...p} startX={`${p.startX}%`} startY={`${p.startY}%`} />
      ))}
    </div>
  );
}
