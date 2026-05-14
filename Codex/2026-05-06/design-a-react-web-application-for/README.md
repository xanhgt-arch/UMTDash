# Cooper Usage Analytics

A React and Vite dashboard for Cooper Standard usage analytics. The app loads usage data, renders dashboard charts, and supports exports through PDF and Excel workflows.

## Tech Stack

- React 19
- TypeScript
- Vite
- ExcelJS
- jsPDF

## Getting Started

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

The app runs at:

```sh
http://127.0.0.1:5173
```

## Available Scripts

```sh
npm run dev
```

Starts the Vite development server.

```sh
npm run typecheck
```

Runs TypeScript checks without emitting files.

```sh
npm run build
```

Runs TypeScript checks and builds the production app into `dist/`.

```sh
npm run preview
```

Serves the production build locally for preview.

## Project Structure

```text
src/
  assets/       Static images and visual assets
  components/   Shared UI and chart components
  pages/        Application pages
  services/     Data loading, processing, and export logic
  styles/       Global styles
```

## Notes

- Generated build output is written to `dist/`.
- Local development logs and packaged archives are ignored by git.
- Keep source assets in `src/assets/` so Vite can process them correctly.
