import React, { useRef } from "react";
import type { ProjectItem } from "../../types/profile";

interface ProjectCardProps {
  project: ProjectItem;
  isHighlighted: boolean;
  onCardClick: (project: ProjectItem, el: HTMLElement) => void;
  onCardMouseEnter: (
    e: React.MouseEvent<HTMLElement>,
    project: ProjectItem,
    el: HTMLElement,
  ) => void;
  onCardMouseLeave: (e: React.MouseEvent<HTMLElement>) => void;
  onCardFocus: (project: ProjectItem, el: HTMLElement) => void;
  onCardBlur: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isHighlighted,
  onCardClick,
  onCardMouseEnter,
  onCardMouseLeave,
  onCardFocus,
  onCardBlur,
}) => {
  const cardRef = useRef<HTMLElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    // Isolate direct external link clicks
    if ((e.target as HTMLElement).closest("a")) {
      return;
    }
    if (cardRef.current) {
      onCardClick(project, cardRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (cardRef.current) {
        onCardClick(project, cardRef.current);
      }
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (cardRef.current) {
      onCardMouseEnter(e, project, cardRef.current);
    }
  };

  const handleFocus = () => {
    if (cardRef.current) {
      onCardFocus(project, cardRef.current);
    }
  };

  return (
    <article
      ref={cardRef}
      className={`card ${isHighlighted ? "card-highlighted" : ""}`}
      tabIndex={0}
      role="button"
      aria-haspopup="dialog"
      aria-label={`View details for ${project.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onCardMouseLeave}
      onFocus={handleFocus}
      onBlur={onCardBlur}
    >
      <h3>{project.title}</h3>
      <p>{project.desc}</p>
      {project.link ? (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          View project ↗
        </a>
      ) : (
        <span className="project-note">Project details</span>
      )}
    </article>
  );
};
