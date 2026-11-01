import type { ProjectItem, ProjectMetadata } from "../types/profile";

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    title: "Wildfire Suppressing Multi-Drone Agent",
    desc: "A custom wildfire simulation where four firefighting drones learn to cooperate using PPO reinforcement learning. Includes battery management, resource constraints and real-time PyGame visualization.",
    link: "https://github.com/Mohd-Hanan/Wildfire-Suppressing-Multi-Drone-Agent",
  },
  {
    title: "Customer Segmentation",
    desc: "An interactive Streamlit dashboard that uses K-Means clustering to segment customers, visualize clusters with PCA, evaluate clustering quality and predict the segment of new customers.",
    link: "https://github.com/Mohd-Hanan/IML-PROJECT",
  },
  {
    title: "PowerGuard",
    desc: "A JavaFX desktop application that predicts electricity bills, tracks monthly budgets and benchmarks five machine learning models to select the best-performing model.",
    link: "https://github.com/Mohd-Hanan/AP-PROJECT",
  },
  {
    title: "Water Level Monitoring System",
    desc: "Developed an IoT-based water level monitoring system using Arduino UNO and ultrasonic sensors as part of Idea Lab (Semester 1).",
    link: "",
  },
];

export const PROJECT_METADATA: Record<string, ProjectMetadata> = {
  "Wildfire Suppressing Multi-Drone Agent": {
    badge: "AI & Simulation",
    skills: ["Python", "Git"],
    technologies: [
      "Python",
      "PyGame",
      "PPO Reinforcement Learning",
      "Multi-Agent Systems",
      "Git",
    ],
    role: "Designed custom wildfire simulation environment, multi-drone cooperative policy via PPO reinforcement learning, battery constraint modeling, and real-time PyGame visualizer.",
  },
  "Customer Segmentation": {
    badge: "Machine Learning",
    skills: ["Python", "Git"],
    technologies: [
      "Python",
      "Streamlit",
      "Scikit-Learn",
      "K-Means",
      "PCA",
      "Git",
    ],
    role: "Built the interactive Streamlit dashboard, implemented PCA visualization for high-dimensional customer data, clustering quality metrics, and customer segment classification.",
  },
  PowerGuard: {
    badge: "Desktop Application",
    skills: ["Java", "Git"],
    technologies: [
      "Java",
      "JavaFX",
      "Machine Learning",
      "Model Benchmarking",
      "Git",
    ],
    role: "Developed the JavaFX desktop user interface, monthly budget and electricity consumption tracking, and benchmarked five ML models to select the most accurate predictor.",
  },
  "Water Level Monitoring System": {
    badge: "IoT & Hardware",
    skills: ["C"],
    technologies: [
      "C",
      "Arduino UNO",
      "Ultrasonic Sensors",
      "Embedded Systems",
      "IoT",
    ],
    role: "Engineered an IoT prototype using Arduino UNO and ultrasonic distance sensors, programmed threshold measurement and alerting routines in C/Arduino as part of Idea Lab.",
  },
};
