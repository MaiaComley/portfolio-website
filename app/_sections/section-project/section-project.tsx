import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/app/_components/section";
import type { Project, ProjectMedia } from "@/lib/projects";

export interface ProjectPreviewMediaProps {
  alt?: boolean;
  media: ProjectMedia;
}

export const ProjectPreviewMedia = ({
  media,
  alt,
}: ProjectPreviewMediaProps) => (
  <div
    className={classNames(
      "relative h-full overflow-hidden bg-accent-contrast aspect-1/2 rounded-2xl shadow-lg group-hover:shadow-xl shadow-background-shadow/20 transition-all",
      {
        "first:-rotate-3 first:scale-105 first:-translate-y-6 first:translate-x-4 group-hover:first:-rotate-6 group-hover:first:scale-110 group-hover:first:-translate-y-8 last:rotate-3 last:scale-120 max-md:last:-translate-x-8 max-md:last:-translate-y-4 group-hover:last:scale-125 group-hover:last:-translate-y-2 group-hover:last:rotate-6 group-hover:last:translate-x-2":
          !alt,
        "first:-rotate-6 first:scale-120 max-md:first:z-10 max-md:first:translate-x-6 first:-translate-y-6 md:first:-translate-y-2 last:rotate-3 last:scale-105 last:-translate-y-6 last:-translate-x-4 group-hover:first:-rotate-9 group-hover:first:scale-125 group-hover:first:-translate-y-4 group-hover:last:rotate-6 group-hover:last:scale-110 group-hover:last:-translate-y-8 group-hover:last:translate-x-2":
          alt,
      },
    )}
  >
    {media.type === "image" ? (
      <Image
        src={media.src}
        alt={media.alt}
        fill
        sizes="(max-width: 768px) 40vw, 24vw"
        className="object-cover"
      />
    ) : (
      <>
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={media.alt}
        >
          <source src={media.src} />
        </video>
        <span className="absolute bottom-4 right-4 rounded-full bg-black/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Video
        </span>
      </>
    )}
  </div>
);

export interface SectionProjectProps {
  flip?: boolean;
  project: Project;
}

export const SectionProject = ({ project, flip }: SectionProjectProps) => {
  const previewMedia = project.coverMedia.slice(0, 2);

  return (
    <Link
      href={{
        pathname: "/",
        query: {
          project: project.slug,
        },
      }}
      scroll={false}
      className="block"
    >
      <Section>
        <div
          className={classNames(
            "flex w-full border-t-2 md:border-2 border-background-alt hover:bg-background-alt hover:border-background-alt md:rounded-3xl group transition-all hover:scale-101 cursor-pointer",
            {
              "flex-col md:flex-row": !flip,
              "flex-col md:flex-row-reverse": flip,
            },
          )}
        >
          <div
            className={classNames("p-8 md:p-16 flex flex-col gap-2 md:w-2/3", {
              "md:text-right max-md:mb-4": flip,
            })}
          >
            <h4 className="text-3xl font-bold">{project.title}</h4>
            <p className="whitespace-pre-line">{project.description}</p>
            <p className="underline">View Gallery</p>
          </div>

          <div className="max-md:aspect-3/2 max-md:mt-8 max-md:w-full flex flex-1 justify-around relative">
            {previewMedia[0] ? (
              <ProjectPreviewMedia media={previewMedia[0]} alt={flip} />
            ) : null}
            <span
              className={classNames(
                "bg-foreground text-background h-12 aspect-square rounded-full z-10 absolute font-bold shadow-lg transition-all grid place-items-center",
                {
                  "bottom-0 right-4 md:right-0 m-4 rotate-6 md:translate-x-7 md:group-hover:translate-x-8 group-hover:rotate-12 group-hover:scale-110":
                    !flip,
                  "bottom-0 left-4 md:left-0 m-4 -rotate-6 md:-translate-x-1 md:group-hover:-translate-x-2 md:group-hover:translate-y-1 group-hover:-rotate-12 group-hover:scale-110":
                    flip,
                },
              )}
              aria-hidden
            >
              +{project.galleryMedia.length}
            </span>
            {previewMedia[1] ? (
              <ProjectPreviewMedia media={previewMedia[1]} alt={flip} />
            ) : null}
          </div>
        </div>
      </Section>
    </Link>
  );
};
