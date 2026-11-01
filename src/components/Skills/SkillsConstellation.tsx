import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { CONSTELLATION_DATA } from "../../constants/constellationData";
import {
  ConstellationLines,
  type CategoryLineData,
  type TechLineData,
} from "./ConstellationLines";
import { TechDetailPanel } from "./TechDetailPanel";

interface SkillsConstellationProps {
  onSelectProject?: (projectTitle: string) => void;
}

export const SkillsConstellation: React.FC<SkillsConstellationProps> = ({
  onSelectProject,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeTechName, setActiveTechName] = useState<string | null>(null);
  const [visibleTechs, setVisibleTechs] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 650;
    }
    return false;
  });

  const [categoryLines, setCategoryLines] = useState<CategoryLineData[]>([]);
  const [techLines, setTechLines] = useState<TechLineData[]>([]);
  const [ringPathD, setRingPathD] = useState<string>("");

  const stageRef = useRef<HTMLDivElement>(null);
  const hananNodeRef = useRef<HTMLButtonElement>(null);
  const categoryNodesRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const techNodesRef = useRef<Record<string, HTMLButtonElement | null>>({});
  const techTimersRef = useRef<number[]>([]);
  const lastActiveTechRef = useRef<string | null>(null);
  const lastActiveCatRef = useRef<string | null>(null);

  const activeCategory =
    CONSTELLATION_DATA.categories.find((c) => c.id === activeCategoryId) ||
    null;

  // Track active nodes for refocus upon escape or panel close
  useEffect(() => {
    if (activeTechName) {
      lastActiveTechRef.current = activeTechName;
    }
  }, [activeTechName]);

  useEffect(() => {
    if (activeCategoryId) {
      lastActiveCatRef.current = activeCategoryId;
    }
  }, [activeCategoryId]);

  // Handle tech nodes entrance animation
  useEffect(() => {
    // Clear any previous timers
    techTimersRef.current.forEach((t) => window.clearTimeout(t));
    techTimersRef.current = [];

    if (!activeCategory) {
      setVisibleTechs(new Set());
      return;
    }

    setVisibleTechs(new Set());
    activeCategory.technologies.forEach((tech, idx) => {
      const timer = window.setTimeout(() => {
        setVisibleTechs((prev) => {
          const next = new Set(prev);
          next.add(tech.name);
          return next;
        });
      }, idx * 25);
      techTimersRef.current.push(timer);
    });

    return () => {
      techTimersRef.current.forEach((t) => window.clearTimeout(t));
      techTimersRef.current = [];
    };
  }, [activeCategory]);

  // Calculate coordinates for lines
  const updateLines = useCallback(() => {
    if (typeof window === "undefined") return;
    const mobile = window.innerWidth <= 650;
    setIsMobile(mobile);

    if (mobile) {
      setCategoryLines([]);
      setTechLines([]);
      setRingPathD("");
      return;
    }

    const stage = stageRef.current;
    const hananNode = hananNodeRef.current;
    if (!stage || !hananNode) return;

    const stageRect = stage.getBoundingClientRect();
    const hananRect = hananNode.getBoundingClientRect();
    const hananCenter = {
      x: hananRect.left + hananRect.width / 2 - stageRect.left,
      y: hananRect.top + hananRect.height / 2 - stageRect.top,
    };

    // Celestial connecting ring between category stars: ringOrder = [1, 0, 3, 5, 4, 2, 1]
    const ringOrder = [1, 0, 3, 5, 4, 2, 1];
    let pathD = "";
    ringOrder.forEach((idx, i) => {
      const cat = CONSTELLATION_DATA.categories[idx];
      if (cat) {
        const catEl = categoryNodesRef.current[cat.id];
        if (catEl) {
          const catRect = catEl.getBoundingClientRect();
          const pt = {
            x: catRect.left + catRect.width / 2 - stageRect.left,
            y: catRect.top + catRect.height / 2 - stageRect.top,
          };
          pathD += i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`;
        }
      }
    });
    setRingPathD(pathD);

    // Lines from HANAN to each category node
    const newCatLines: CategoryLineData[] = [];
    CONSTELLATION_DATA.categories.forEach((cat) => {
      const catEl = categoryNodesRef.current[cat.id];
      if (catEl) {
        const catRect = catEl.getBoundingClientRect();
        const catCenter = {
          x: catRect.left + catRect.width / 2 - stageRect.left,
          y: catRect.top + catRect.height / 2 - stageRect.top,
        };
        const isActive = cat.id === activeCategoryId;
        const isSubdued =
          activeCategoryId !== null && cat.id !== activeCategoryId;
        newCatLines.push({
          id: cat.id,
          x1: hananCenter.x,
          y1: hananCenter.y,
          x2: catCenter.x,
          y2: catCenter.y,
          isActive,
          isSubdued,
        });
      }
    });
    setCategoryLines(newCatLines);

    // If a category is active, draw branch lines to revealed technology nodes
    const newTechLines: TechLineData[] = [];
    if (activeCategoryId) {
      const activeCatEl = categoryNodesRef.current[activeCategoryId];
      const activeCatData = CONSTELLATION_DATA.categories.find(
        (c) => c.id === activeCategoryId,
      );
      if (activeCatEl && activeCatData) {
        const catRect = activeCatEl.getBoundingClientRect();
        const catCenter = {
          x: catRect.left + catRect.width / 2 - stageRect.left,
          y: catRect.top + catRect.height / 2 - stageRect.top,
        };

        activeCatData.technologies.forEach((tech) => {
          const techEl = techNodesRef.current[tech.name];
          if (techEl) {
            const techRect = techEl.getBoundingClientRect();
            const techCenter = {
              x: techRect.left + techRect.width / 2 - stageRect.left,
              y: techRect.top + techRect.height / 2 - stageRect.top,
            };
            newTechLines.push({
              name: tech.name,
              x1: catCenter.x,
              y1: catCenter.y,
              x2: techCenter.x,
              y2: techCenter.y,
            });
          }
        });
      }
    }
    setTechLines(newTechLines);
  }, [activeCategoryId]);

  // Recalculate lines after render / layout updates
  useLayoutEffect(() => {
    const animId = requestAnimationFrame(() => {
      updateLines();
    });
    return () => cancelAnimationFrame(animId);
  }, [updateLines, activeCategoryId]);

  // Window resize listener
  useEffect(() => {
    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        updateLines();
      }, 50);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [updateLines]);

  // Category selection handler
  const handleSelectCategory = (catId: string) => {
    if (activeCategoryId === catId) {
      handleReset();
      return;
    }
    setActiveCategoryId(catId);
    setActiveTechName(null);
  };

  // Tech selection handler
  const handleSelectTech = (techName: string) => {
    setActiveTechName(techName);
  };

  // Close tech detail panel
  const handleCloseDetail = useCallback((refocus = true) => {
    const prevTech = activeTechName || lastActiveTechRef.current;
    setActiveTechName(null);

    if (refocus && prevTech) {
      const techEl = techNodesRef.current[prevTech];
      if (techEl) techEl.focus();
    }
  }, [activeTechName]);

  // Constellation Reset handler
  const handleReset = useCallback((refocusCenter = false) => {
    setActiveCategoryId(null);
    setActiveTechName(null);
    setVisibleTechs(new Set());

    // Clear any project card highlights
    if (typeof document !== "undefined") {
      document
        .querySelectorAll(".grid .card")
        .forEach((c) => c.classList.remove("card-highlighted"));
    }

    if (refocusCenter && hananNodeRef.current) {
      hananNodeRef.current.focus();
    }
  }, []);

  // Keyboard navigation (Escape key handling)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeTechName) {
          e.preventDefault();
          handleCloseDetail(true);
          return;
        }
        if (activeCategoryId) {
          e.preventDefault();
          const catIdToFocus = activeCategoryId;
          handleReset(false);
          if (catIdToFocus && categoryNodesRef.current[catIdToFocus]) {
            categoryNodesRef.current[catIdToFocus]?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTechName, activeCategoryId, handleCloseDetail, handleReset]);

  // Project selection & cross-highlighting
  const handleSelectProject = (projectTitle: string) => {
    if (!projectTitle) return;

    if (onSelectProject) {
      onSelectProject(projectTitle);
    }

    // Cross-highlight in DOM if project cards are present
    if (typeof document !== "undefined") {
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(".grid .card"),
      );
      const matchedCard = cards.find((card) => {
        const title = card.querySelector("h3")?.textContent?.trim();
        return Boolean(
          title && title.toLowerCase() === projectTitle.trim().toLowerCase(),
        );
      });

      if (matchedCard) {
        matchedCard.scrollIntoView({ behavior: "smooth", block: "center" });
        cards.forEach((c) => c.classList.remove("card-highlighted"));
        matchedCard.classList.add("card-highlighted");
      }
    }

    handleCloseDetail(false);
  };

  // Header status text
  let statusText = "Select a constellation to explore";
  if (activeCategory) {
    if (activeTechName) {
      statusText = `Exploring: ${activeTechName} (${activeCategory.name})`;
    } else {
      statusText = `${activeCategory.name} active · Select a star to explore`;
    }
  }

  const linkedProjects = activeTechName
    ? CONSTELLATION_DATA.verifiedProjects[activeTechName] || []
    : [];

  return (
    <section id="skills" className="skills-section">
      <div className="skills-header">
        <h2>Skills Constellation</h2>
        <div className="skills-header-actions">
          <p className="constellation-hint">
            <span className="hint-sparkle">✦</span>
            <span id="constellation-status-text">{statusText}</span>
          </p>
          <button
            type="button"
            id="reset-constellation"
            className="reset-constellation-btn"
            style={{ display: activeCategoryId ? "inline-flex" : "none" }}
            aria-label="Reset constellation to initial view"
            onClick={() => handleReset(false)}
          >
            <span className="reset-icon">↺</span>
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Constellation Interactive Stage */}
      <div
        ref={stageRef}
        className="constellation-stage"
        id="constellation-stage"
        role="region"
        aria-label="Interactive skills constellation network"
      >
        <ConstellationLines
          ringPathD={ringPathD}
          categoryLines={categoryLines}
          techLines={techLines}
          isMobile={isMobile}
        />

        {/* Central Node (HANAN) */}
        <button
          ref={hananNodeRef}
          type="button"
          className="node-central"
          id="node-hanan"
          tabIndex={0}
          role="button"
          aria-label="Center star: HANAN. Activates constellation reset."
          onClick={() => handleReset(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleReset(true);
            }
          }}
        >
          <span className="central-glow"></span>
          <span className="central-star">✦</span>
          <span className="central-label">HANAN</span>
        </button>

        {/* Category Nodes Layer */}
        <div id="category-nodes-layer" className="category-nodes-layer">
          {CONSTELLATION_DATA.categories.map((cat) => {
            const isActive = cat.id === activeCategoryId;
            const isSubdued = activeCategoryId !== null && !isActive;
            const nodeClass =
              `category-node ${isActive ? "active" : ""} ${isSubdued ? "subdued" : ""}`.trim();

            return (
              <button
                key={cat.id}
                ref={(el) => {
                  categoryNodesRef.current[cat.id] = el;
                }}
                type="button"
                className={nodeClass}
                data-id={cat.id}
                tabIndex={0}
                role="button"
                aria-expanded={isActive}
                aria-label={`Constellation: ${cat.name}, ${cat.technologies.length} technologies`}
                style={
                  !isMobile
                    ? { left: `${cat.x}%`, top: `${cat.y}%` }
                    : undefined
                }
                onClick={() => handleSelectCategory(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectCategory(cat.id);
                  }
                }}
              >
                <span className="cat-star">✦</span>
                <span className="cat-label">{cat.name}</span>
                <span className="cat-badge">{cat.technologies.length}</span>
              </button>
            );
          })}
        </div>

        {/* Revealed Technology Nodes Layer */}
        <div
          id="tech-nodes-layer"
          className="tech-nodes-layer"
          aria-live="polite"
        >
          {activeCategory &&
            activeCategory.technologies.map((tech) => {
              const hasProjects =
                !!CONSTELLATION_DATA.verifiedProjects[tech.name]?.length;
              const isVisible = visibleTechs.has(tech.name);
              const isActive = tech.name === activeTechName;
              const techClass =
                `tech-node ${isVisible ? "visible" : ""} ${isActive ? "active" : ""}`.trim();

              return (
                <button
                  key={tech.name}
                  ref={(el) => {
                    techNodesRef.current[tech.name] = el;
                  }}
                  type="button"
                  className={techClass}
                  data-tech={tech.name}
                  tabIndex={0}
                  role="button"
                  aria-label={`Technology: ${tech.name}${hasProjects ? " (has linked projects)" : ""}`}
                  style={
                    !isMobile
                      ? { left: `${tech.x}%`, top: `${tech.y}%` }
                      : undefined
                  }
                  onClick={() => handleSelectTech(tech.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectTech(tech.name);
                    }
                  }}
                >
                  {hasProjects && (
                    <span className="tech-has-projects" aria-hidden="true" />
                  )}
                  <span>{tech.name}</span>
                </button>
              );
            })}
        </div>

        {/* Technology Detail Panel */}
        <TechDetailPanel
          isOpen={Boolean(activeTechName && activeCategory)}
          categoryName={activeCategory ? activeCategory.name : ""}
          techName={activeTechName || ""}
          linkedProjects={linkedProjects}
          onClose={() => handleCloseDetail(true)}
          onSelectProject={handleSelectProject}
        />
      </div>
    </section>
  );
};
