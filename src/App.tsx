import { useEffect, useState, useCallback } from "react";
import { Navigation } from "./components/Navigation/Navigation";
import { Hero } from "./components/Hero/Hero";
import { SkillsConstellation } from "./components/Skills/SkillsConstellation";
import { ProjectsGrid } from "./components/Projects/ProjectsGrid";
import { Footer } from "./components/Footer/Footer";
import type { ProfileData } from "./types/profile";
import type { ModalMode } from "./components/Projects/ProjectModal";

export default function App() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [highlightedProject, setHighlightedProject] = useState<string | null>(
    null,
  );
  const [openModalProject, setOpenModalProject] = useState<{
    title: string;
    mode: ModalMode;
  } | null>(null);

  useEffect(() => {
    const profileUrl = `${import.meta.env.BASE_URL}profile.json`;
    fetch(profileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile.json");
        return res.json();
      })
      .then((data: ProfileData) => {
        setProfile(data);
      })
      .catch((err) => {
        console.warn("Using default profile data:", err);
      });
  }, []);

  const handleSelectProjectFromSkills = useCallback((projectTitle: string) => {
    setHighlightedProject(projectTitle);
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".grid .card"),
    );
    const matched = cards.find(
      (c) =>
        c.querySelector("h3")?.textContent?.trim().toLowerCase() ===
        projectTitle.trim().toLowerCase(),
    );
    if (matched) {
      matched.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    window.setTimeout(() => {
      setOpenModalProject({ title: projectTitle, mode: "modal" });
    }, 380);
  }, []);

  return (
    <>
      <Navigation />
      <Hero
        name="Hanan"
        tagline={profile?.tagline}
        bio={profile?.bio}
        githubUrl={profile?.links?.github}
      />
      <main id="main">
        <SkillsConstellation onSelectProject={handleSelectProjectFromSkills} />
        <ProjectsGrid
          projects={profile?.projects}
          externalHighlight={highlightedProject}
          externalOpenModal={openModalProject}
          onClearHighlight={() => {
            setHighlightedProject(null);
            setOpenModalProject(null);
          }}
        />
      </main>
      <Footer name={profile?.name} githubUrl={profile?.links?.github} />
    </>
  );
}
