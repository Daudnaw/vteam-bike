import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const [, token] = authHeader.split("");

    if (!token) {
        return res.status(401).json({ message: "Missing auth token" });
    }

    try {
        const secret = process.env.JWT_SECRET;
        const payload = jwt.verify(token, secret);

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}