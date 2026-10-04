# Mortgage Calculator v2 (React)

This project was converted from a single-page HTML calculator to a React and TypeScript package using Vite.

## Scripts

- `npm install`
- `npm run dev` to run the React app
- `npm run typecheck` to check all source, stories, and configuration types
- `npm run build` to typecheck and build the package
- `npm run storybook` to open the styleguide
- `npm run build-storybook` to export the styleguide

## Project structure

- `src/lib/mortgage.ts` amortization, formatting logic, and shared mortgage types
- `src/components/*` UI components
- `src/styles/tokens.css` design tokens for the styleguide
- `src/styles/global.css` application styling
- `.storybook/*` Storybook configuration
- `stories/App.stories.tsx` top-level styleguide story

## Notes

The package keeps all mortgage calculations in the browser and does not call external APIs.
