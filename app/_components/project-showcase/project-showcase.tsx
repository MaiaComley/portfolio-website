import { Suspense } from "react";
import type { Project } from "@/lib/projects";
import { ProjectShowcaseClient } from "./project-showcase-client";

export interface ProjectShowcaseProps {
  projects: Project[];
}

export const ProjectShowcase = ({ projects }: ProjectShowcaseProps) => (
  <Suspense fallback={null}>
    <ProjectShowcaseClient projects={projects} />
  </Suspense>
);
