import express from "express";
import {
  getHomeDirectory,
  getFileListAndBreadcrumb,
  resolveAndCheckFile,
  readFileStream,
} from "./fileService.js";
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
      console.log(breadcrumbs);
      res.render("file-explorer.njk", {
        siteName: "File Explorer",
        currentDirectory: chosenDirectory,
        fileList: fileList,
        breadcrumbs: breadcrumbs,
        returnUrl: breadcrumbs.at(-2)?.path || "/",
      });
    });
  } else if (req.query.file) {
    const filePath = path.resolve(req.query.file);
    const fileName = path.basename(filePath);

    resolveAndCheckFile(filePath, (err, resolvedPath) => {
      if (err) {
        console.error(err);
        return res.status(500).send(err);
      }

      readFileStream(resolvedPath, (err, fileStream) => {
        if (err) {
          console.error(err);
          return res.status(500).send(err);
        }
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
        res.setHeader("Content-Type", "application/octet-stream");
        fileStream.pipe(res);
      });
    });
  }
});

export default router;
