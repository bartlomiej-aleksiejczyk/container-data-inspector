import { readdir } from "fs";
import { join, sep } from "path"; // Import 'sep' along with 'join'
import os from "os";

export function getHomeDirectory() {
  return os.homedir();
}

export function getFileListAndBreadcrumb(directory, callback) {
  readdir(directory, { withFileTypes: true }, (err, files) => {
    if (err) {
      return callback(err);
    }

    // Filter out non-file and non-directory entries
    const filteredFiles = files.filter(
      (file) => file.isFile() || file.isDirectory()
    );

    const fileList = filteredFiles.map((file) => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: join(directory, file.name),
    }));

    const parts = directory.split(sep).filter((part) => part); // path.sep for cross-platform compatibility
    let pathAccumulator = ""; // Accumulator for building the path incrementally
    const breadcrumbs = parts.map((part) => {
      pathAccumulator += `${sep}${part}`;
      return { name: part, path: pathAccumulator };
    });
    breadcrumbs.unshift({ name: "root", path: sep }); // Use path.sep for root to handle different OS path roots

    callback(null, fileList, breadcrumbs);
  });
}
