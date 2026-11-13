import NextImage from "next/image";
import { cn } from "@/lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { Progress } from "../progress/progress";
import { formatFileSize } from "./validate-files";

// Figma File Upload › File Item (Uploading · Uploaded · Error): padding 12, gap 12, radius 8,
// surface-primary with a 1px border-default (border-error on error); a 40px thumb (surface-accent-
// subtle, radius 4, the preview when there is one), name (title-small) + meta (body-small), a 2px
// progress bar while uploading, and 20px trailing icons: cancel while uploading; success or error
// glyph (+ Retry on errors) + remove afterwards. Icon buttons are icon-primary (controls need 3:1)
// and grow to a 44px hit area.

export type FileUploadStatus = "uploading" | "uploaded" | "error";

export interface FileUploadItem {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  status: FileUploadStatus;
  /** 0–100 while uploading. */
  progress?: number;
  /** Why it failed (Figma Don't: "Don't hide the error reason"). */
  error?: string;
  /** Image preview (e.g. an object URL). */
  previewUrl?: string;
}

export interface FileItemLabels {
  retry: string;
  retryFor: (name: string) => string;
  cancel: (name: string) => string;
  remove: (name: string) => string;
  progress: (name: string) => string;
}

export const FILE_ITEM_LABELS: FileItemLabels = {
  retry: "Retry",
  retryFor: (name) => `Retry upload of ${name}`,
  cancel: (name) => `Cancel upload of ${name}`,
  remove: (name) => `Remove ${name}`,
  progress: (name) => `Uploading ${name}`,
};

export interface FileItemProps {
  file: FileUploadItem;
  onCancel?: (id: string) => void;
  onRemove?: (id: string) => void;
  /** Shows a Retry button on failed files (Figma Do: "Let users remove or retry each file"). */
  onRetry?: (id: string) => void;
  locale?: string;
  labels?: FileItemLabels;
}

export function FileItem({
  file,
  onCancel,
  onRemove,
  onRetry,
  locale = "en",
  labels = FILE_ITEM_LABELS,
}: FileItemProps) {
  const { id, name, size, status, progress = 0, error, previewUrl } = file;
  const percent = new Intl.NumberFormat(locale, { style: "percent" }).format(progress / 100);
  const meta =
    status === "error"
      ? error
      : status === "uploading"
        ? `${formatFileSize(size, locale)} · ${percent}`
        : formatFileSize(size, locale);

  return (
    <div
      className={cn(
        "flex items-center gap-12 rounded-card bg-surface-primary p-12 inset-ring",
        status === "error" ? "inset-ring-border-error" : "inset-ring-border-default",
      )}
    >
      <span className="relative size-40 shrink-0 overflow-hidden rounded-4 bg-surface-accent-subtle">
        {previewUrl && (
          <NextImage
            src={previewUrl}
            alt=""
            width={40}
            height={40}
            unoptimized
            className="size-full object-cover"
          />
        )}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="truncate text-title-sm text-text-primary">{name}</p>
        <p
          className={cn(
            "text-body-sm tabular-nums",
            status === "error" ? "text-text-error" : "text-text-tertiary",
          )}
        >
          {meta}
        </p>
        {status === "uploading" && (
          <Progress value={progress} label={labels.progress(name)} valueText={percent} />
        )}
      </div>
      <div className="flex shrink-0 items-center gap-12">
        {status === "uploaded" && <Icon name="check_circle" tone="success" />}
        {status === "error" && <Icon name="error" tone="error" />}
        {status === "error" && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={labels.retryFor(name)}
            onClick={() => onRetry(id)}
          >
            {labels.retry}
          </Button>
        )}
        {status === "uploading"
          ? onCancel && (
              <IconButton
                icon="close_small"
                label={labels.cancel(name)}
                onClick={() => onCancel(id)}
              />
            )
          : onRemove && (
              <IconButton icon="delete" label={labels.remove(name)} onClick={() => onRemove(id)} />
            )}
      </div>
    </div>
  );
}

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: "close_small" | "delete";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="relative flex cursor-pointer rounded-4 text-icon-primary before:absolute before:-inset-12 hover:text-interactive-hover"
    >
      <Icon name={icon} tone="current" />
    </button>
  );
}
