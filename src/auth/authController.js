import express from "express";
import { login, logout } from "./authService.js";

const router = express.Router();

router.post("/login", express.json(), (req, res) => {
  const { username, password } = req.body;
  login(username, password, req.session)
    .then((message) => {
      res.render("login_success.njk", { message });
    })
    .catch((error) => {
      res.render("login_error.njk", { error });
    });
});

router.get("/logout", (req, res) => {
  logout(req.session)
    .then((message) => {
      res.render("logout_success.njk", { message });
    })
    .catch((error) => {
      res
        .status(error.status)
        .render("logout_error.njk", { error: error.message });
    });
});

export default router;
