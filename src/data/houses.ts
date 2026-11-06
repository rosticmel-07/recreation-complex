import type { StaticImageData } from "next/image";
import type { Locale } from "@/i18n/config";
import { photo } from "./images";

type L = Record<Locale, string>;

export type HouseSlug = "smereka" | "polonyna" | "vatra";

export type House = {
  slug: HouseSlug;
  name: L;
  /** Name as it is written in the administrator's Google Sheet. */
  sheetName: string;
  tagline: L;
  description: L[];
  guests: number;
  bedrooms: number;
  area: number;
  priceWeekday: number;
  priceWeekend: number;
  cover: StaticImageData;
  gallery: StaticImageData[];
  amenities: L[];
};

const u = photo;

export const houses: House[] = [
  {
    slug: "smereka",
    name: { uk: "Смерека", en: "Smereka" },
    sheetName: "Смерека",
    tagline: {
      uk: "Будиночок-трикутник серед смерек для двох або невеликої родини",
      en: "An A-frame among the spruces for two or a small family",
    },
    description: [
      {
        uk: "Смерека стоїть найглибше в лісі. Скляний фасад виходить на схил, тож уранці світло проходить крізь стовбури просто на ліжко.",
        en: "Smereka sits deepest in the forest. Its glass front faces the slope, so morning light falls through the trunks straight onto the bed.",
      },
      {
        uk: "Внизу вітальня з дров'яною пічкою і кухнею, нагорі спальня під самим дахом. Тераса на рівні крон, де зручно пити каву, поки туман спускається в долину.",
        en: "Downstairs is a living room with a wood stove and kitchen, upstairs a bedroom right under the roof. The terrace sits at canopy level, made for coffee while the fog drifts down the valley.",
      },
    ],
    guests: 4,
    bedrooms: 1,
    area: 48,
    priceWeekday: 4200,
    priceWeekend: 5200,
    cover: u("1601919051950-bb9f3ffb3fee"),
    gallery: [
      u("1728649072511-bd946044a63b"),
      u("1631630259742-c0f0b17c6c10"),
      u("1631756964162-25c8c07579b5"),
      u("1734599505058-6653a0d8d3ff"),
      u("1542213598-8fbf6282334b"),
    ],
    amenities: [
      { uk: "Дров'яна пічка", en: "Wood stove" },
      { uk: "Панорамне скло на ліс", en: "Panoramic glass facing the forest" },
      { uk: "Кухня з посудом", en: "Equipped kitchen" },
      { uk: "Тераса на рівні крон", en: "Canopy-level terrace" },
      { uk: "Wi‑Fi", en: "Wi‑Fi" },
      { uk: "Постіль і рушники", en: "Bed linen and towels" },
    ],
  },
  {
    slug: "polonyna",
    name: { uk: "Полонина", en: "Polonyna" },
    sheetName: "Полонина",
    tagline: {
      uk: "Світлий будинок з власним чаном і видом на хребет",
      en: "A light-filled house with its own hot tub and a view of the ridge",
    },
    description: [
      {
        uk: "Полонина відкрита до гір: дві висоти скла, білі стіни, багато світла. З вітальні видно хребет, а ввечері видно, як він рожевіє на заході.",
        en: "Polonyna opens onto the mountains: double-height glass, white walls, plenty of light. The ridge is visible from the living room, and in the evening you can watch it turn pink at sunset.",
      },
      {
        uk: "На терасі власний дерев'яний чан. Ми розпалюємо його до вашого приїзду, якщо попередите заздалегідь.",
        en: "There is a private wooden hot tub on the terrace. We heat it before you arrive if you let us know in advance.",
      },
    ],
    guests: 6,
    bedrooms: 2,
    area: 86,
    priceWeekday: 6400,
    priceWeekend: 7800,
    cover: u("1666934209851-aeecb19afb4a"),
    gallery: [
      u("1761782791727-3994283faa88"),
      u("1761782623468-6374c2a887d1"),
      u("1761782797823-2b555af8a226"),
      u("1727706572437-4fcda0cbd66f"),
      u("1713706980185-26059d47ea87"),
    ],
    amenities: [
      { uk: "Власний чан на терасі", en: "Private hot tub on the terrace" },
      { uk: "Вид на хребет", en: "Ridge view" },
      { uk: "Дві спальні", en: "Two bedrooms" },
      { uk: "Кухня-вітальня", en: "Open kitchen and living room" },
      { uk: "Wi‑Fi", en: "Wi‑Fi" },
      { uk: "Парковка біля будинку", en: "Parking by the house" },
    ],
  },
  {
    slug: "vatra",
    name: { uk: "Ватра", en: "Vatra" },
    sheetName: "Ватра",
    tagline: {
      uk: "Великий будинок для компанії або кількох родин",
      en: "A large house for a group or several families",
    },
    description: [
      {
        uk: "Ватра означає вогнище. У центрі будинку великий камін із каменю, навколо якого збирається вся компанія.",
        en: "Vatra means bonfire. At the heart of the house is a large stone fireplace where the whole group gathers.",
      },
      {
        uk: "Чотири спальні, велика кухня з довгим столом, власна сауна і місце для багаття надворі. Підходить для свят, днів народження і тихих тижнів разом.",
        en: "Four bedrooms, a big kitchen with a long table, a private sauna and a fire pit outside. Good for celebrations, birthdays and quiet weeks together.",
      },
    ],
    guests: 10,
    bedrooms: 4,
    area: 160,
    priceWeekday: 9800,
    priceWeekend: 12000,
    cover: u("1782226829785-0a7f9568c5ac"),
    gallery: [
      u("1680703486830-1b5af60635d7"),
      u("1697299261617-91f3902bfeea"),
      u("1782846484501-d4b1c5b57953"),
      u("1699629208190-672f7ef56d7b"),
      u("1713270176378-45fbf4a27099"),
    ],
    amenities: [
      { uk: "Камін із каменю", en: "Stone fireplace" },
      { uk: "Власна сауна", en: "Private sauna" },
      { uk: "Чотири спальні", en: "Four bedrooms" },
      { uk: "Стіл на 12 людей", en: "Table for 12" },
      { uk: "Місце для багаття", en: "Fire pit" },
      { uk: "Wi‑Fi", en: "Wi‑Fi" },
    ],
  },
];

export const houseBySlug = (slug: string) => houses.find((h) => h.slug === slug);

export const photos = {
  hero: u("1605008356723-46fe31075332"),
  ridge: u("1627671023546-1961cc129daa"),
  meadow: u("1566679056459-4cbb58a28570"),
  valley: u("1691413819265-0e37578fdd8a"),
  forest: u("1640932951603-0e1c51e421ea"),
  sauna: u("1660735698223-23a4edefa264"),
  tub: u("1708630283392-678476d547f8"),
  firepit: u("1558571196-0b0152de294c"),
  fire: u("1631630259742-c0f0b17c6c10"),
  trail: u("1581545089841-9423c2ec0548"),
  winter: u("1638985787285-46f05ff063f2"),
  alpenglow: u("1729935431972-7c6ec3f5c2c5"),
  clouds: u("1775840538701-21f82ea63cd7"),
};
