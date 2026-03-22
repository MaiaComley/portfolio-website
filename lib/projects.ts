import fs from "node:fs";
import path from "node:path";

const PROJECTS_DIRECTORY = path.join(process.cwd(), "projects");
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".avif",
  ".gif",
]);
const SUPPORTED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".m4v",
  ".webm",
]);
const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

export type ProjectMediaType = "image" | "video";

export interface ProjectMedia {
  alt: string;
  fileName: string;
  src: string;
  type: ProjectMediaType;
}

export interface Project {
  coverMedia: ProjectMedia[];
  date: string;
  dateLabel: string;
  description: string;
  galleryMedia: ProjectMedia[];
  slug: string;
  title: string;
}

type ProjectDetails = Pick<Project, "date" | "dateLabel" | "description" | "title"> & {
  timestamp: number;
};

type ProjectWithTimestamp = Project & {
  timestamp: number;
};

function createProjectError(projectSlug: string, message: string) {
  return new Error(`Project "${projectSlug}" is invalid: ${message}`);
}

function isVisibleName(name: string) {
  return !name.startsWith(".");
}

function toPublicPath(...segments: string[]) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join("/")}`;
}

function getProjectMediaType(extension: string): ProjectMediaType | null {
  if (SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return "image";
  }

  if (SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
    return "video";
  }

  return null;
}

function readProjectDetails(projectDirectory: string, projectSlug: string): ProjectDetails {
  const detailsPath = path.join(projectDirectory, "details.txt");

  if (!fs.existsSync(detailsPath)) {
    throw createProjectError(projectSlug, 'missing required file "details.txt"');
  }

  const detailsFile = fs.readFileSync(detailsPath, "utf8").replace(/\r\n/g, "\n");
  const lines = detailsFile.split("\n");
  const title = lines[0]?.trim();

  if (!title) {
    throw createProjectError(projectSlug, "details.txt first line must be a project title");
  }

  const date = lines[1]?.trim();

  if (!date) {
    throw createProjectError(
      projectSlug,
      "details.txt second line must be a date in YYYY-MM-DD format",
    );
  }

  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!dateMatch) {
    throw createProjectError(projectSlug, `date "${date}" must use YYYY-MM-DD format`);
  }

  const [, year, month, day] = dateMatch;
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() !== Number(month) - 1 ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    throw createProjectError(projectSlug, `date "${date}" is not a valid calendar date`);
  }

  return {
    date,
    dateLabel: DATE_FORMATTER.format(parsedDate),
    description: lines.slice(2).join("\n").trim(),
    timestamp: parsedDate.getTime(),
    title,
  };
}

function readProjectMedia(
  projectDirectory: string,
  projectSlug: string,
  projectTitle: string,
  mediaDirectoryName: "cover" | "gallery",
): ProjectMedia[] {
  const mediaDirectory = path.join(projectDirectory, mediaDirectoryName);

  if (!fs.existsSync(mediaDirectory)) {
    throw createProjectError(projectSlug, `missing required directory "${mediaDirectoryName}"`);
  }

  const stats = fs.statSync(mediaDirectory);

  if (!stats.isDirectory()) {
    throw createProjectError(projectSlug, `"${mediaDirectoryName}" must be a directory`);
  }

  const entries = fs
    .readdirSync(mediaDirectory, { withFileTypes: true })
    .filter((entry) => isVisibleName(entry.name))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

  if (entries.length === 0) {
    throw createProjectError(
      projectSlug,
      `"${mediaDirectoryName}" must contain at least one media file`,
    );
  }

  return entries.map((entry, index) => {
    if (!entry.isFile()) {
      throw createProjectError(
        projectSlug,
        `"${mediaDirectoryName}" can only contain media files, but found "${entry.name}"`,
      );
    }

    const extension = path.extname(entry.name).toLowerCase();
    const mediaType = getProjectMediaType(extension);

    if (!mediaType) {
      throw createProjectError(
        projectSlug,
        `"${mediaDirectoryName}/${entry.name}" uses unsupported extension "${extension || "(none)"}"`,
      );
    }

    return {
      alt: `${projectTitle} ${mediaDirectoryName} ${mediaType} ${index + 1}`,
      fileName: entry.name,
      src: toPublicPath(
        "generated",
        "projects",
        projectSlug,
        mediaDirectoryName,
        entry.name,
      ),
      type: mediaType,
    };
  });
}

export function loadProjects(projectsDirectory = PROJECTS_DIRECTORY): Project[] {
  if (!fs.existsSync(projectsDirectory)) {
    return [];
  }

  const projects: ProjectWithTimestamp[] = fs
    .readdirSync(projectsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isVisibleName(entry.name))
    .map((entry) => {
      const projectDirectory = path.join(projectsDirectory, entry.name);
      const details = readProjectDetails(projectDirectory, entry.name);
      const coverMedia = readProjectMedia(
        projectDirectory,
        entry.name,
        details.title,
        "cover",
      );
      const galleryMedia = readProjectMedia(
        projectDirectory,
        entry.name,
        details.title,
        "gallery",
      );

      return {
        coverMedia,
        date: details.date,
        dateLabel: details.dateLabel,
        description: details.description,
        galleryMedia,
        slug: entry.name,
        title: details.title,
        timestamp: details.timestamp,
      };
    })
    .sort((left, right) => {
      if (left.timestamp !== right.timestamp) {
        return right.timestamp - left.timestamp;
      }

      return left.slug.localeCompare(right.slug, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

  return projects.map((project) => ({
    coverMedia: project.coverMedia,
    date: project.date,
    dateLabel: project.dateLabel,
    description: project.description,
    galleryMedia: project.galleryMedia,
    slug: project.slug,
    title: project.title,
  }));
}
