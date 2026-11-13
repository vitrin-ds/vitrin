import type { SessionErrorCode } from "@/lib/api/types/errors";

/** A refused call. `code` is the same set the UI already maps to copy (SessionErrorCode). */
export class CommerceError extends Error {
  readonly code: SessionErrorCode;
  /** The limit that was hit, e.g. the most of a line that can be ordered. */
  readonly max?: number;

  /** `detail` replaces the default message, for a refusal a developer has to act on. */
  constructor(code: SessionErrorCode, max?: number, detail?: string) {
    super(detail ?? `Commerce call refused: ${code}`);
    this.name = "CommerceError";
    this.code = code;
    this.max = max;
  }
}
