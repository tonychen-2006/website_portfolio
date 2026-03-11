import { useLocation, Link } from "react-router-dom";
import styles from "./Header.module.css";

const NAV = [
  { label: "About", hash: "about" },
  { label: "Education", hash: "education" },
  { label: "Experience", hash: "experience" },
  { label: "Projects", hash: "projects" },
];

export default function Header() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>Tony Chen</Link>
      <nav aria-label="Primary navigation">
        <ul className={styles.nav}>
          {NAV.map(({ label, hash }) => (
            <li key={hash}>
              <a
                href={onHome ? `#${hash}` : `/#${hash}`}
                className={styles.link}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
