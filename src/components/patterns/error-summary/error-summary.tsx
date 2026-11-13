"use client";

import type { MouseEvent } from "react";
import { Alert } from "@/components/ui/alert/alert";
import { Link } from "@/components/ui/link/link";

// A form's one error summary (checkout, sign-in, registration, Forgot password): a Negative Card
// Alert at the top of the form that the page focuses after a failed submit (tabIndex -1), so it
// is read out first. Each field error links to its field and moves focus there. Without field
// errors (e.g. "the e-mail or password is incorrect") it is the title alone. Links are Neutral:
// Link error (text-error) on the Negative alert fill is 3.95:1, below AA.

export interface FieldError {
  /** Id of the field the message is about. */
  id: string;
  /** The field's label, before the message. */
  label: string;
  message: string;
}

export interface ErrorSummaryProps {
  /** The page focuses it by id after a failed submit. */
  id: string;
  title: string;
  errors?: readonly FieldError[];
  className?: string;
}

function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  target?.focus();
  target?.scrollIntoView({ block: "center" });
}

export function ErrorSummary({ id, title, errors = [], className }: ErrorSummaryProps) {
  return (
    <Alert id={id} tabIndex={-1} usage="negative" width="card" title={title} className={className}>
      {errors.length > 0 && (
        <ul className="flex flex-col gap-4">
          {errors.map((error) => (
            <li key={error.id}>
              <Link
                href={`#${error.id}`}
                size="inline"
                variant="neutral"
                onClick={(event) => jumpTo(event, error.id)}
              >
                {error.label}: {error.message}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Alert>
  );
}
