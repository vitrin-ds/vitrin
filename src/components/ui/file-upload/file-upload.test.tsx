import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import { FileUpload } from "./file-upload";
import type { FileUploadItem } from "./file-item";
import { formatFileSize, matchesAccept, validateFiles } from "./validate-files";

const jpg = (name = "a.jpg", size = 1000) =>
  new File([new Uint8Array(size)], name, { type: "image/jpeg" });
const mov = new File(["x"], "video.mov", { type: "video/quicktime" });

const FILES: FileUploadItem[] = [
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

describe("validateFiles", () => {
  it("matches MIME types, wildcards and extensions", () => {
    expect(matchesAccept(jpg(), "image/*")).toBe(true);
    expect(matchesAccept(jpg(), "image/png,.JPG")).toBe(true);
    expect(matchesAccept(mov, "image/jpeg,image/png")).toBe(false);
  });

  it("rejects by type, size and count, in that order", () => {
    const big = jpg("big.jpg", 11);
    const result = validateFiles(
      [jpg("1.jpg"), mov, big, jpg("2.jpg")],
      {
        accept: "image/*",
        maxSize: 10_000,
        maxFiles: 2,
      },
      1,
    );
    expect(result.accepted.map((f) => f.name)).toEqual(["1.jpg"]);
    expect(result.rejected.map(({ file, reason }) => [file.name, reason])).toEqual([
      ["video.mov", "type"],
      ["big.jpg", "count"],
      ["2.jpg", "count"],
    ]);
  });

  it("formats sizes with Intl", () => {
    expect(formatFileSize(2_400_000)).toBe("2.4 MB");
    expect(formatFileSize(820_000)).toBe("820 kB");
    expect(formatFileSize(2_400_000, "de")).toBe("2,4 MB");
  });
});

describe("FileUpload", () => {
  it("offers Retry on failed files only", async () => {
    const onRetry = vi.fn();
    render(
      <FileUpload
        label="Photos"
        hint="JPG"
        onFilesSelected={() => undefined}
        files={FILES}
        onRetry={onRetry}
      />,
    );
    const retry = screen.getByRole("button", { name: "Retry upload of video.mov" });
    expect(retry).toHaveTextContent("Retry");
    expect(screen.getAllByRole("button", { name: /^Retry/ })).toHaveLength(1);
    await userEvent.click(retry);
    expect(onRetry).toHaveBeenCalledWith("3");
  });

  it("highlights the zone on hover and keyboard focus, and greys it out when disabled", () => {
    const { rerender } = render(
      <FileUpload label="Photos" hint="JPG" onFilesSelected={() => undefined} />,
    );
    const zone = () => screen.getByText("Drag & drop files or browse").parentElement!;
    expect(zone()).toHaveClass(
      "hover:border-border-accent",
      "has-focus-visible:border-border-accent",
    );
    rerender(<FileUpload label="Photos" hint="JPG" disabled onFilesSelected={() => undefined} />);
    expect(zone()).toHaveClass("border-border-disabled", "cursor-not-allowed");
    expect(zone()).not.toHaveClass("hover:border-border-accent");
    expect(screen.getByRole("button", { name: "Browse files" })).toBeDisabled();
  });

  it("offers a labelled group with Browse described by the hint", async () => {
    const { container } = render(
      <FileUpload
        label="Add photos (optional)"
        hint="JPG, PNG or HEIC · max 10 MB · up to 5 files"
        onFilesSelected={() => undefined}
        files={FILES}
        onRemove={() => undefined}
        onCancel={() => undefined}
      />,
    );
    expect(screen.getByRole("group", { name: "Add photos (optional)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Browse files" })).toHaveAccessibleDescription(
      "JPG, PNG or HEIC · max 10 MB · up to 5 files",
    );
    await expectNoAxeViolations(container);
  });

  it("passes picked files on and resets the input", async () => {
    const onFilesSelected = vi.fn();
    const { container } = render(
      <FileUpload label="Photos" hint="JPG" onFilesSelected={onFilesSelected} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [jpg("1.jpg"), jpg("2.jpg")]);
    expect(onFilesSelected.mock.calls[0][0].map((f: File) => f.name)).toEqual(["1.jpg", "2.jpg"]);
    expect(input.value).toBe("");
  });

  it("shows Drag over while files are dragged and passes dropped files", () => {
    const onFilesSelected = vi.fn();
    render(<FileUpload label="Photos" hint="JPG" onFilesSelected={onFilesSelected} />);
    const zone = screen.getByText("Drag & drop files or browse").parentElement!;
    const dataTransfer = { types: ["Files"], files: [jpg()] };
    fireEvent.dragEnter(zone, { dataTransfer });
    expect(screen.getByText("Drop files to upload")).toBeInTheDocument();
    expect(zone).toHaveClass("bg-surface-accent-subtle", "border-border-accent");
    fireEvent.drop(zone, { dataTransfer });
    expect(onFilesSelected).toHaveBeenCalledWith([dataTransfer.files[0]]);
    expect(screen.getByText("Drag & drop files or browse")).toBeInTheDocument();
  });

  it("replaces the hint with the error", () => {
    render(
      <FileUpload
        label="Photos"
        hint="JPG"
        error="File type not supported. Use JPG, PNG or HEIC."
        onFilesSelected={() => undefined}
      />,
    );
    const zone = screen.getByText("Drag & drop files or browse").parentElement!;
    expect(zone).toHaveClass("border-border-error");
    expect(screen.getByRole("button", { name: "Browse files" })).toHaveAccessibleDescription(
      "File type not supported. Use JPG, PNG or HEIC.",
    );
  });

  it("lists items by status, with cancel / remove buttons and announced status", async () => {
    const onCancel = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(
      <FileUpload
        label="Photos"
        hint="JPG"
        onFilesSelected={() => undefined}
        files={FILES}
        onCancel={onCancel}
        onRemove={onRemove}
      />,
    );
    expect(screen.getByText("2.4 MB · 64%")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: "Uploading skin-before.jpg" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel upload of skin-before.jpg" }));
    expect(onCancel).toHaveBeenCalledWith("1");
    await userEvent.click(screen.getByRole("button", { name: "Remove video.mov" }));
    expect(onRemove).toHaveBeenCalledWith("3");
    expect(screen.getAllByText("File type not supported")[0]).toHaveClass("text-text-error");
    expect(screen.getByRole("button", { name: "Remove skin-after.jpg" })).toHaveClass(
      "text-icon-primary",
    );
    const live = container.querySelector('[aria-live="polite"]')!;
    expect(live).toHaveTextContent("skin-after.jpg: uploaded");
    expect(live).toHaveTextContent("video.mov: File type not supported");
  });
});
