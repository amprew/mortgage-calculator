# Mortgage Calculator v2 (React)

This project was converted from a single-page HTML calculator to a React package using Vite.

## Scripts

- `npm install`
- `npm run dev` to run the React app
- `npm run build` to build the package
- `npm run storybook` to open the styleguide
- `npm run build-storybook` to export the styleguide

## Project structure

- `src/lib/mortgage.js` amortization and formatting logic
- `src/components/*` UI components
- `src/styles/tokens.css` design tokens for the styleguide
- `src/styles/global.css` application styling
- `.storybook/*` Storybook configuration
- `stories/App.stories.jsx` top-level styleguide story

## Notes

The package keeps all mortgage calculations in the browser and does not call external APIs.
