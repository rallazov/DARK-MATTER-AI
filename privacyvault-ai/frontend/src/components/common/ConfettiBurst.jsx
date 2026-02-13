import { useEffect } from 'react';

const palette = ['#2dd4bf', '#f97316', '#0ea5e9', '#a3e635', '#f43f5e'];

export default function ConfettiBurst({ active }) {
  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(() => {}, 1200);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, index) => {
        const left = (index * 17) % 100;
        const delay = (index % 7) * 0.06;
        const color = palette[index % palette.length];
        const rotation = (index * 33) % 360;
        return (
          <span
            key={index}
            className="absolute top-0 h-3 w-2 animate-confetti"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              transform: `rotate(${rotation}deg)`,
              animationDelay: `${delay}s`
            }}
          />
        );
      })}
    </div>
  );
}
