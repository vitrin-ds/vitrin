"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { FILE_ITEM_LABELS, FileItem, type FileItemLabels, type FileUploadItem } from "./file-item";

// Figma File Upload (composition): a label (title-small), the dropzone and the file list (gap 8).
// Dropzone (tablet and up): dashed 1px border-strong, radius 12, padding 24 · 32, gap 8, a 32px
// upload glyph, title (title-small), hint (body-small, text-tertiary) and a Browse button; the whole
// area is a pointer target. Hover and keyboard focus: border-accent. Drag over: surface-accent-
// subtle + border-accent. Error: border-error, the reason in place of the hint. Disabled:
// border-disabled and a disabled Browse (Figma draws Default, Drag over and Error only). Mobile: the compact dropzone, a dashed button that
// opens the picker (Figma: drag & drop is replaced by a button). The owner validates
// (validateFiles), uploads and passes the items back in `files`; status changes are announced.

export interface FileUploadLabels extends FileItemLabels {
  title: string;
  dropActive: string;
  browse: string;
  compact: string;
  /** Announced status per file. */
  status: (file: FileUploadItem) => string;
}

export const FILE_UPLOAD_LABELS: FileUploadLabels = {
  ...FILE_ITEM_LABELS,
  title: "Drag & drop files or browse",
  dropActive: "Drop files to upload",
  browse: "Browse files",
  compact: "Upload files",
  status: (file) =>
    file.status === "uploading"
      ? `${file.name}: uploading`
      : file.status === "uploaded"
        ? `${file.name}: uploaded`
        : `${file.name}: ${file.error ?? "failed"}`,
};

export interface FileUploadProps {
  /** Visible label of the control, e.g. "Add photos (optional)". */
  label: string;
  /** Accepted types, max size and count, stated up front (Figma Do). */
  hint: string;
  /** The input's `accept`, e.g. "image/jpeg,image/png,.heic". */
  accept?: string;
  multiple?: boolean;
  /** Dropzone error (wrong type, too large, too many): replaces the hint. */
  error?: string;
  disabled?: boolean;
  /** Picked or dropped files, before any validation. */
  onFilesSelected: (files: File[]) => void;
  files?: readonly FileUploadItem[];
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Shows Retry on failed files. */
  onRetry?: (id: string) => void;
  locale?: string;
  labels?: FileUploadLabels;
  className?: string;
}

export function FileUpload({
  label,
  hint,
  accept,
  multiple = true,
  error,
  disabled = false,
  onFilesSelected,
  files = [],
  onCancel,
  onRemove,
  onRetry,
  locale,
  labels = FILE_UPLOAD_LABELS,
  className,
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragDepth, setDragDepth] = useState(0);
  const dragging = dragDepth > 0 && !disabled;
  const browse = () => inputRef.current?.click();

  function onDrag(event: DragEvent<HTMLDivElement>, delta: number) {
    if (disabled || !event.dataTransfer.types.includes("Files")) return;
    event.preventDefault();
    setDragDepth((depth) => Math.max(0, depth + delta));
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragDepth(0);
    if (disabled) return;
    const dropped = [...event.dataTransfer.files];
    if (dropped.length) onFilesSelected(multiple ? dropped : dropped.slice(0, 1));
  }

  return (
    <div
      role="group"
      aria-labelledby={`${id}-label`}
      className={cn("flex flex-col gap-12", className)}
    >
      <p id={`${id}-label`} className="text-title-sm text-text-primary">
        {label}
      </p>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          const picked = [...(event.target.files ?? [])];
          event.target.value = "";
          if (picked.length) onFilesSelected(picked);
        }}
      />

      {/* Compact dropzone (mobile): a button, no drag & drop. */}
      <button
        type="button"
        onClick={browse}
        disabled={disabled}
        aria-describedby={`${id}-hint`}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-8 rounded-12 border border-dashed p-16 tablet:hidden",
          "text-title-sm text-text-accent disabled:cursor-not-allowed disabled:text-text-disabled",
          error ? "border-border-error" : "border-border-strong",
        )}
      >
        <Icon name="upload" tone="current" />
        {labels.compact}
      </button>

      {/* Dropzone (tablet and up). The area is a pointer target; keyboard users use Browse. */}
      <div
        onDragEnter={(event) => onDrag(event, 1)}
        onDragOver={(event) => onDrag(event, 0)}
        onDragLeave={(event) => onDrag(event, -1)}
        onDrop={onDrop}
        onClick={(event) => {
          if (!disabled && !(event.target as HTMLElement).closest("button")) browse();
        }}
        className={cn(
          "hidden flex-col items-center gap-8 rounded-12 border border-dashed px-24 py-32 text-center tablet:flex",
          disabled
            ? "cursor-not-allowed border-border-disabled bg-surface-primary"
            : dragging
              ? "cursor-copy border-border-accent bg-surface-accent-subtle"
              : [
                  "cursor-pointer bg-surface-primary",
                  // Hover and keyboard focus (on Browse) light up the whole zone.
                  "hover:border-border-accent has-focus-visible:border-border-accent",
                  error ? "border-border-error" : "border-border-strong",
                ],
        )}
      >
        <Icon
          name="upload"
          size="32"
          tone={disabled ? "disabled" : error && !dragging ? "error" : "accent"}
        />
        <p className="text-title-sm text-text-primary">
          {dragging ? labels.dropActive : labels.title}
        </p>
        <p
          id={`${id}-hint`}
          className={cn("text-body-sm", error ? "text-text-error" : "text-text-tertiary")}
        >
          {error ?? hint}
        </p>
        {!dragging && (
          <Button
            variant="outline"
            onClick={browse}
            disabled={disabled}
            aria-describedby={`${id}-hint`}
          >
            {labels.browse}
          </Button>
        )}
      </div>

      {/* Mobile shows the hint / error under the compact button. */}
      <p
        aria-hidden
        className={cn(
          "text-body-sm tablet:hidden",
          error ? "text-text-error" : "text-text-tertiary",
        )}
      >
        {error ?? hint}
      </p>

      {files.length > 0 && (
        <ul className="flex flex-col gap-8">
          {files.map((file) => (
            <li key={file.id}>
              <FileItem
                file={file}
                onCancel={onCancel}
                onRemove={onRemove}
                onRetry={onRetry}
                locale={locale}
                labels={labels}
              />
            </li>
          ))}
        </ul>
      )}
      <ul aria-live="polite" className="sr-only">
        {files.map((file) => (
          <li key={file.id}>{labels.status(file)}</li>
        ))}
      </ul>
    </div>
  );
}
