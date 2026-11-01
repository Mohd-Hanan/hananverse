import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ProjectItem } from "../../types/profile";
import { DEFAULT_PROJECTS } from "../../constants/projectMetadata";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal, type ModalMode } from "./ProjectModal";

interface ProjectsGridProps {
  projects?: ProjectItem[];
  externalHighlight?: string | null;
  externalOpenModal?: { title: string; mode: ModalMode } | null;
  onClearHighlight?: () => void;
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({
  projects = DEFAULT_PROJECTS,
  externalHighlight = null,
  externalOpenModal = null,
  onClearHighlight,
}) => {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [highlightedTitle, setHighlightedTitle] = useState<string | null>(null);

  const lastFocusedCardRef = useRef<HTMLElement | null>(null);
  const hoverOpenTimerRef = useRef<number | null>(null);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const isPointerOverCardRef = useRef<boolean>(false);
  const isPointerOverModalRef = useRef<boolean>(false);
  const isTouchUserRef = useRef<boolean>(false);
  const isClosingRef = useRef<boolean>(false);

  // Detect touch usage
  useEffect(() => {
    const handleTouchStart = () => {
      isTouchUserRef.current = true;
    };
    window.addEventListener("touchstart", handleTouchStart, {
      passive: true,
      once: true,
    });
    return () => window.removeEventListener("touchstart", handleTouchStart);
  }, []);

  const isFineHover = (e: React.MouseEvent<HTMLElement>) => {
    const nativeEvent = e.nativeEvent as PointerEvent;
    if (nativeEvent && nativeEvent.pointerType === "touch") return false;
    if (
      nativeEvent &&
      (nativeEvent.pointerType === "mouse" || nativeEvent.pointerType === "pen")
    )
      return true;
    if (isTouchUserRef.current) return false;
    return true;
  };

  // Sync external highlight
  useEffect(() => {
    if (externalHighlight) {
      setHighlightedTitle(externalHighlight);
    }
  }, [externalHighlight]);

  // Sync external open modal trigger (e.g. from Skills Constellation)
  useEffect(() => {
    if (externalOpenModal) {
      const match = projects.find(
        (p) =>
          p.title.trim().toLowerCase() ===
          externalOpenModal.title.trim().toLowerCase(),
      );
      if (match) {
        setActiveProject(match);
        setModalMode(externalOpenModal.mode);
        setHighlightedTitle(match.title);
      }
    }
  }, [externalOpenModal, projects]);

  const closeModal = useCallback(
    (force = false) => {
      if (
        !force &&
        modalMode === "hover" &&
        (isPointerOverCardRef.current || isPointerOverModalRef.current)
      ) {
        return;
      }

      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
        hoverOpenTimerRef.current = null;
      }
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }

      isClosingRef.current = true;
      setActiveProject(null);
      setModalMode(null);

      // Return focus to last focused card if modal currently holds focus
      if (
        lastFocusedCardRef.current &&
        typeof lastFocusedCardRef.current.focus === "function"
      ) {
        const modal = document.getElementById("project-modal");
        if (modal && modal.contains(document.activeElement)) {
          lastFocusedCardRef.current.focus();
        }
      }

      window.setTimeout(() => {
        isClosingRef.current = false;
      }, 100);

      if (onClearHighlight) {
        onClearHighlight();
      }
    },
    [modalMode, onClearHighlight],
  );

  const scheduleHoverClose = useCallback(
    (delay = 320) => {
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }
      hoverCloseTimerRef.current = window.setTimeout(() => {
        if (!isPointerOverCardRef.current && !isPointerOverModalRef.current) {
          closeModal(true);
        }
      }, delay);
    },
    [closeModal],
  );

  const handleCardMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    project: ProjectItem,
    el: HTMLElement,
  ) => {
    if (!isFineHover(e)) return;

    isPointerOverCardRef.current = true;
    lastFocusedCardRef.current = el;

    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }

    if (activeProject && modalMode === "hover") {
      setActiveProject(project);
    } else {
      if (hoverOpenTimerRef.current)
        window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = window.setTimeout(() => {
        setActiveProject(project);
        setModalMode("hover");
      }, 220);
    }
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const nativeEvent = e.nativeEvent as PointerEvent;
    if (nativeEvent && nativeEvent.pointerType === "touch") return;

    isPointerOverCardRef.current = false;
    if (hoverOpenTimerRef.current) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    scheduleHoverClose(320);
  };

  const handleMouseEnterModal = () => {
    isPointerOverModalRef.current = true;
    if (hoverCloseTimerRef.current) {
      window.clearTimeout(hoverCloseTimerRef.current);
      hoverCloseTimerRef.current = null;
    }
  };

  const handleMouseLeaveModal = () => {
    isPointerOverModalRef.current = false;
    scheduleHoverClose(300);
  };

  const handleCardClick = (project: ProjectItem, el: HTMLElement) => {
    lastFocusedCardRef.current = el;
    if (hoverOpenTimerRef.current) {
      window.clearTimeout(hoverOpenTimerRef.current);
      hoverOpenTimerRef.current = null;
    }
    setActiveProject(project);
    setModalMode("modal");
  };

  const handleCardFocus = (project: ProjectItem, el: HTMLElement) => {
    if (isClosingRef.current) return;
    lastFocusedCardRef.current = el;
    setActiveProject(project);
    setModalMode("keyboard");
  };

  const handleCardBlur = () => {
    window.setTimeout(() => {
      const modal = document.getElementById("project-modal");
      const activeEl = document.activeElement;
      if (
        modal &&
        !modal.contains(activeEl) &&
        (!lastFocusedCardRef.current ||
          !lastFocusedCardRef.current.contains(activeEl))
      ) {
        if (modalMode === "keyboard" || modalMode === "hover") {
          closeModal(true);
        }
      }
    }, 120);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (hoverOpenTimerRef.current)
        window.clearTimeout(hoverOpenTimerRef.current);
      if (hoverCloseTimerRef.current)
        window.clearTimeout(hoverCloseTimerRef.current);
    };
  }, []);

  return (
    <>
      <section id="projects">
        <h2>Things I've built</h2>
        <div className="grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.title}
              project={project}
              isHighlighted={highlightedTitle === project.title}
              onCardClick={handleCardClick}
              onCardMouseEnter={handleCardMouseEnter}
              onCardMouseLeave={handleCardMouseLeave}
              onCardFocus={handleCardFocus}
              onCardBlur={handleCardBlur}
            />
          ))}
        </div>
      </section>

      {/* Project Detail Modal */}
      <ProjectModal
        project={activeProject}
        mode={modalMode}
        isOpen={Boolean(activeProject && modalMode)}
        onClose={closeModal}
        onMouseEnterModal={handleMouseEnterModal}
        onMouseLeaveModal={handleMouseLeaveModal}
      />
    </>
  );
};
