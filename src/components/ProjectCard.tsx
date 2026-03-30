import { useState } from "react";
import type { Project } from "../data/projects";
import styles from "./ProjectCard.module.css";

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

interface Props {
  project: Project;
}

export default function ProjectCard({ project }: Props) {
  const imgs = project.images ?? [];
  const [idx, setIdx] = useState(0);
  const multi = imgs.length > 1;

  const prev = () => setIdx((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setIdx((i) => (i + 1) % imgs.length);

  return (
    <article className={styles.card}>
      {imgs.length > 0 && (
        <div className={styles.imageWrap}>
          <img
            src={imgs[idx].src.startsWith('/') ? import.meta.env.BASE_URL + imgs[idx].src.slice(1) : imgs[idx].src}
            alt={imgs[idx].alt}
            loading="lazy"
            key={idx}
            onError={(e) => {
              const wrap = (e.currentTarget as HTMLImageElement).closest(`.${styles.imageWrap}`) as HTMLElement | null;
              if (wrap) wrap.style.display = "none";
            }}
          />
          {multi && (
            <div className={styles.carouselControls}>
              <button onClick={prev} aria-label="Previous image" className={styles.carouselBtn}>
                &#8592;
              </button>
              <span className={styles.carouselDots}>
                {imgs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`${styles.dot} ${i === idx ? styles.dotActive : ""}`}
                  />
                ))}
              </span>
              <button onClick={next} aria-label="Next image" className={styles.carouselBtn}>
                &#8594;
              </button>
            </div>
          )}
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{project.title}</h3>
        </div>
        <ul className={styles.description}>
          {project.description.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className={styles.tools}>
          {project.tools.map((t) => (
            <span key={t} className={styles.tool}>{t}</span>
          ))}
        </div>
        {project.grade != null && (
          <div className={styles.gradeBar}>
            <div className={styles.gradeTrack}>
              <div
                className={styles.gradeFill}
                style={{ width: `${project.grade}%` }}
              />
            </div>
            <span className={styles.gradeLabel}>
              {project.grade >= 90 ? "A+" : project.grade >= 85 ? "A" : project.grade >= 80 ? "A-" : project.grade >= 76 ? "B+" : project.grade >= 72 ? "B" : project.grade >= 68 ? "B-" : project.grade >= 64 ? "C+" : project.grade >= 60 ? "C" : project.grade >= 55 ? "C-" : project.grade >= 50 ? "D" : "F"}
            </span>
          </div>
        )}
        {project.githubUrl && (
          <div className={styles.repoRow}>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.repoBtn}
            >
              <GitHubIcon />
              View Repo
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
