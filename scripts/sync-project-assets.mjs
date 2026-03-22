import fs from "node:fs/promises";
import path from "node:path";

const PROJECTS_DIRECTORY = path.join(process.cwd(), "projects");
const GENERATED_PROJECTS_DIRECTORY = path.join(
  process.cwd(),
  "public",
  "generated",
  "projects",
);
const PROJECT_MEDIA_DIRECTORIES = ["cover", "gallery"];
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

function isVisibleName(name) {
  return !name.startsWith(".");
}

function createProjectError(projectSlug, message) {
  return new Error(`Project "${projectSlug}" is invalid: ${message}`);
}

function isSupportedMediaExtension(extension) {
  return (
    SUPPORTED_IMAGE_EXTENSIONS.has(extension) ||
    SUPPORTED_VIDEO_EXTENSIONS.has(extension)
  );
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readVisibleDirectoryEntries(directoryPath) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });

  return entries
    .filter((entry) => isVisibleName(entry.name))
    .sort((left, right) =>
      left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
}

async function syncProjectMedia(projectSlug) {
  const projectDirectory = path.join(PROJECTS_DIRECTORY, projectSlug);

  for (const mediaDirectoryName of PROJECT_MEDIA_DIRECTORIES) {
    const sourceDirectory = path.join(projectDirectory, mediaDirectoryName);

    if (!(await pathExists(sourceDirectory))) {
      throw createProjectError(projectSlug, `missing required directory "${mediaDirectoryName}"`);
    }

    const sourceStats = await fs.stat(sourceDirectory);

    if (!sourceStats.isDirectory()) {
      throw createProjectError(projectSlug, `"${mediaDirectoryName}" must be a directory`);
    }

    const sourceEntries = await readVisibleDirectoryEntries(sourceDirectory);

    if (sourceEntries.length === 0) {
      throw createProjectError(
        projectSlug,
        `"${mediaDirectoryName}" must contain at least one media file`,
      );
    }

    const targetDirectory = path.join(
      GENERATED_PROJECTS_DIRECTORY,
      projectSlug,
      mediaDirectoryName,
    );

    await fs.mkdir(targetDirectory, { recursive: true });

    for (const entry of sourceEntries) {
      if (!entry.isFile()) {
        throw createProjectError(
          projectSlug,
          `"${mediaDirectoryName}" can only contain media files, but found "${entry.name}"`,
        );
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (!isSupportedMediaExtension(extension)) {
        throw createProjectError(
          projectSlug,
          `"${mediaDirectoryName}/${entry.name}" uses unsupported extension "${extension || "(none)"}"`,
        );
      }

      await fs.copyFile(
        path.join(sourceDirectory, entry.name),
        path.join(targetDirectory, entry.name),
      );
    }
  }
}

async function main() {
  await fs.rm(GENERATED_PROJECTS_DIRECTORY, { force: true, recursive: true });

  if (!(await pathExists(PROJECTS_DIRECTORY))) {
    return;
  }

  const projectEntries = await readVisibleDirectoryEntries(PROJECTS_DIRECTORY);
  const projectDirectories = projectEntries.filter((entry) => entry.isDirectory());

  for (const entry of projectDirectories) {
    await syncProjectMedia(entry.name);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
