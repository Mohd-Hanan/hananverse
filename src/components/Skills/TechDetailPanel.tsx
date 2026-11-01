import React from "react";

interface TechDetailPanelProps {
  isOpen: boolean;
  categoryName: string;
  techName: string;
  linkedProjects: string[];
  onClose: () => void;
  onSelectProject: (projectName: string) => void;
}

export const TechDetailPanel: React.FC<TechDetailPanelProps> = ({
  isOpen,
  categoryName,
  techName,
  linkedProjects,
  onClose,
  onSelectProject,
}) => {
  return (
    <div
      id="tech-detail-panel"
      className={`tech-detail-panel ${isOpen ? "open" : ""}`}
      role="dialog"
      aria-labelledby="tech-detail-title"
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="tech-detail-close"
        id="tech-detail-close"
        aria-label="Close technology details"
        onClick={onClose}
      >
        ✕
      </button>

      <div className="tech-detail-badge" id="tech-detail-category">
        {categoryName}
      </div>

      <h3 className="tech-detail-title" id="tech-detail-title">
        {techName}
      </h3>

      <div className="tech-detail-content" id="tech-detail-content">
        {linkedProjects.length > 0 ? (
          <>
            <span className="tech-detail-projects-label">
              Verified Showcase Projects
            </span>
            <div className="tech-detail-projects">
              {linkedProjects.map((projectName) => (
                <button
                  key={projectName}
                  type="button"
                  className="tech-detail-project-btn"
                  data-project={projectName}
                  aria-label={`View project ${projectName}`}
                  onClick={() => onSelectProject(projectName)}
                >
                  <span>{projectName}</span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="tech-detail-empty-note">
            Core technical capability · Explored through coursework and
            experimentation.
          </p>
        )}
      </div>
    </div>
  );
};
