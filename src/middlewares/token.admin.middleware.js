const jwt = require("jsonwebtoken");

function middlewareToken(req, res, next) {
  const tokenheader = req.headers["authorization"];
  const token = tokenheader && tokenheader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, process.env.SECRETKEY, (err, admin) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token Has Expired" });
      } else {
        return res.status(403).json({ message: "Forbidden", err });
      }
    }
    req.admin = admin;
    next();
  });
}

module.exports = middlewareToken;
