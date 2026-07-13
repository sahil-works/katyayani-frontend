"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

const ZOOM_SCALE = 2.25;

type ProductImageZoomProps = {
  children: ReactNode;
  className?: string;
};

function useCanHoverZoom() {
  const [canHoverZoom, setCanHoverZoom] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHoverZoom(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return canHoverZoom;
}

export function ProductImageZoom({ children, className }: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canHoverZoom = useCanHoverZoom();
  const [isZooming, setIsZooming] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("center center");

  const updateTransformOrigin = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.min(
      100,
      Math.max(0, ((event.clientX - rect.left) / rect.width) * 100),
    );
    const y = Math.min(
      100,
      Math.max(0, ((event.clientY - rect.top) / rect.height) * 100),
    );

    setTransformOrigin(`${x}% ${y}%`);
  }, []);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!canHoverZoom) return;
      setIsZooming(true);
      updateTransformOrigin(event);
    },
    [canHoverZoom, updateTransformOrigin],
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!canHoverZoom || !isZooming) return;
      updateTransformOrigin(event);
    },
    [canHoverZoom, isZooming, updateTransformOrigin],
  );

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
    setTransformOrigin("center center");
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${
        canHoverZoom ? "cursor-zoom-in" : ""
      } ${className ?? ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          transform: isZooming ? `scale(${ZOOM_SCALE})` : undefined,
          transformOrigin,
        }}
      >
        {children}
      </div>
    </div>
  );
}
