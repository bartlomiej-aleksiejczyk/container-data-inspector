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
const appNames = ["file", "common", "auth"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewPaths = appNames.map((appName) =>
  path.join(__dirname, appName, "views")
);

const nunjucksContext = nunjucks.configure(viewPaths, {
  autoescape: true,
  express: app,
});

nunjucksContext.addGlobal("siteName", "Data Inspector");

if (process.env.SESSION_SECRET) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );
}

function isAuthenticated(req, res, next) {
  console.log(req.session);

  if (process.env.SESSION_SECRET && req.session.user) {
    console.log(req.session.user);
    return next();
  }
  res.redirect("/auth/login");
}

app.use("/static", express.static("public"));
app.use("/auth", authRoutes);
app.use("/file", isAuthenticated, fileRoutes);

app.get("/", (req, res) => {
  res.redirect("/file");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
