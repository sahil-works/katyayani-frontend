"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";

export type AnimateName =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "zoomIn"
  | "slideInUp";

type AnimateOnViewProps = {
  children: ReactNode;
  animation?: AnimateName;
  /** Delay before the animation starts (ms). */
  delay?: number;
  /** Animation duration in seconds. */
  duration?: number;
  className?: string;
  as?: "div" | "section" | "article" | "span" | "header" | "footer";
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
} & Omit<HTMLAttributes<HTMLElement>, "children" | "className" | "style">;

export default function AnimateOnView({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 0.75,
  className = "",
  as: Tag = "div",
  once = true,
  threshold = 0.12,
  rootMargin = "0px 0px -48px 0px",
  ...rest
}: AnimateOnViewProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  const style = {
    "--animate-duration": `${duration}s`,
    "--animate-delay": `${delay}ms`,
  } as CSSProperties;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={[
        className,
        visible
          ? `animate__animated animate__${animation}`
          : "animate-on-view-pending",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
