# Mortgage Calculator

An open-source mortgage calculator. See exactly what overpaying does to a loan.

![Example screenshot of dashboard](./docs/screenshot.png)

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
