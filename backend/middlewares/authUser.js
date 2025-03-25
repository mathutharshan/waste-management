import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login again." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Session expired. Login again." });
    }

    console.error("User Auth Error:", error.message);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authUser;
