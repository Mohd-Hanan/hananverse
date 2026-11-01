import React, { useEffect, useRef, useState } from "react";
import type { ProjectItem } from "../../types/profile";
import { PROJECT_METADATA } from "../../constants/projectMetadata";

export type ModalMode = "hover" | "modal" | "keyboard";

interface ProjectModalProps {
  project: ProjectItem | null;
  mode: ModalMode | null;
  isOpen: boolean;
  onClose: (force?: boolean) => void;
  onMouseEnterModal?: () => void;
  onMouseLeaveModal?: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  mode,
  isOpen,
  onClose,
  onMouseEnterModal,
  onMouseLeaveModal,
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [displayProject, setDisplayProject] = useState<ProjectItem | null>(
    project,
  );

  useEffect(() => {
    if (project) {
      setDisplayProject(project);
    }
  }, [project]);

  // Manage body scroll locking when opened in modal mode
  useEffect(() => {
    if (isOpen && mode === "modal") {
      document.body.style.overflow = "hidden";
      const timer = window.setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
      return () => {
        window.clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mode]);

  // Global escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const currentProject = project || displayProject;
  const meta = currentProject
    ? PROJECT_METADATA[currentProject.title] || {
        badge: "Project Overview",
        skills: [],
        technologies: [],
        role: currentProject.desc,
      }
    : null;

  const backdropClasses = [
    "modal-backdrop",
    isOpen ? "modal-open" : "",
    mode === "modal" ? "modal-modal-mode" : "",
    mode === "hover" ? "modal-hover-mode" : "",
    mode === "keyboard" ? "modal-modal-mode" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose(true);
    }
  };

  return (
    <div
      ref={backdropRef}
      id="project-modal"
      className={backdropClasses}
      role="dialog"
      aria-modal={mode === "modal" ? "true" : undefined}
      aria-labelledby="modal-title"
      aria-hidden={!isOpen}
      onClick={handleBackdropClick}
    >
      <div
        className="modal-card"
        onMouseEnter={onMouseEnterModal}
        onMouseLeave={onMouseLeaveModal}
      >
        <button
          ref={closeBtnRef}
          type="button"
          className="modal-close"
          id="modal-close"
          aria-label="Close dialog"
          onClick={(e) => {
            e.stopPropagation();
            onClose(true);
          }}
        >
          ✕
        </button>

        <div className="modal-badge-row">
          <span className="modal-badge" id="modal-badge">
            {meta?.badge || "Project"}
          </span>
        </div>

        <h3 id="modal-title" className="modal-title">
          {currentProject?.title || ""}
        </h3>

        <p id="modal-desc" className="modal-desc">
          {currentProject?.desc || ""}
        </p>

        <div className="modal-section">
          <h4>Technologies & Tools</h4>
          <div id="modal-tech" className="modal-tech-chips">
            {meta?.technologies?.map((tech) => (
              <span key={tech}>{tech}</span>
            ))}
          </div>
        </div>

        <div className="modal-section">
          <h4>Role & Contribution</h4>
          <p id="modal-role" className="modal-role-text">
            {meta?.role || "Project design, implementation and testing."}
          </p>
        </div>

        <div className="modal-actions" id="modal-actions">
          {currentProject?.link ? (
            <a
              href={currentProject.link}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-btn-primary"
            >
              View on GitHub ↗
            </a>
          ) : (
            <span className="modal-note-pill">
              ✦ Academic prototype · Idea Lab
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
