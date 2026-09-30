# Stretchday

A clickable design prototype of Stretchday, a short daily stretch guide. Still drawings show each move, the muscle it reaches, three steps, and the usual mistake.

This is not the full product. There is no account, no real notifications, and no backend that schedules a full stretch catalog. Choices and progress stay in this browser.

## Run locally

```bash
npm install
npm run dev
```

The dev server listens on [http://127.0.0.1:47213](http://127.0.0.1:47213).

## What you can click through

- A first-run setup: session length, tight areas, and rest day
- Home for a stretch day, including a 5 / 10 / 15 minute switch and a preset swap
- A rest-day home, from the week strip
- One move at a time: hold drawing, muscle names, steps, timer, left and right, and check your form
- A library of eight stretches, filtered by area and position
- A short recap after the session

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
