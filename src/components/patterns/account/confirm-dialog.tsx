"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog/dialog";

// A destructive confirmation (Dialog Usage=Destructive, sm): "Delete this address?". Confirm
// runs the action and closes; Cancel, Escape and the scrim close without it. The Dialog returns
// focus to the control that opened it.

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => Promise<unknown>;
  onClose: () => void;
  labels?: ConfirmDialogLabels;
}

export interface ConfirmDialogLabels {
  /** The confirm button while the action runs. */
  saving: string;
  cancel: string;
}

export const CONFIRM_DIALOG_LABELS: ConfirmDialogLabels = { saving: "Saving…", cancel: "Cancel" };

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
  labels = CONFIRM_DIALOG_LABELS,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      usage="destructive"
      title={title}
      primaryAction={{
        label: busy ? labels.saving : confirmLabel,
        onClick: () => {
          if (busy) return;
          setBusy(true);
          void onConfirm().finally(() => {
            setBusy(false);
            onClose();
          });
        },
      }}
      secondaryAction={{ label: labels.cancel, onClick: onClose }}
    >
      {body}
    </Dialog>
  );
}
