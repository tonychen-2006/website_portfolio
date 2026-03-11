import styles from "./Resume.module.css";

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function Resume() {
  return (
    <section className={styles.section} id="resume">
      <h2>Resume</h2>
      <p className={styles.text}>
        View my full work experience, coursework, and technical skills.
      </p>
      <div className={styles.row}>
        <a
          className={styles.link}
          href={import.meta.env.BASE_URL + 'resume.pdf'}
          download="tony_chen_resume.pdf"
          aria-label="Download resume PDF"
        >
          <DownloadIcon />
          Download Resume (PDF)
        </a>
      </div>
    </section>
  );
}
