import express from "express";
import { login, logout } from "./authService.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login-form.njk");
});

router.post("/login", express.urlencoded({ extended: true }), (req, res) => {
  const { username, password } = req.body;
  login(username, password, req.session)
    .then((message) => {
      res.render("login-success.njk", { message });
    })
    .catch((error) => {
      res.render("login-error.njk", { error });
    });
});

router.get("/logout", (req, res) => {
  logout(req.session)
    .then((message) => {
      res.render("logout-success.njk", { message });
    })
    .catch((error) => {
      res
        .status(error.status)
        .render("logout-error.njk", { error: error.message });
    });
});

export default router;
