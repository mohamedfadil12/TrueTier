import React from 'react';

export interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string | number;
  max?: string | number;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  color = '#f09e26',
  showLabels = false,
  min = '0',
  max = '100',
}) => {
  const totalTicks = 40;
  // Clamped active count between 0 and 40
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const activeCount = Math.round((clampedValue / 100) * totalTicks);

  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // Arc spanning from angle π (180°, left) to 2π (360°, right)
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const rOuter = 80;
    const rInner = 70; // (r - 10)
    const cx = 100;
    const cy = 100;

    const x1 = cx + rInner * Math.cos(angle);
    const y1 = cy + rInner * Math.sin(angle);
    const x2 = cx + rOuter * Math.cos(angle);
    const y2 = cy + rOuter * Math.sin(angle);

    const isActive = i < activeCount;

    return {
      id: i,
      x1,
      y1,
      x2,
      y2,
      stroke: isActive ? color : '#d4d4d8',
    };
  });

  return (
    <div className="w-full max-w-[260px] mx-auto flex flex-col items-center select-none">
      <svg
        viewBox="0 0 200 120"
        className="w-full h-auto overflow-visible"
        aria-hidden="true"
      >
        {ticks.map((tick) => (
          <line
            key={tick.id}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}
        <text
          x={100}
          y={105}
          textAnchor="middle"
          fill="#0b0f1a"
          style={{ fontSize: 22, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="flex justify-between items-center w-full px-4 -mt-1 text-[11px] text-neutral-500 font-medium font-sans">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default Gauge;
