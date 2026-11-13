import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { FileUploadItem } from "./file-item";
import { FILE_UPLOAD_LABELS, FileUpload } from "./file-upload";
import { validateFiles } from "./validate-files";

const HINT = "JPG, PNG or HEIC · max 10 MB · up to 5 files";
const ACCEPT = "image/jpeg,image/png,.heic";

const ITEMS: FileUploadItem[] = [
  { id: "1", name: "skin-before.jpg", size: 2_400_000, status: "uploading", progress: 64 },
  { id: "2", name: "skin-after.jpg", size: 1_800_000, status: "uploaded" },
  {
    id: "3",
    name: "video.mov",
    size: 9_000_000,
    status: "error",
    error: "File type not supported",
  },
];

type Args = {
  error: string;
  disabled: boolean;
  titleText: string;
  hintText: string;
  files: FileUploadItem[];
};

const meta = {
  title: "Components/Inputs/File Upload",
  // The defaults of Figma's `Dropzone` (State=Default).
  args: {
    error: "",
    disabled: false,
    titleText: FILE_UPLOAD_LABELS.title,
    hintText: HINT,
    files: [],
  },
  render: ({ error, titleText, hintText, ...args }) => (
    <FileUpload
      {...args}
      label="Add photos (optional)"
      hint={hintText}
      accept={ACCEPT}
      error={error || undefined}
      labels={{ ...FILE_UPLOAD_LABELS, title: titleText }}
      onFilesSelected={() => undefined}
      onCancel={() => undefined}
      onRemove={() => undefined}
      onRetry={() => undefined}
    />
  ),
  parameters: {
    // The Figma properties: Dropzone State (Error, Disabled), Title Text, Hint Text; File Item State.
    controls: { include: ["error", "disabled", "titleText", "hintText", "files"] },
    figma: {
      do: [
        "State accepted types, max size and count up front",
        "Validate on the client before uploading",
        "Show progress per file",
        "Let users remove or retry each file",
      ],
      dont: [
        "Don't rely on drag & drop only — always offer a button",
        "Don't clear the list on one error",
        "Don't hide the error reason",
        "Don't upload before the user confirms the form when files are sensitive",
      ],
    },
    docs: {
      description: {
        component: "Lets the user attach files by drag & drop or by browsing.",
      },
    },
  },
  argTypes: {
    error: {
      description:
        "Figma Dropzone `State=Error`: the reason replaces the hint (wrong type, too large, too many files). Empty: no error.",
      control: "text",
      table: { type: { summary: "string" } },
    },
    disabled: {
      description: "Figma Dropzone `State=Disabled`: upload limit reached or form disabled.",
      control: "boolean",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    titleText: {
      description: "Figma `Title Text`. In code: `labels.title`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: FILE_UPLOAD_LABELS.title } },
    },
    hintText: {
      description: "Figma `Hint Text`: accepted types, max size and count. In code: `hint`.",
      control: "text",
      table: { type: { summary: "string" }, defaultValue: { summary: HINT } },
    },
    files: {
      description: "Figma File Item, `State=Uploading`, `Uploaded` or `Error`: one entry per file.",
      control: "object",
      table: {
        type: { summary: "FileUploadItem[]" },
        defaultValue: { summary: "[]" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-448">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

/** The Dropzone at rest: drag and drop, or browse. */
export const Default: Story = {};

/** The Dropzone with the reason a file was refused. */
export const Error: Story = { args: { error: "File type not supported. Use JPG, PNG or HEIC." } };

/** Upload limit reached or the form is disabled. */
export const Disabled: Story = { args: { disabled: true } };

/** The File Items: Uploading · Uploaded · Error. */
export const WithFiles: Story = {
  args: { files: ITEMS },
};

function Playground() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [error, setError] = useState<string>();
  return (
    <FileUpload
      label="Add photos (optional)"
      hint={HINT}
      accept={ACCEPT}
      error={error}
      files={files}
      onRemove={(id) => setFiles((all) => all.filter((f) => f.id !== id))}
      onCancel={(id) => setFiles((all) => all.filter((f) => f.id !== id))}
      onFilesSelected={(picked) => {
        const { accepted, rejected } = validateFiles(
          picked,
          { accept: ACCEPT, maxSize: 10_000_000, maxFiles: 5 },
          files.length,
        );
        setError(rejected.length ? "Some files were not added. " + HINT : undefined);
        setFiles((all) => [
          ...all,
          ...accepted.map((file) => ({
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            status: "uploaded" as const,
          })),
        ]);
      }}
    />
  );
}

/** Client-side validation and a simulated upload. */
export const Interactive: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Playground />,
};
