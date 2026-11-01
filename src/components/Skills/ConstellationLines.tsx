import React from "react";

export interface CategoryLineData {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive: boolean;
  isSubdued: boolean;
}

export interface TechLineData {
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface ConstellationLinesProps {
  ringPathD: string;
  categoryLines: CategoryLineData[];
  techLines: TechLineData[];
  isMobile: boolean;
}

export const ConstellationLines: React.FC<ConstellationLinesProps> = ({
  ringPathD,
  categoryLines,
  techLines,
  isMobile,
}) => {
  if (isMobile) {
    return null;
  }

  return (
    <svg
      id="constellation-svg"
      className="constellation-svg"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <g id="constellation-lines-layer">
        {/* Celestial connecting ring between category stars */}
        {ringPathD && (
          <path d={ringPathD} className="constellation-ring-line" />
        )}

        {/* Lines from central HANAN star to each category node */}
        {categoryLines.map((line) => {
          const lineClass =
            `constellation-line ${line.isActive ? "active" : ""} ${line.isSubdued ? "subdued" : ""}`.trim();
          return (
            <line
              key={line.id}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={lineClass}
            />
          );
        })}

        {/* Branch lines from active category to revealed technology nodes */}
        {techLines.map((line) => (
          <line
            key={line.name}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            className="tech-branch-line"
          />
        ))}
      </g>
    </svg>
  );
};
