import type { Meta, StoryObj } from "@storybook/react";
import App from "../src/App";

const meta = {
  title: "Mortgage/App",
  component: App
} satisfies Meta<typeof App>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
