import { useState } from "react";
import ProjectCard from "./ProjectCard";
import projects, { type ProjectCategory } from "../data/projects";
import styles from "./Projects.module.css";

type Tab = ProjectCategory | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "design-team", label: "Design Team" },
  { key: "course", label: "Courses" },
  { key: "personal", label: "Personal" },
];

export default function Projects() {
  const [activeTab, setActiveTab] = useState<Tab>("all");

  const visible =
    activeTab === "all"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <section className={styles.section} id="projects">
      <div className={styles.head}>
        <h2>Projects</h2>
      </div>

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={activeTab === t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No projects in this category yet.</p>
      ) : (
        <div className={styles.projectList}>
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}
