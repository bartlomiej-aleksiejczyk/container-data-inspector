export function login(username, password, session) {
  return new Promise((resolve, reject) => {
    if (
      process.env.USER_LOGIN &&
      process.env.USER_PASSWORD &&
      username === process.env.USER_LOGIN &&
      password === process.env.USER_PASSWORD
    ) {
      if (session) {
        session.user = { username: username };
        resolve("Logged in successfully");
      } else {
        reject("Session handling is disabled");
      }
    } else {
      reject("Invalid credentials");
    }
  });
}

export function logout(session) {
  return new Promise((resolve, reject) => {
    if (session) {
      session.destroy((err) => {
        if (err) {
          reject({ status: 500, message: "Failed to logout" });
        } else {
          resolve("Logged out successfully");
        }
      });
    } else {
      reject({
        status: 403,
        message: "Logging out not possible, session handling is disabled.",
      });
    }
  });
}
