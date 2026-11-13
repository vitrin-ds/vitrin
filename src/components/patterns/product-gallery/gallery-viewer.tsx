"use client";

import { useId, type KeyboardEvent } from "react";
import { BaseModal } from "@/components/base/modal/base-modal";
import { CloseButton } from "@/components/base/modal/close-button";
import { ToolbarButton } from "@/components/base/modal/toolbar-button";
import { Image } from "@/components/ui/image/image";
import type { ImageAsset } from "@/lib/api/types/catalog";

// The gallery's zoom (Figma Product Gallery table: "Product Image · 1:1, zoom on click" and the
// zoom_in action): a full-screen modal on BaseModal (Dialog is the 360px confirmation panel). The
// image is shown large on surface-raised, with prev / next and the position. Arrow keys step
// through the images; Escape, the close button and the scrim close it (useModal), and focus
// returns to the control that opened it.

export interface GalleryViewerLabels {
  viewer: string;
  close: string;
  previous: string;
  next: string;
  position: (current: number, total: number) => string;
}

export interface GalleryViewerProps {
  open: boolean;
  onClose: () => void;
  images: readonly ImageAsset[];
  index: number;
  onIndexChange: (index: number) => void;
  labels: GalleryViewerLabels;
}

export function GalleryViewer({
  open,
  onClose,
  images,
  index,
  onIndexChange,
  labels,
}: GalleryViewerProps) {
  const id = useId();
  const total = images.length;
  const image = images[index];
  const step = (delta: number) => onIndexChange((index + delta + total) % total);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (delta === undefined || total < 2) return;
    event.preventDefault();
    step(delta);
  }

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      label={labels.viewer}
      motion="dialog"
      layoutClassName="items-stretch justify-stretch"
      className="size-full"
    >
      {/* Keyboard handler on the content: the panel itself is BaseModal's. */}
      <div className="flex min-h-0 flex-1 flex-col" onKeyDown={onKeyDown}>
        <div className="flex items-center justify-between gap-8 px-16 py-12 desktop:px-40">
          <p id={`${id}-position`} aria-live="polite" className="text-label-lg text-text-primary">
            {labels.position(index + 1, total)}
          </p>
          <CloseButton label={labels.close} onClick={onClose} />
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center gap-16 overflow-y-auto px-16 pb-16 desktop:px-40">
          {total > 1 && (
            <ToolbarButton
              icon="keyboard_arrow_left"
              label={labels.previous}
              onClick={() => step(-1)}
              className="hidden tablet:flex"
            />
          )}
          {image && (
            <div className="w-full max-w-904">
              <Image
                key={image.src + index}
                src={image.src}
                alt={image.alt}
                ratio="1/1"
                fit="contain"
                sizes="(min-width: 1024px) 904px, 100vw"
                className="bg-surface-primary"
              />
            </div>
          )}
          {total > 1 && (
            <ToolbarButton
              icon="keyboard_arrow_right"
              label={labels.next}
              onClick={() => step(1)}
              className="hidden tablet:flex"
            />
          )}
        </div>
        {total > 1 && (
          <div className="flex justify-center gap-16 pb-16 tablet:hidden">
            <ToolbarButton
              icon="keyboard_arrow_left"
              label={labels.previous}
              onClick={() => step(-1)}
            />
            <ToolbarButton
              icon="keyboard_arrow_right"
              label={labels.next}
              onClick={() => step(1)}
            />
          </div>
        )}
      </div>
    </BaseModal>
  );
}
