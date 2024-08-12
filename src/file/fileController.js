import express from "express";
import { getHomeDirectory, getFileListAndBreadcrumb } from "./fileService.js";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("*", (req, res) => {
  const homeDirectory = getHomeDirectory();

  if (!req.query.dir && !req.query.file) {
    return res.redirect(`${req.baseUrl}?dir=${homeDirectory}`);
  }

  if (req.query.dir) {
    const chosenDirectory = req.query.dir;
    getFileListAndBreadcrumb(chosenDirectory, (err, fileList, breadcrumbs) => {
      if (err) {
        console.error("Directory scan error:", err);
        return res.status(500).send("Unable to scan directory.");
      }

      res.render("index.njk", {
        currentDirectory: chosenDirectory,
        fileList: fileList,
        breadcrumbs: breadcrumbs,
      });
    });
  } else if (req.query.file) {
    const filePath = path.resolve(req.query.file);
    const fileName = path.basename(filePath);

    console.log(`Requested file path: ${req.query.file}`);
    console.log(`Resolved file path: ${filePath}`);

    // Merge checks for file or symlink and directly check if it's accessible
    checkIfFileOrSymlinkAndSend(filePath, fileName, res);
  }
});

function checkIfFileOrSymlinkAndSend(filePath, fileName, res) {
  fs.lstat(filePath, (err, stats) => {
    if (err) {
      console.error(`lstat error for path ${filePath}:`, err.message);
      return res.status(404).send("File not found or inaccessible.");
    }

    if (stats.isSymbolicLink() || stats.isFile()) {
      fs.realpath(filePath, (err, resolvedPath) => {
        if (err) {
          console.error(`realpath error for path ${filePath}:`, err.message);
          return res
            .status(500)
            .send("Internal server error while resolving the path.");
        }

        console.log(`File or symlink resolved to: ${resolvedPath}`);
        const fileStream = fs.createReadStream(resolvedPath);

        fileStream.on("error", function (streamError) {
          console.error("Stream error:", streamError);
          res.status(500).send("Failed to read file stream.");
        });

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
        res.setHeader("Content-Type", "application/octet-stream"); // Set appropriate content type
        fileStream.pipe(res);
      });
    } else {
      console.warn(`Path is neither a file nor a symlink: ${filePath}`);
      return res.status(400).send("Requested path is not a file or symlink.");
    }
  });
}

export default router;
