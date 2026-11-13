import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "@/test/axe";
import {
  Toast,
  TOAST_DEFAULTS,
  TOAST_DURATION_MS,
  TOAST_ICONS,
  ToastProvider,
  useToast,
  type ToastProps,
} from "./toast";

function Trigger(props: Omit<ToastProps, "onDismiss">) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast(props)}>
      Show
    </button>
  );
}

describe("Toast", () => {
  it("renders body, icon and an inline action (Single Line)", async () => {
    const onUndo = vi.fn();
    const { container } = render(
      <Toast action={{ label: "Undo", onClick: onUndo }}>Removed from basket</Toast>,
    );
    expect(screen.getByText("Removed from basket")).toHaveClass("text-body-md");
    await userEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalled();
    expect(container.firstElementChild!.className).toMatch(/--th-callout-neutral-solid-bg/);
    await expectNoAxeViolations(container);
  });

  it("defaults to the dark Neutral tone with shadow-lg and a close button", async () => {
    const onDismiss = vi.fn();
    const { container } = render(<Toast onDismiss={onDismiss}>Saved</Toast>);
    expect(TOAST_DEFAULTS).toEqual({ usage: "single", tone: "neutral", showClose: true });
    expect(container.firstElementChild).toHaveClass("shadow-lg");
    const close = screen.getByRole("button", { name: "Dismiss notification" });
    expect(close.querySelector("[data-icon]")).toHaveAttribute("data-icon", "close_small");
    await userEvent.click(close);
    expect(onDismiss).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("uses the soft callout colours and the tone glyph for the other tones", async () => {
    expect(TOAST_ICONS).toEqual({
      neutral: "info",
      success: "check_circle",
      error: "error",
      warning: "warning",
      info: "info",
    });
    const { container } = render(
      <Toast tone="success" onDismiss={() => undefined}>
        Order placed
      </Toast>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toMatch(/--th-callout-success-soft-bg/);
    expect(root).toHaveClass("inset-ring");
    expect(container.querySelector("[data-icon]")).toHaveAttribute("data-icon", "check_circle");
    await expectNoAxeViolations(container);
  });

  it("hides the close button with showClose={false}", () => {
    render(
      <Toast showClose={false} onDismiss={() => undefined}>
        Copied
      </Toast>,
    );
    expect(screen.queryByRole("button", { name: "Dismiss notification" })).toBeNull();
  });

  it("puts the action on its own row in Multiple Line", () => {
    render(
      <Toast usage="multiple" action={{ label: "View basket", onClick: () => undefined }}>
        Added to basket
      </Toast>,
    );
    expect(screen.getByRole("button", { name: "View basket" }).parentElement).toHaveClass(
      "justify-end",
    );
  });
});

describe("ToastProvider", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("announces one toast at a time in a polite region and hides it after the duration", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger>Saved to wishlist</Trigger>
      </ToastProvider>,
    );
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(screen.getAllByText("Saved to wishlist")).toHaveLength(1);
    act(() => vi.advanceTimersByTime(TOAST_DURATION_MS));
    expect(screen.queryByText("Saved to wishlist")).toBeNull();
  });

  it("closes after its action runs", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onUndo = vi.fn();
    render(
      <ToastProvider>
        <Trigger action={{ label: "Undo", onClick: onUndo }}>Removed</Trigger>
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalled();
    expect(screen.queryByText("Removed")).toBeNull();
  });

  it("closes from the close button", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <ToastProvider>
        <Trigger>Saved</Trigger>
      </ToastProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Show" }));
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Saved")).toBeNull();
  });

  it("throws outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Trigger>x</Trigger>)).toThrow(/ToastProvider/);
  });

  it("can sit above the Bottom Navigation below desktop", () => {
    render(
      <ToastProvider inset="bottom-navigation">
        <Trigger>x</Trigger>
      </ToastProvider>,
    );
    expect(screen.getByRole("status")).toHaveClass("bottom-76", "desktop:bottom-0");
  });
});
