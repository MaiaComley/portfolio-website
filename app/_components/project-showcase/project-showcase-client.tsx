"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import type { Project } from "@/lib/projects";
import { ProjectCarousel, ProjectMediaItem } from "../carousel";

export interface ProjectShowcaseClientProps {
  projects: Project[];
}

export const ProjectShowcaseClient = ({
  projects,
}: ProjectShowcaseClientProps) => {
  const [projectId, setProjectId] = useQueryState("project", parseAsString);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setProjectId]);

  if (!projectId) {
    return null;
  }

  const project = projects.find(({ slug }) => slug === projectId);

  if (!project) {
    return null;
  }

  const media: ProjectMediaItem[] = project.galleryImages.map((image) => ({
    type: "image",
    src: image.src,
    alt: image.alt,
  }));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/75">
      <button
        type="button"
        aria-label="Close gallery"
        className="absolute top-8 right-8 p-4 text-accent-contrast bg-accent rounded-full cursor-pointer hover:bg-accent-contrast hover:text-accent transition-all"
        onClick={() => setProjectId(null)}
      >
        <X />
      </button>

      <div className="flex min-h-full items-center">
        <ProjectCarousel media={media} />
      </div>
    </div>
  );
};
