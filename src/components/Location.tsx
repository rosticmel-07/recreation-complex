"use client";

import { useI18n } from "@/i18n/client";
import styles from "./Location.module.css";

const COORDS = "48.4558,24.5562";

export default function Location() {
  const { t, locale } = useI18n();

  return (
    <section id="location" className={styles.section} aria-labelledby="location-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <h2 id="location-title" className="h2">
            {t.location.title}
          </h2>
          <p className={styles.lead}>{t.location.lead}</p>

          <table className={styles.table}>
            <tbody>
              {t.location.distances.map((d) => (
                <tr key={d.place}>
                  <th scope="row">{d.place}</th>
                  <td>{d.value}</td>
                  <td>{d.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <a
            className="btn"
            href={`https://www.google.com/maps/search/?api=1&query=${COORDS}`}
            target="_blank"
            rel="noreferrer"
          >
            {t.location.map}
          </a>
        </div>

        <div className={styles.map}>
          <iframe
            title={t.location.title}
            src={`https://maps.google.com/maps?q=${COORDS}&z=11&hl=${locale === "uk" ? "uk" : "en"}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <span className={styles.pin} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
