import type { StorybookConfig } from "@storybook/react-vite";

export default {
  framework: "@storybook/react-vite",
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: []
} satisfies StorybookConfig;
