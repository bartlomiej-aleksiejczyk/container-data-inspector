import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import fileRoutes from "./file/fileController.js";

const app = express();

const PORT = 3000;
const appNames = ["file", "common"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewPaths = appNames.map((appName) =>
  path.join(__dirname, appName, "views")
);

nunjucks.configure(viewPaths, {
  autoescape: true,
  express: app,
});

app.use(express.static("public"));

app.use("/file", fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
