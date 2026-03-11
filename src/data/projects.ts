export type ProjectCategory = "design-team" | "course" | "personal";

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  id: number;
  title: string;
  summary: string;
  description: string;
  role: string;
  tools: string[];
  images?: ProjectImage[];   // multiple → carousel; one → static; omit → no photo
  githubUrl?: string;
  category: ProjectCategory;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Autonomous Line-Following Robot",
    summary: "PID-controlled embedded robot for dynamic track navigation.",
    description:
      "Designed and built a compact robot using PID feedback control to navigate dynamic tracks at speed. Integrated IR sensor calibration routines and optimized motor PWM response for stable behaviour under variable ambient lighting. Tuned Kp, Ki, Kd coefficients iteratively using oscilloscope waveform analysis.",
    role: "Embedded control logic, PCB integration, system calibration and testing.",
    tools: ["C/C++", "STM32", "KiCad", "FreeRTOS"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        alt: "Prototype electronics board on a workbench",
      },
      {
        src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
        alt: "Robot prototype in testing",
      },
    ],
    githubUrl: "https://github.com/yourusername/line-following-robot",
    category: "course",
  },
  {
    id: 2,
    title: "Smart Energy Dashboard",
    summary: "Real-time energy monitoring web app for student residences.",
    description:
      "Built a full-stack dashboard aggregating power consumption data from smart meters and visualizing 7-day trends to support efficient energy usage decisions. Implemented a lightweight REST API, a PostgreSQL time-series schema, and a responsive Chart.js front-end with weekly summary emails.",
    role: "Data pipeline design, REST endpoints, database schema, UI implementation.",
    tools: ["React", "TypeScript", "Node.js", "PostgreSQL", "Chart.js"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        alt: "Code editor showing a dashboard interface",
      },
    ],
    githubUrl: "https://github.com/yourusername/energy-dashboard",
    category: "design-team",
  },
  {
    id: 3,
    title: "Vision-Based Defect Detection",
    summary: "CNN pipeline classifying PCB manufacturing defects from images.",
    description:
      "Developed a computer vision pipeline using a fine-tuned ResNet50 to classify five defect categories from PCB sample images. Focused on balancing model accuracy with inference efficiency for edge deployment constraints. Achieved 94% test accuracy; containerised the inference service with Docker.",
    role: "Dataset curation, model training & evaluation, deployment scripting.",
    tools: ["Python", "PyTorch", "OpenCV", "Docker"],
    images: [
      {
        src: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=80",
        alt: "Laptop showing data visualisations",
      },
    ],
    githubUrl: "https://github.com/yourusername/defect-detection",
    category: "personal",
  },
];

export default projects;
