import { cva, type VariantProps } from "class-variance-authority";
import NextImage from "next/image";
import { cn } from "@/lib/cn";
import { Icon } from "../icon/icon";
import type { IconName } from "../icon/icon-names";
import { StatusDot, type StatusDotProps } from "../status-dot/status-dot";

// Figma `Avatar` (Style × Size) on `.Base Avatar`: a circle with a 2px border-neutral ring
// (drawn on top, so it also frames photos), Photo · Letter (label-large initials, text-on-accent
// on surface-accent-strong) · Icon (weight 200, icon-on-accent). The optional status dot sits flush
// at the bottom-right corner and is sized with the avatar: Small 6 · Default 8 · Large 12 · X-Large
// 16; its label is announced after the avatar's name. Not interactive: wrap it in a link or
// button when it should act.

export const avatarVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center rounded-full",
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-full",
    "after:inset-ring-2 after:inset-ring-border-neutral",
  ],
  {
    variants: {
      size: { sm: "size-36", md: "size-48", lg: "size-60", xl: "size-88" },
      variant: {
        photo: "bg-surface-skeleton",
        letter: "bg-surface-accent-strong text-label-lg text-text-on-accent",
        icon: "bg-surface-accent-strong text-icon-on-accent",
      },
    },
  },
);

type AvatarSize = NonNullable<VariantProps<typeof avatarVariants>["size"]>;

const PIXELS: Record<AvatarSize, number> = { sm: 36, md: 48, lg: 60, xl: 88 };
const DOT_SIZE: Record<AvatarSize, NonNullable<StatusDotProps["size"]>> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export const AVATAR_DEFAULTS = { size: "md", icon: "upload" } as const;

interface AvatarBaseProps {
  /** Figma `Size`: Small 36 · Default 48 · Large 60 · X-Large 88. */
  size?: AvatarSize;
  /** Figma `Status` (Status Dot): presence. Its label is announced; don't rely on colour alone. */
  status?: { status: NonNullable<StatusDotProps["status"]>; label: string };
  className?: string;
}

export type AvatarProps = AvatarBaseProps &
  (
    | {
        /** Figma `Style=Photo`: a user-uploaded image. */
        variant: "photo";
        src: string;
        /** The person's name. */
        alt: string;
      }
    | {
        /** Figma `Style=Letter`: the fallback when there is no photo. */
        variant: "letter";
        /** One or two characters, e.g. "JD". */
        initials: string;
        /** The person's name, announced instead of the initials. */
        name: string;
      }
    | {
        /** Figma `Style=Icon`. */
        variant: "icon";
        /** Defaults to Figma's `upload`. Decorative. */
        icon?: IconName;
        /** What the avatar stands for, e.g. "Add profile photo". */
        label: string;
      }
  );

export function Avatar(props: AvatarProps) {
  const { size = AVATAR_DEFAULTS.size, status, className } = props;
  const classes = cn(avatarVariants({ size, variant: props.variant }), className);
  const dot = status && (
    <StatusDot
      status={status.status}
      size={DOT_SIZE[size]}
      label={status.label}
      className="absolute right-0 bottom-0 z-10"
    />
  );

  if (props.variant === "photo") {
    return (
      <span className={classes}>
        <NextImage
          src={props.src}
          alt={props.alt}
          width={PIXELS[size]}
          height={PIXELS[size]}
          className="size-full rounded-full object-cover"
        />
        {dot}
      </span>
    );
  }
  if (props.variant === "letter") {
    return (
      <span className={classes}>
        <span role="img" aria-label={props.name}>
          <span aria-hidden>{props.initials}</span>
        </span>
        {dot}
      </span>
    );
  }
  return (
    <span className={classes}>
      <Icon
        name={props.icon ?? AVATAR_DEFAULTS.icon}
        label={props.label}
        weight={200}
        fill={false}
        tone="current"
      />
      {dot}
    </span>
  );
}
