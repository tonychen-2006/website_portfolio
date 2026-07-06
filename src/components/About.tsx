import { Link } from "react-router-dom";
import styles from "./About.module.css";
import { posts } from "../pages/Reflect";

export default function About() {
  return (
    <section className={styles.about} id="blog">
      <h2>Blog</h2>
      <div className={styles.blogWrap}>
        <p className={styles.skillsLabel}>Recent Notes</p>
        <p className={styles.blogDesc}>The following contains detailed blog posts about my learning and reflections. 
          Each post shows in depth information about my learning, and informative breakdowns of specific project components.</p>
        <ul className={styles.blogList}>
          {posts.slice(0, 3).map((p) => (
            <li key={p.slug} className={styles.blogItem}>
              <span className={styles.blogDate}>{p.date}</span>
              <span className={styles.blogTitle}>{p.title}</span>
            </li>
          ))}
        </ul>
        <Link to="/reflect" className={styles.more}>
          View all posts →
        </Link>
      </div>
    </section>
  );
}
