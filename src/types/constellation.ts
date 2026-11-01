export interface ConstellationTechnology {
  name: string;
  x: number;
  y: number;
}

export interface ConstellationCategory {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  technologies: ConstellationTechnology[];
}

export interface ConstellationData {
  categories: ConstellationCategory[];
  verifiedProjects: Record<string, string[]>;
}

export interface Point {
  x: number;
  y: number;
}
