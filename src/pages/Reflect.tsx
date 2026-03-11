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
    slug: "why-ece",
    date: "Mar 2026",
    title: "Why I chose Electrical & Computer Engineering",
    excerpt:
      "A reflection on the moment I realized I wanted to build things that sit at the edge of physics and software — and what that actually looks like in practice at UBC.",
    category: "academics",
  },
  {
    slug: "lessons-from-internship",
    date: "Jan 2026",
    title: "What my first engineering internship actually taught me",
    excerpt:
      "The gap between classroom knowledge and production code is real. Here's what surprised me, what humbled me, and what I'd tell myself before starting.",
    category: "work",
  },
  {
    slug: "on-side-projects",
    date: "Nov 2025",
    title: "On side projects and learning in public",
    excerpt:
      "I used to keep everything private until it was 'ready'. Shipping half-finished work turned out to be one of the best things I did for my learning.",
    category: "projects",
  },
];

export default function Reflect() {
  const [active, setActive] = useState<Category>("all");
  const filtered =
    active === "all" ? posts : posts.filter((p) => p.category === active);

  return (
    <main className={`main-content ${styles.page}`}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Blog Posts</p>
        <h1 className={styles.title}>Writing</h1>
        <p className={styles.subtitle}>
          Notes on engineering, learning, and building things.
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
          filtered.map((post) => (
            <article key={post.slug} className={styles.card}>
              <div className={styles.cardMeta}>
                <span className={styles.date}>{post.date}</span>
                <span className={styles.categoryBadge}>{post.category}</span>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              <p className={styles.excerpt}>{post.excerpt}</p>
              <span className={styles.readMore}>Read post →</span>
            </article>
          ))
        )}
      </div>
    </main>
  );
}
