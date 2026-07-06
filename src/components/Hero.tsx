import styles from "./Hero.module.css";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.6l-7.33 8.38L22.9 22h-6.76l-5.29-6.92L4.8 22H1.44l7.84-8.96L1 2h6.93l4.78 6.32L18.244 2Zm-1.18 17.95h1.86L6.92 3.94H4.93l12.134 16.01Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h5" />
    </svg>
  );
}

const stats = [
  "Build core embedded systems for a solar-powered race vehicle: radio/cellular telemetry, driver and autonomous controls, motor logic, and boot flows.",
  "Ship real-world internship products from customer requirements to firmware design, testing, deployment, and documentation.",
  "Bridge firmware and hardware: debug with logic analyzers, oscilloscopes, and multimeters while designing PCB support circuits.",
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/tonychen-2006", icon: <GitHubIcon /> },
  { label: "X", href: "https://x.com/Tonychxnn", icon: <XIcon /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/tony-chen-376028246/", icon: <LinkedInIcon /> },
  { label: "Resume", href: import.meta.env.BASE_URL + "resume.pdf", icon: <ResumeIcon /> },
];

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.profile}>
        <div className={styles.photoFrame}>
          <img
            src={import.meta.env.BASE_URL + "tony.jpg"}
            alt="Tony Chen"
            className={styles.photo}
          />
        </div>

        <div className={styles.identity}>
          <p className={styles.eyebrow}>Firmware and Hardware Developer | ECE @ UBC</p>
          <h1 className={styles.title}>Tony Chen</h1>

          <ul className={styles.stats}>
            {stats.map((stat) => (
              <li key={stat}>{stat}</li>
            ))}
          </ul>

          <div className={styles.socials} aria-label="Social links">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.label === "Resume" ? undefined : "_blank"}
                rel={link.label === "Resume" ? undefined : "noreferrer"}
                className={styles.socialLink}
                title={link.label}
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <p className={styles.bio}>
          I am a current UBC ECE student focused on developing at the intersection 
          between hardware and software. I am passionate in embedded systems 
          and firmware development, as I am always excited to build engaging, productive 
          and innovative designs. At UBC, I am part of a student design team designing 
          solar-powered electric racing vehicles on the embedded systems and hardware team. 
          Outside of my technical life, I enjoy going to the gym, hiking the mountains, and drawing!
        </p>

        <div className={styles.footerLinks}>
          <div className={styles.homeMeta}>
            <span>Vancouver</span>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.flag} title="Canada">
              <img src={import.meta.env.BASE_URL + "flag.png"} alt="Canada" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
