import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Reflect.module.css";

type Category = "all" | "academics" | "personal" | "projects" | "work";

interface Post {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  category: Exclude<Category, "all">;
}

const TABS: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Academics", value: "academics" },
  { label: "Personal", value: "personal" },
  { label: "Projects", value: "projects" },
  { label: "Work", value: "work" },
];

const posts: Post[] = [
  {
    slug: "learing-zephyr-at-internship",
    date: "Feb 2026",
    title: "Learning Zephyr for the first time for an Internship",
    excerpt:
      "Before working at Verdi, I only understood how to use STM32-based FreeRTOS oS threads to run concurrent tasks, and at " +
      "Verdi I was expected to have fluency in Zephyr to produce for the team. This task was difficult as I had no idea how to " +
      "use the syntax, build system and general flow of this new system. Although being very challenging, I put myself up to the " +
      "task as I wished to contribute to the company to the best of my ability as well as improve my learning on a new firmware system " +
      "I could use in the future. This resulted in inspiring me to build my own Zephyr project during late Decemeber before I started " +
      "my internship. I build a simple embedded network using Zephyr where I used a nRF Nordic Semiconductors board and sent BLE commands " +
      "through their mobile nRF app to control LEDS and GPIOs on the board. This built a small base for me before I started working for Verdi. " +
      "While working at the company, I learned to pick up syntax and ask questions whenever I could. I also utilized my tools, using AI to learn " +
      "and give me examples of Zephyr programs. I always remembered to relate the new information I learned and compared it against things that " +
      "I knew before. After a month or so at the company, I became more confident in my abilites using Zephyr to create new threads, control GPIO outputs " +
      "and utilize all the peripherals on a given PCB exactly like I would using STM32-FreeRTOS based syntax. I still have a while to go and a project to " +
      "fully complete and will continue this blog thread in the next iteration!",
    category: "work",
  },
];

const PREVIEW_LENGTH = 280;

export default function Reflect() {
  const [active, setActive] = useState<Category>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const filtered =
    active === "all" ? posts : posts.filter((p) => p.category === active);

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  return (
    <main className={`main-content ${styles.page}`}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Blog Posts</p>
        <h1 className={styles.title}>Writing</h1>
        <p className={styles.subtitle}>
          Notes on engineering, learning, and aspirations!
        </p>
      </header>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${active === tab.value ? styles.tabActive : ""}`}
            onClick={() => setActive(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.feed}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No posts in this category yet.</p>
        ) : (
          filtered.map((post) => {
            const isExpanded = expanded.has(post.slug);
            const preview = post.excerpt.slice(0, PREVIEW_LENGTH).trimEnd();
            const truncated = post.excerpt.length > PREVIEW_LENGTH;
            return (
              <article key={post.slug} className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.date}>{post.date}</span>
                  <span className={styles.categoryBadge}>{post.category}</span>
                </div>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <p className={styles.excerpt}>
                  {isExpanded || !truncated
                    ? post.excerpt
                    : preview + "..."}
                </p>
                {truncated && (
                  <button
                    className={styles.readMore}
                    onClick={() => toggle(post.slug)}
                  >
                    {isExpanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
