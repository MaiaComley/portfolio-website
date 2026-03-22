import { Navbar } from "./_components/navbar";
import { ProjectShowcase } from "./_components/project-showcase";
import { SectionHero } from "./_sections/section-hero";
import { SectionProject } from "./_sections/section-project";
import { loadProjects } from "@/lib/projects";

export default function Home() {
  const projects = loadProjects();

  return (
    <>
      <Navbar
        name="Maia Comley"
        tagline="Creative Marketer"
        email="comleymaia@gmail.com"
      />
      <SectionHero
        name="Maia Comley"
        description="Creative marketer blending strategy, content & design."
        email="comleymaia@gmail.com"
      />

      <div className="flex flex-col gap-8 md:gap-24 pb-16">
        {projects.map((project, index) => (
          <SectionProject
            key={project.slug}
            project={project}
            flip={index % 2 === 1}
          />
        ))}
      </div>

      <ProjectShowcase projects={projects} />
    </>
  );
}
