export interface ProjectItem {
  title: string;
  desc: string;
  link: string;
}

export interface ProjectMetadata {
  badge: string;
  skills: string[];
  technologies: string[];
  role: string;
}

export interface ProfileLinks {
  github: string;
  [key: string]: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  projects: ProjectItem[];
  links: ProfileLinks;
}
