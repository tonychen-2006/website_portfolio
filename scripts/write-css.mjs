import { writeFileSync } from "fs";

const css = `
.card {
  display: flex;
  flex-direction: row;
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  background: rgba(10, 16, 20, 0.5);
  border-radius: 4px;
  overflow: hidden;
  transition: background 0.18s;
}

.card:hover {
  background: rgba(14, 22, 28, 0.75);
}

/* Left thumbnail */
.imageWrap {
  position: relative;
  width: 130px;
  flex-shrink: 0;
  overflow: hidden;
  background: #0c1218;
}

.imageWrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.carouselControls {
  position: absolute;
  bottom: 0.4rem;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.carouselBtn {
  background: rgba(10, 15, 18, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--text);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  line-height: 1;
  padding: 0;
  transition: background 0.15s, border-color 0.15s;
}

.carouselBtn:hover {
  background: rgba(52, 211, 153, 0.2);
  border-color: var(--accent);
}

.carouselDots {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 0;
  transition: background 0.15s;
}

.dotActive {
  background: var(--accent);
}

/* Right content */
.content {
  flex: 1;
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.titleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.title {
  margin: 0;
  font-family: var(--font-head);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.githubLink {
  display: flex;
  align-items: center;
  color: var(--muted);
  text-decoration: none;
  flex-shrink: 0;
  transition: color 0.18s;
}

.githubLink:hover {
  color: var(--accent);
}

.description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.5;
}

.role {
  margin: 0;
  font-size: 0.78rem;
  color: rgba(143, 171, 190, 0.6);
  font-style: italic;
}

.tools {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.1rem;
}

.tool {
  font-size: 0.72rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.07);
  color: var(--accent);
  border: 1px solid rgba(52, 211, 153, 0.15);
}
`.trim();

writeFileSync(
  new URL("../src/components/ProjectCard.module.css", import.meta.url),
  css
);
console.log("Written successfully.");
