import styles from "./Header.module.css";

const NAV = [
  { label: "About", href: "#about" },
  { label: "Education", href: "#education" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
];

export default function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>Tony Chen</span>
      <nav aria-label="Primary navigation">
        <ul className={styles.nav}>
          {NAV.map(({ label, href }) => (
            <li key={href}>
              <a href={href} className={styles.link}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
