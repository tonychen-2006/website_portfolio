import { useLocation, Link } from "react-router-dom";
import styles from "./Header.module.css";

type NavItem =
  | { label: string; hash: string; path?: never }
  | { label: string; path: string; hash?: never };

const NAV: NavItem[] = [
  { label: "Home", hash: "top" },
  { label: "Experience", hash: "experience" },
  { label: "Education", hash: "education" },
  { label: "Projects", hash: "projects" },
  { label: "Blog", hash: "blog" },
];

export default function Header() {
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const basePath = import.meta.env.BASE_URL;

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand}>Tony Chen</Link>
      <nav aria-label="Primary navigation">
        <ul className={styles.nav}>
          {NAV.map((item) => (
            <li key={item.label}>
              {item.path ? (
                <a href={`${basePath}${item.path}`} className={styles.link}>
                  {item.label}
                </a>
              ) : (
                <a
                  href={onHome ? `#${item.hash}` : `${basePath}#${item.hash}`}
                  className={styles.link}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
