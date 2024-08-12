import fs, { readdir } from "fs";
import { join, sep } from "path";
import os from "os";

function getHomeDirectory() {
  return os.homedir();
}

function getFileListAndBreadcrumb(directory, callback) {
  readdir(directory, { withFileTypes: true }, (err, files) => {
    if (err) {
      return callback(err);
    }

    const filteredFiles = files.filter(
      (file) => file.isFile() || file.isDirectory()
    );

    const fileList = filteredFiles.map((file) => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: join(directory, file.name),
    }));

    const parts = directory.split(sep).filter((part) => part);
    let pathAccumulator = "";
    const breadcrumbs = parts.map((part) => {
      pathAccumulator += `${sep}${part}`;
      return { name: part, path: pathAccumulator };
    });
    breadcrumbs.unshift({ name: "root", path: sep });

    callback(null, fileList, breadcrumbs);
  });
}

function resolveAndCheckFile(filePath, callback) {
  fs.lstat(filePath, (err, stats) => {
    if (err) {
      return callback(`lstat error for path ${filePath}: ${err.message}`);
    }

    if (stats.isSymbolicLink() || stats.isFile()) {
      fs.realpath(filePath, callback);
    } else {
      callback("Path is neither a file nor a symlink");
    }
  });
}

function readFileStream(filePath, callback) {
  const fileStream = fs.createReadStream(filePath);
  fileStream.on("error", (streamError) => {
    callback(`Stream error: ${streamError}`, null);
  });
  callback(null, fileStream);
}

export {
  getHomeDirectory,
  getFileListAndBreadcrumb,
  resolveAndCheckFile,
  readFileStream,
};
