import fallbackEducation from "../data/education";
import { resumeEducation } from "../data/resumeExperiences";
import styles from "./Education.module.css";

const education =
  resumeEducation.length > 0 ? resumeEducation : fallbackEducation;

export default function Education() {
  return (
    <section className={styles.section} id="education">
      <div className={styles.sectionHead}>
        <h2>Education</h2>
      </div>
      <div className={styles.timeline}>
        {education.map((edu) => (
          <article key={edu.id} className={styles.entry}>
            <div className={styles.dot} aria-hidden="true" />
            <div className={styles.entryHead}>
              <div>
                <h3 className={styles.degree}>{edu.degree}</h3>
                <p className={styles.meta}>
                  {edu.institution}
                  {edu.location ? `\u00a0·\u00a0${edu.location}` : ""}
                </p>
              </div>
              <span className={styles.period}>{edu.period}</span>
            </div>
            {edu.details.length > 0 && (
              <ul className={styles.list}>
                {edu.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
