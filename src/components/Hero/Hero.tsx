import React, { useRef } from "react";
import { StarfieldCanvas } from "./StarfieldCanvas";
import avatarImg from "../../assets/avatar.png";
import landscapeSvg from "../../assets/landscape.svg";

interface HeroProps {
  name?: string;
  tagline?: string;
  bio?: string;
  githubUrl?: string;
}

export const Hero: React.FC<HeroProps> = ({
  name = "Hanan",
  tagline = "Still learning, still building, still breaking things",
  bio = "Third-year B.Tech CSE (AI) student at TKMCE, Kollam. Curious about newer technology and advancements in AI and ML. I learn best by building things and breaking them.",
  githubUrl = "https://github.com/Mohd-Hanan",
}) => {
  const heroRef = useRef<HTMLElement | null>(null);

  return (
    <header className="hero" id="hero" ref={heroRef}>
      <StarfieldCanvas heroRef={heroRef} />
      <div className="stars"></div>
      <div className="moon"></div>
      <div className="shooting-star" aria-hidden="true"></div>

      <div className="note note-one">curious by nature ✦</div>
      <div className="note note-two">always learning...</div>

      <div className="hero-inner">
        <div className="hero-grid">
          {/* Left Content */}
          <div className="hero-left">
            <span className="eyebrow">
              <span className="eyebrow-sparkle">✦</span> A little corner of the
              internet
            </span>

            <h1>
              Hey, I'm
              <br />
              <span id="name">{name}</span>
            </h1>

            <p id="tagline">{tagline}</p>

            <div className="hero-cta-group">
              <a href="#projects" className="hero-btn-primary">
                <span>Explore My Projects</span>
                <span className="hero-btn-arrow">↓</span>
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-btn-secondary"
              >
                <svg
                  className="github-icon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub Profile ↗</span>
              </a>
            </div>
          </div>

          {/* Avatar */}
          <div className="hero-image">
            <div className="hero-avatar-frame">
              <div className="avatar-glow"></div>
              <img
                src={avatarImg}
                alt="Illustrated developer avatar"
                width={300}
                height={300}
              />
              <div className="hero-status-pill">
                <span className="status-dot"></span>
                <span>B.Tech CSE (AI) · TKMCE</span>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="hero-right">
            <div className="hero-bio-card">
              <div className="bio-card-header">
                <span className="bio-chip">✦ A bit about me</span>
              </div>

              <h2>Curious Developer</h2>

              <p id="bio">{bio}</p>

              <div className="hero-badges">
                <span className="hero-badge">AI / ML</span>
                <span className="hero-badge">Reinforcement Learning</span>
                <span className="hero-badge">IoT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Landscape */}
      <div className="landscape">
        <img
          src={landscapeSvg}
          alt="Illustrated hills, trees, a cat and a laptop"
        />
      </div>
    </header>
  );
};
