import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.inner}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>Electrical &amp; Computer Engineering — UBC</p>
          <h1 className={styles.title}>Tony Chen</h1>
          <p className={styles.subtitle}>
            I'm a UBC ECE student focused on embedded systems, intelligent
            software, and product-driven engineering projects.
          </p>
        </div>
        <div className={styles.photoFrame}>
          <img
            src="/tony.jpg"
            alt="Tony Chen"
            className={styles.photo}
          />
          <div className={styles.photoLabel}>[ TONY CHEN ]</div>
        </div>
      </div>
    </section>
  );
}
