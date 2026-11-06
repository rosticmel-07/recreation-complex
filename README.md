# Тиша — сайт відпочинкового комплексу

Демо-версія сайту з трьома будинками в Карпатах і онлайн-бронюванням,
синхронізованим з Google Таблицею адміністратора.

## Запуск

```bash
npm install
npm run dev
```

Відкрийте http://localhost:3000. Без налаштувань сайт працює в **демо-режимі**:
бронювання зберігаються в пам'яті сервера до перезапуску.

Щоб підключити реальну таблицю, дивіться [google-apps-script/SETUP.md](google-apps-script/SETUP.md).

## Структура

| Шлях | Що там |
|---|---|
| `src/app/[locale]/page.tsx` | Головна сторінка |
| `src/app/[locale]/houses/[slug]/page.tsx` | Сторінка будинку з календарем бронювання |
| `src/app/api/availability` | Зайняті дати всіх будинків |
| `src/app/api/booking` | Прийом заявки, перевірка дат, запис у таблицю, Telegram |
| `src/data/houses.ts` | Будинки: назви, описи, ціни, фото |
| `src/assets/photos/` | Фото сайту (оригінали, Next.js оптимізує їх сам) |
| `src/i18n/dictionaries.ts` | Усі тексти сайту українською та англійською |
| `src/lib/bookings.ts` | Робота з Google Таблицею та демо-режим |
| `google-apps-script/` | Скрипт для таблиці та інструкція |

## Що замінити перед запуском

- Фото: покладіть файли в `src/assets/photos/`, додайте їх у `src/data/images.ts` і вкажіть у `src/data/houses.ts` (зараз стокові з Unsplash). Next.js сам стискає фото (AVIF/WebP) під кожен екран і показує розмиту заглушку, поки фото вантажиться.
- Назву, контакти, адресу та координати карти (`src/i18n/dictionaries.ts`, `src/components/Location.tsx`).
- Ціни, описи та зручності будинків.
- Послуги на території (блок «Що є на території»).

## Технології

Next.js 16 (App Router), TypeScript, CSS Modules, GSAP + ScrollTrigger, Lenis.
Шрифти: Unbounded (заголовки) та Onest (текст).
