# Styleguide

This package uses a token-first styleguide.

## Design tokens

Core tokens are defined in `src/styles/tokens.css`:

- Color primitives: `--bg`, `--surface`, `--coral`, `--mint`
- Text scales: `--text-1`, `--text-2`, `--text-3`
- Radius system: `--radius-lg`, `--radius-md`, `--radius-sm`
- Typography roles: `--font-display`, `--font-body`, `--font-mono`

## Usage rules

- New components must consume token variables instead of hardcoded colors.
- Display headings should use `--font-display`.
- Numeric-heavy values should use `--font-mono`.
- Interactive elements should use coral for focus and mint for positive outcomes.

## Storybook

Run `npm run storybook` and use `stories/App.stories.jsx` as the baseline reference.
