export interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  details: string[];
}

const fallbackEducation: Education[] = [
  {
    id: 1,
    degree:
      "Bachelor of Applied Science — Electrical and Computer Engineering",
    institution: "University of British Columbia",
    location: "Vancouver, BC",
    period: "Sep 2022 – May 2026",
    details: [],
  },
];

export default fallbackEducation;
