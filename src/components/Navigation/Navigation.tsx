import React, { useEffect, useState, useCallback, useRef } from "react";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hero", label: "Home", href: "#hero" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "projects", label: "Projects", href: "#projects" },
  { id: "footer", label: "Contact", href: "#footer" },
];

export const Navigation: React.FC = () => {
  const [activeId, setActiveId] = useState<string>("hero");
  const isNavClickRef = useRef<boolean>(false);
  const navClickTimerRef = useRef<number | null>(null);

  const updateActiveSection = useCallback(() => {
    if (isNavClickRef.current) return;

    const scrollY = window.scrollY;
    const winH = window.innerHeight;
    const docH = document.documentElement.scrollHeight;
    const maxScrollY = docH - winH;

    // When near the top, hero is always active
    if (scrollY < 200) {
      setActiveId("hero");
      return;
    }

    const heroEl = document.getElementById("hero");
    const skillsEl = document.getElementById("skills");
    const projectsEl = document.getElementById("projects");
    const footerEl = document.getElementById("footer");

    // 1. Check if user reached Contact / footer
    let isContactActive = false;
    if (footerEl) {
      const footerRect = footerEl.getBoundingClientRect();
      const atPageBottom = maxScrollY > 0 && scrollY >= maxScrollY - 35;

      if (projectsEl) {
        const projectsRect = projectsEl.getBoundingClientRect();
        const projectsScrolledPast = projectsRect.bottom < winH * 0.42;
        if (
          projectsScrolledPast ||
          (atPageBottom && projectsRect.bottom < winH * 0.72)
        ) {
          isContactActive = true;
        }
      } else if (atPageBottom || footerRect.top < winH * 0.5) {
        isContactActive = true;
      }
    }

    if (isContactActive) {
      setActiveId("footer");
      return;
    }

    // 2. Determine active section based on user viewing focus point (~35% down viewport)
    const targetPoint = scrollY + Math.min(270, winH * 0.35);

    if (projectsEl && targetPoint >= projectsEl.offsetTop - 50) {
      setActiveId("projects");
    } else if (skillsEl && targetPoint >= skillsEl.offsetTop - 50) {
      setActiveId("skills");
    } else if (heroEl) {
      setActiveId("hero");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      if (navClickTimerRef.current) {
        window.clearTimeout(navClickTimerRef.current);
      }
    };
  }, [updateActiveSection]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id: string,
  ) => {
    e.preventDefault();

    const targetId = href.replace(/^#/, "");
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
      if (navClickTimerRef.current) {
        window.clearTimeout(navClickTimerRef.current);
      }
      isNavClickRef.current = true;
      setActiveId(id);

      // Home / Hero or available migrated section
      if (id === "hero") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }

      // Clean URL update without breaking history
      if (window.location.hash !== href) {
        window.history.pushState(null, "", href);
      }

      navClickTimerRef.current = window.setTimeout(() => {
        isNavClickRef.current = false;
        updateActiveSection();
      }, 850);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    href: string,
    id: string,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const clickEvent = e as unknown as React.MouseEvent<HTMLAnchorElement>;
      handleNavClick(clickEvent, href, id);
    }
  };

  return (
    <>
      <a className="skip" href="#hero">
        Skip to content
      </a>
      <nav className="pill" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={isActive ? "active" : ""}
              tabIndex={0}
              role="link"
              aria-current={isActive ? "page" : undefined}
              onClick={(e) => handleNavClick(e, item.href, item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.href, item.id)}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </>
  );
};
