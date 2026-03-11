export interface Experience {
  id: number;
  role: string;
  company: string;
  companyUrl?: string;
  location: string;
  period: string;
  achievements: string[];
  tags: string[];
}

const experiences: Experience[] = [
  {
    id: 1,
    role: "Software Engineering Intern",
    company: "Acme Systems",
    location: "Vancouver, BC",
    period: "May 2025 — Aug 2025",
    achievements: [
      "Built a real-time telemetry dashboard reducing latency by 40 % across 12 device endpoints.",
      "Refactored core firmware communication layer in C++ to support a new BLE protocol stack.",
      "Collaborated with hardware team to define CAN bus message schemas for next-gen platform.",
    ],
    tags: ["C++", "React", "BLE", "CAN Bus", "Linux"],
  },
  {
    id: 2,
    role: "Undergraduate Research Assistant",
    company: "UBC ECE Lab",
    location: "Vancouver, BC",
    period: "Sep 2024 — Apr 2025",
    achievements: [
      "Implemented and benchmarked three neural network architectures for on-device inference.",
      "Reduced model size by 3× using quantisation + pruning with under 2 % accuracy loss.",
      "Authored lab documentation and presented weekly progress reports to senior researchers.",
    ],
    tags: ["Python", "PyTorch", "TensorFlow Lite", "MATLAB"],
  },
  {
    id: 3,
    role: "Teaching Assistant — ELEC 201",
    company: "University of British Columbia",
    location: "Vancouver, BC",
    period: "Jan 2024 — Apr 2024",
    achievements: [
      "Led weekly lab sessions of 20+ students covering circuit analysis and SPICE simulation.",
      "Developed supplementary practice problems that raised cohort midterm averages by 8 %.",
    ],
    tags: ["Circuit Analysis", "SPICE", "MATLAB"],
  },
];

export default experiences;
