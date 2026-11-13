"use client";

import { DIALOG_LABELS } from "@/components/ui/dialog/dialog";
import { Alert } from "@/components/ui/alert/alert";
import { Button } from "@/components/ui/button/button";
import { BaseModal } from "@/components/base/modal/base-modal";
import { CloseButton } from "@/components/base/modal/close-button";
import { LinkButton } from "@/components/ui/link/link";
import { Text } from "@/components/ui/text/text";
import type { Money } from "@/lib/api/types/catalog";
import { formatMoney } from "@/lib/format/money";
import { CHECKOUT_LABELS } from "./checkout-labels";

// Figma WD/WT/WM.09.03.04 Checkout — 3D Secure (31395:13539): a 560 modal on BaseModal "Verify your
// payment" with the subtitle, the amount sentence, the bank's verification frame, the keep-open
// note and "Cancel and return to checkout". The real frame is the bank's page; the mock shows a
// test bank in its place (Alert, neutral) with Approve / Fail, so both outcomes can be tried.
// Esc, the close button and Cancel all cancel the payment.

const L = CHECKOUT_LABELS.threeDSecure;

export interface ThreeDSecureDialogProps {
  open: boolean;
  amount: Money | null;
  busy: boolean;
  onApprove: () => void;
  onFail: () => void;
  onCancel: () => void;
}

export function ThreeDSecureDialog({
  open,
  amount,
  busy,
  onApprove,
  onFail,
  onCancel,
}: ThreeDSecureDialogProps) {
  return (
    <BaseModal
      open={open}
      onClose={onCancel}
      labelledBy="three-d-secure-title three-d-secure-subtitle"
      motion="dialog"
      layoutClassName="items-center justify-center p-16"
      className="max-h-full w-full max-w-560 gap-16 overflow-y-auto rounded-overlay p-24 shadow-md"
    >
      <div className="flex items-center gap-8">
        <h2 id="three-d-secure-title" className="min-w-0 flex-1 text-title-md text-text-primary">
          {L.title}
        </h2>
        <CloseButton label={DIALOG_LABELS.close} onClick={onCancel} />
      </div>
      <div className="flex flex-col gap-16">
        <Text id="three-d-secure-subtitle" variant="body-sm" tone="secondary">
          {L.subtitle}
        </Text>
        <Text variant="body-md">{L.body(amount ? formatMoney(amount) : "")}</Text>
        <Alert usage="neutral" width="card" icon="lock" title={L.bankTitle}>
          <span className="flex flex-col gap-12">
            <span>{L.bankBody}</span>
            <span className="flex flex-wrap gap-8">
              <Button size="sm" onClick={onApprove} disabled={busy}>
                {L.approve}
              </Button>
              <Button size="sm" variant="outline-error" onClick={onFail} disabled={busy}>
                {L.fail}
              </Button>
            </span>
          </span>
        </Alert>
        <Text variant="body-sm" tone="secondary">
          {L.keepOpen}
        </Text>
        <div className="flex">
          <LinkButton onClick={onCancel}>{L.cancel}</LinkButton>
        </div>
      </div>
    </BaseModal>
  );
}
