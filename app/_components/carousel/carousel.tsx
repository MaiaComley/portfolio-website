"use client";

import classNames from "classnames";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type ProjectMediaItem = {
  type: "image" | "video";
  src: string;
  alt: string;
  poster?: string;
  thumbnailSrc?: string;
};

type ProjectCarouselProps = {
  media: ProjectMediaItem[];
};

function clampIndex(index: number, length: number) {
  return Math.min(Math.max(index, 0), length - 1);
}

export const ProjectCarousel = ({ media }: ProjectCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (
    index: number,
    behavior: ScrollBehavior = "smooth",
  ) => {
    const track = trackRef.current;

    if (!track || media.length === 0) {
      return;
    }

    const nextIndex = clampIndex(index, media.length);

    track.scrollTo({
      left: track.clientWidth * nextIndex,
      behavior,
    });
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    const track = trackRef.current;

    if (!track || media.length === 0) {
      return;
    }

    let frame = 0;

    const syncActiveIndex = () => {
      frame = 0;
      const nextIndex = clampIndex(
        Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)),
        media.length,
      );

      setActiveIndex((currentIndex) =>
        currentIndex === nextIndex ? currentIndex : nextIndex,
      );
    };

    const handleScroll = () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }

      frame = requestAnimationFrame(syncActiveIndex);
    };

    const handleResize = () => {
      track.scrollTo({
        left: track.clientWidth * activeIndex,
        behavior: "auto",
      });
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    syncActiveIndex();

    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      if (frame) {
        cancelAnimationFrame(frame);
      }
    };
  }, [activeIndex, media.length]);

  if (media.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl rounded-2xl mx-auto flex flex-col gap-4 md:gap-6">
      <div className="relative">
        <div
          ref={trackRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
        >
          {media.map((item, index) => (
            <div
              key={`${item.type}-${item.src}-${index}`}
              className="min-w-full snap-center snap-always"
            >
              <div className="relative flex h-[70vh] min-h-80 max-h-180 items-center justify-center overflow-hidden">
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 80vw"
                    className="object-contain"
                    priority={index === 0}
                  />
                ) : (
                  <video
                    className="h-full w-full object-contain"
                    controls
                    playsInline
                    preload="metadata"
                    poster={item.poster}
                  >
                    <source src={item.src} />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          ))}
        </div>

        {media.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Show previous media"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              className="max-md:hidden absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-accent p-3 text-accent-contrast cursor-pointer transition-all hover:bg-accent-contrast hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 md:left-4"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Show next media"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === media.length - 1}
              className="max-md:hidden absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-accent p-3 text-accent-contrast cursor-pointer transition-all hover:bg-accent-contrast hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 md:right-4"
            >
              <ChevronRight />
            </button>
          </>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <div className="flex justify-center min-w-max gap-3 px-1">
          {media.map((item, index) => {
            const thumbnailSrc = item.thumbnailSrc ?? item.poster ?? item.src;
            const isActive = index === activeIndex;

            return (
              <button
                key={`thumbnail-${item.type}-${item.src}-${index}`}
                type="button"
                aria-label={`Show media ${index + 1}`}
                onClick={() => scrollToIndex(index)}
                className={classNames(
                  "relative cursor-pointer flex h-16 aspect-square shrink-0 items-center justify-center overflow-hidden transition-all",
                  {
                    "opacity-50": !isActive,
                  },
                )}
              >
                {item.type === "image" || item.poster || item.thumbnailSrc ? (
                  <Image
                    src={thumbnailSrc}
                    alt={item.alt}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground">
                    <Play size={14} />
                    Video
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
