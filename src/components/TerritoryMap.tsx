"use client";

import { useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { houses, photos, type HouseSlug } from "@/data/houses";
import styles from "./TerritoryMap.module.css";

/* ---------- Map geometry (SVG units: 1000 × 700, 2.5 units = 1 metre) ---------- */

const W = 1000;
const H = 700;
const UNITS_PER_M = 2.5;
const PEAK = { x: 780, y: 110 };
const RING_STEP = 62;
const TOP_ELEVATION = 985;

type PlaceKey = "gate" | "sauna" | "firepit" | "trails";
type Point = { id: HouseSlug | PlaceKey; kind: "house" | "place"; x: number; y: number; photo: StaticImageData };

const points: Point[] = [
  { id: "smereka", kind: "house", x: 290, y: 300, photo: houses[0].cover },
  { id: "polonyna", kind: "house", x: 640, y: 215, photo: houses[1].cover },
  { id: "vatra", kind: "house", x: 715, y: 515, photo: houses[2].cover },
  { id: "gate", kind: "place", x: 110, y: 625, photo: photos.valley },
  { id: "sauna", kind: "place", x: 455, y: 470, photo: photos.sauna },
  { id: "firepit", kind: "place", x: 545, y: 590, photo: photos.firepit },
  { id: "trails", kind: "place", x: 925, y: 335, photo: photos.trail },
];

const elevationAt = (x: number, y: number) =>
  Math.round((TOP_ELEVATION - (Math.hypot((x - PEAK.x) / 1.25, y - PEAK.y) / RING_STEP) * 10) / 5) * 5;

const metres = (a: Point, b: Point) => Math.round(Math.hypot(a.x - b.x, a.y - b.y) / UNITS_PER_M / 10) * 10;

/** Closed, smoothly wobbling contour around the peak (Catmull-Rom converted to cubic Béziers). */
function contour(r: number, seed: number) {
  const n = 64;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(3 * a + seed * 0.45) + 0.045 * Math.sin(5 * a + 1.3 + seed * 0.2) + 0.03 * Math.cos(7 * a + seed);
    return [PEAK.x + Math.cos(a) * r * k * 1.25, PEAK.y + Math.sin(a) * r * k];
  });
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

/** Gentle curve between two points, used for footpaths. */
const path = (a: { x: number; y: number }, b: { x: number; y: number }, bend = 0.18) => {
  const mx = (a.x + b.x) / 2 - (b.y - a.y) * bend;
  const my = (a.y + b.y) / 2 + (b.x - a.x) * bend;
  return `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`;
};

export default function TerritoryMap() {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<Point["id"]>("polonyna");

  const rings = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ d: contour(40 + i * RING_STEP, i), elev: TOP_ELEVATION - 5 - i * 10, major: i % 5 === 2 })),
    [],
  );

  const current = points.find((p) => p.id === active)!;
  const house = current.kind === "house" ? houses.find((h) => h.slug === current.id)! : null;
  const place = current.kind === "place" ? t.map.places[current.id as PlaceKey] : null;
  const name = house ? house.name[locale] : place!.name;
  const gate = points.find((p) => p.id === "gate")!;
  const otherHouses = points.filter((p) => p.kind === "house" && p.id !== current.id);

  return (
    <section id="intro" className={styles.section} aria-labelledby="map-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <h2 id="map-title" className="h2">
            {t.map.title}
          </h2>
          <p className={styles.lead}>{t.map.lead}</p>

          <dl className={styles.facts}>
            {t.intro.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>

          <article className={styles.card} key={current.id} aria-live="polite">
            <div className={styles.cardPhoto}>
              <Image placeholder="blur" src={current.photo} alt="" fill sizes="(min-width: 1200px) 30vw, 90vw" />
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardElev}>
                {elevationAt(current.x, current.y)} {t.map.elevation}
              </p>
              <h3>{name}</h3>
              <p>{house ? house.tagline[locale] : place!.text}</p>
              {house && (
                <Link href={`/${locale}/houses/${house.slug}`} className={styles.cardLink}>
                  {t.map.open}
                </Link>
              )}
            </div>
          </article>
        </div>

        <div className={styles.mapWrap}>
          <div className={styles.map}>
            <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} aria-hidden="true">
              <defs>
                <clipPath id="map-clip">
                  <rect width={W} height={H} />
                </clipPath>
              </defs>
              <g clipPath="url(#map-clip)">
                {rings.map((r, i) => (
                  <path key={i} d={r.d} className={r.major ? styles.ringMajor : styles.ring} />
                ))}

                {/* Stream */}
                <path className={styles.stream} d="M40,40 C180,140 150,260 230,380 S330,560 300,700" />
                <text className={styles.streamLabel} x="182" y="250" transform="rotate(62 182 250)">
                  {t.map.stream}
                </text>

                {/* Footpaths from the gate */}
                {points
                  .filter((p) => p.id !== "gate" && p.id !== "trails")
                  .map((p) => (
                    <path key={p.id} className={styles.trail} d={path(gate, p, p.x > 500 ? -0.12 : 0.16)} />
                  ))}
                <path className={styles.trail} d={path(points[1], points[6], 0.2)} />
                <path className={styles.trailOut} d="M925,335 Q965,280 1000,250" />

                {/* Distances from the selected house to the others */}
                {house &&
                  otherHouses.map((o) => (
                    <g key={o.id} className={styles.measure}>
                      <line x1={current.x} y1={current.y} x2={o.x} y2={o.y} />
                      <text x={(current.x + o.x) / 2} y={(current.y + o.y) / 2 - 10}>
                        {metres(current, o)} {t.map.distance}
                      </text>
                    </g>
                  ))}

                {/* Elevation labels on index contours */}
                {rings
                  .filter((r) => r.major)
                  .map((r, i) => {
                    const rr = 40 + rings.indexOf(r) * RING_STEP;
                    const x = PEAK.x - rr * 1.25 * 0.72;
                    const y = PEAK.y + rr * 0.69;
                    return (
                      <text key={i} className={styles.elevLabel} x={x} y={y}>
                        {r.elev}
                      </text>
                    );
                  })}
              </g>

              {/* Scale and north */}
              <g className={styles.legend} transform={`translate(${W - 300}, ${H - 40})`}>
                <line x1="0" y1="0" x2={100 * UNITS_PER_M} y2="0" />
                <line x1="0" y1="-6" x2="0" y2="6" />
                <line x1={100 * UNITS_PER_M} y1="-6" x2={100 * UNITS_PER_M} y2="6" />
                <text x={(100 * UNITS_PER_M) / 2} y="-12">
                  {t.map.scale}
                </text>
              </g>
              <g className={styles.legend} transform={`translate(${W - 40}, 50)`}>
                <path d="M0,-22 L8,8 L0,2 L-8,8 Z" className={styles.north} />
                <text x="0" y="28">
                  N
                </text>
              </g>
            </svg>

            {points.map((p) => {
              const label = p.kind === "house" ? houses.find((h) => h.slug === p.id)!.name[locale] : t.map.places[p.id as PlaceKey].name;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={styles.marker}
                  data-kind={p.kind}
                  data-active={p.id === active || undefined}
                  data-side={p.x > 820 ? "left" : "right"}
                  style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }}
                  onClick={() => setActive(p.id)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.id)}
                  aria-pressed={p.id === active}
                >
                  <span className={styles.dot} />
                  <span className={styles.label}>{label}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.hint}>{t.map.hint}</p>
        </div>
      </div>
    </section>
  );
}
