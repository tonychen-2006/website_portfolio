import styles from "./About.module.css";
import { BlogFeed } from "../pages/Reflect";

export default function About() {
  return (
    <section className={styles.about} id="blog">
      <h2>Blog</h2>
      <div className={styles.blogWrap}>
        <header className={styles.blogHeader}>
          <h3 className={styles.blogTitle}>Writing</h3>
          <p className={styles.blogDesc}>
            Notes on engineering, learning, and aspirations!
          </p>
        </header>
        <BlogFeed />
      </div>
    </section>
  );
}
