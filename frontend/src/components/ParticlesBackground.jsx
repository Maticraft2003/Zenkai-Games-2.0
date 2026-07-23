const particles = Array.from({ length: 140 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  duration: `${1.4 + Math.random() * 1.6}s`,
  size: `${1.2 + Math.random() * 2.5}px`,
  opacity: 0.25 + Math.random() * 0.4,
  drift: `${-8 + Math.random() * 16}px`,
  height: `${8 + Math.random() * 18}px`,
}));

function ParticlesBackground() {

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background: "radial-gradient(circle at top, #1f0d0d 0%, #090909 100%)",
        pointerEvents: "none",
      }}
    >
      <style>{`
        @keyframes redRain {
          0% {
            transform: translate3d(0, -20vh, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--drift), 120vh, 0) rotate(22deg);
            opacity: 0;
          }
        }
      `}</style>

      {particles.map((particle) => (
        <span
          key={particle.id}
          style={{
            position: "absolute",
            left: particle.left,
            top: "-12vh",
            width: particle.size,
            height: particle.height,
            background: "linear-gradient(180deg, rgba(255,90,90,0.95), rgba(120,0,0,0.18))",
            borderRadius: "999px",
            opacity: particle.opacity,
            filter: "blur(0.35px)",
            animation: `redRain ${particle.duration} linear infinite`,
            animationDelay: particle.delay,
            boxShadow: "0 0 8px rgba(255, 40, 40, 0.5)",
            transform: "translateZ(0)",
            willChange: "transform, opacity",
            ["--drift"]: particle.drift,
          }}
        />
      ))}
    </div>
  );
}

export default ParticlesBackground;