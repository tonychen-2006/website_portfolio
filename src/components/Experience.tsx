import fallbackExperiences from "../data/experiences";
import resumeExperiences from "../data/resumeExperiences";
import styles from "./Experience.module.css";

// Use the auto-parsed resume data if available, otherwise show hand-written fallback
const experiences = resumeExperiences.length > 0 ? resumeExperiences : fallbackExperiences;

export default function Experience() {
  return (
    <section className={styles.section} id="experience">
      <div className={styles.sectionHead}>
        <h2>Experience</h2>
      </div>
      <div className={styles.timeline}>
        {experiences.map((exp) => (
          <article key={exp.id} className={styles.entry}>
            <div className={styles.dot} aria-hidden="true" />
            <div className={styles.entryHead}>
              <div>
                <h3 className={styles.role}>{exp.role}</h3>
                <p className={styles.meta}>
                  {exp.company}&nbsp;·&nbsp;{exp.location}
                </p>
              </div>
              <span className={styles.period}>{exp.period}</span>
            </div>
            <ul className={styles.list}>
              {exp.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <div className={styles.tags}>
              {exp.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
