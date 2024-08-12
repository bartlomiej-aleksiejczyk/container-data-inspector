import express from "express";
import nunjucks from "nunjucks";
import path from "path";
import { fileURLToPath } from "url";
import fileRoutes from "./file/fileController.js";
import authRoutes from "./auth/authController.js";
import "dotenv/config";
import session from "express-session";

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

if (process.env.SESSION_SECRET) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: true },
    })
  );
}

function isAuthenticated(req, res, next) {
  if (process.env.SESSION_SECRET && req.session.user) {
    return next();
  }
  res
    .status(401)
    .send("Authentication is disabled or you are not authenticated");
}

app.use("/static", express.static("public"));
app.use("/auth", authRoutes);
app.use("/file", isAuthenticated, fileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
