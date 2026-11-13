// Client-side checks before upload (Figma Do: "Validate on the client before uploading").

export interface FileRules {
  /** The input's `accept` value, e.g. "image/jpeg,image/png,.heic" or "image/*". */
  accept?: string;
  /** Bytes. */
  maxSize?: number;
  /** Total files allowed, counting the ones already in the list. */
  maxFiles?: number;
}

export type FileRejection = "type" | "size" | "count";

export interface FileCheck {
  accepted: File[];
  rejected: { file: File; reason: FileRejection }[];
}

/** Whether `file` matches one entry of an `accept` list (MIME type, `type/*` or `.ext`). */
export function matchesAccept(file: File, accept: string): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry.startsWith(".")) return name.endsWith(entry);
      if (entry.endsWith("/*")) return type.startsWith(entry.slice(0, -1));
      return type === entry;
    });
}

/** Splits picked or dropped files into accepted and rejected (with the first failed rule). */
export function validateFiles(
  files: readonly File[],
  { accept, maxSize, maxFiles }: FileRules,
  existingCount = 0,
): FileCheck {
  const result: FileCheck = { accepted: [], rejected: [] };
  for (const file of files) {
    if (accept && !matchesAccept(file, accept)) {
      result.rejected.push({ file, reason: "type" });
    } else if (maxSize !== undefined && file.size > maxSize) {
      result.rejected.push({ file, reason: "size" });
    } else if (maxFiles !== undefined && existingCount + result.accepted.length >= maxFiles) {
      result.rejected.push({ file, reason: "count" });
    } else {
      result.accepted.push(file);
    }
  }
  return result;
}

/** "2.4 MB", "820 kB" with Intl.NumberFormat: units are never concatenated by hand. */
export function formatFileSize(bytes: number, locale = "en"): string {
  const [value, unit] =
    bytes >= 1_000_000 ? [bytes / 1_000_000, "megabyte"] : [bytes / 1_000, "kilobyte"];
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
