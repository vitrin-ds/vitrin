import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Checkbox, type CheckboxProps } from "../checkbox/checkbox";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { StatusDot, type StatusDotProps } from "../status-dot/status-dot";

// Figma `DataTable` (13.02 Step 3: Hydrate) of `Table Header` and `Table Cell`: a semantic
// <table> (tabular data stays a table) in a 1px border-default frame, radius 12, clipped.
// Header cells: surface-tertiary, padding 16 × 12, gap 10, title-small text-primary, scope="col".
// Body cells: surface-primary, padding 12 × 8 around an 8px-inset content box (Figma `.Base Table
// Cell` › Content: 36 tall, padding 8), label-large text-primary. Columns share the width
// equally (Figma fills). The caption is required for assistive technology and visually hidden
// unless `showCaption`. Narrow screens scroll the table sideways inside a focusable region
// instead of squeezing the columns.

export type DataTableAlignment = "left" | "center" | "right";

const JUSTIFY: Record<DataTableAlignment, string> = {
  left: "justify-start text-left",
  center: "justify-center text-center",
  right: "justify-end text-right",
};

/** Figma `Table Header`. A plain string is a left-aligned label. */
export interface DataTableColumn {
  /** Figma `Header Label Text`; always the column's accessible name. */
  label: string;
  /** Figma `Show Header Text=false`: the label stays for screen readers only. */
  hideLabel?: boolean;
  /** Figma `Alignment`. */
  align?: DataTableAlignment;
  /** Figma `Left Icon`. Decorative. */
  leftIcon?: IconName;
  /** Figma `Right Icon`, e.g. a sort indicator. Decorative. */
  rightIcon?: IconName;
}

/** Figma `Table Cell`. A slot shows when it is given; a plain string is a title only. */
export interface DataTableCell {
  /** Figma `Title Text`. */
  title?: string;
  /** Figma `Description Text`. */
  description?: string;
  /** Figma `Alignment`: match the column's. */
  align?: DataTableAlignment;
  /** Figma `Left Icon`. Decorative. */
  leftIcon?: IconName;
  /** Figma `Right Icon`. Decorative. */
  rightIcon?: IconName;
  /** Figma `Show Avatar`: an Avatar (size sm). */
  avatar?: ReactNode;
  /** Figma `Show Status`: a small Status Dot. */
  status?: Pick<StatusDotProps, "status" | "label">;
  /** Figma `Show Checkbox`: `label` names it; it is never shown. */
  checkbox?: Omit<CheckboxProps, "hideLabel">;
}

export interface DataTableProps {
  /** Accessible name and <caption> (visually hidden unless `showCaption`). */
  caption: string;
  showCaption?: boolean;
  columns: readonly (string | DataTableColumn)[];
  /** One array of cells per row, in column order. */
  rows: readonly (readonly (string | DataTableCell)[])[];
  /** The first cell of each row heads its row (scope="row"). */
  rowHeaders?: boolean;
  className?: string;
}

export const DATA_TABLE_DEFAULTS = { showCaption: false, rowHeaders: false } as const;

export function DataTable({
  caption,
  showCaption = DATA_TABLE_DEFAULTS.showCaption,
  columns,
  rows,
  rowHeaders = DATA_TABLE_DEFAULTS.rowHeaders,
  className,
}: DataTableProps) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className={cn("overflow-x-auto rounded-12 border border-border-default", className)}
    >
      <table className="w-full min-w-480 table-fixed border-collapse text-left">
        <caption
          className={showCaption ? "p-12 text-left text-label-md text-text-secondary" : "sr-only"}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={typeof column === "string" ? column : column.label}
                scope="col"
                className="bg-surface-tertiary px-12 py-16 text-title-sm text-text-primary"
              >
                {typeof column === "string" ? column : <HeaderContent column={column} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => {
                const Cell = rowHeaders && c === 0 ? "th" : "td";
                return (
                  <Cell
                    key={c}
                    {...(Cell === "th" ? { scope: "row" } : {})}
                    className={cn(
                      "bg-surface-primary px-16 align-middle text-label-lg text-text-primary",
                      typeof cell === "string" ? "py-20" : "py-12",
                    )}
                  >
                    {typeof cell === "string" ? cell : <CellContent cell={cell} />}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeaderContent({ column }: { column: DataTableColumn }) {
  const { label, hideLabel = false, align = "left", leftIcon, rightIcon } = column;
  return (
    <span className={cn("flex items-center gap-10", JUSTIFY[align])}>
      {leftIcon && <Icon name={leftIcon} />}
      <span className={cn("min-w-0", hideLabel && "sr-only")}>{label}</span>
      {rightIcon && <Icon name={rightIcon} />}
    </span>
  );
}

function CellContent({ cell }: { cell: DataTableCell }) {
  const {
    title,
    description,
    align = "left",
    leftIcon,
    rightIcon,
    avatar,
    status,
    checkbox,
  } = cell;
  return (
    <span className={cn("flex min-h-36 items-center gap-8", JUSTIFY[align])}>
      {checkbox && <Checkbox {...checkbox} hideLabel />}
      {leftIcon && <Icon name={leftIcon} />}
      {status && <StatusDot size="sm" status={status.status} label={status.label} />}
      {avatar}
      {(title || description) && (
        <span className="flex min-w-0 flex-col">
          {title}
          {description && <span className="text-label-sm text-text-tertiary">{description}</span>}
        </span>
      )}
      {rightIcon && <Icon name={rightIcon} />}
    </span>
  );
}
