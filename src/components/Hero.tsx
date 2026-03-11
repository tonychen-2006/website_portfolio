import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero} id="top">
      <div className={styles.inner}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Electrical &amp; Computer Engineering — UBC</p>
          <h1 className={styles.title}>Tony Chen</h1>
        </div>
        <div className={styles.photoFrame}>
          <img
            src={import.meta.env.BASE_URL + 'tony.jpg'}
            alt="Tony Chen"
            className={styles.photo}
          />
          <div className={styles.photoLabel}>[ TONY CHEN ]</div>
        </div>
      </div>
    </section>
  );
}
