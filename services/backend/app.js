import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import routes from "./routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  }),
);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", routes);
app.get("/health", (req, res) => res.status(200).send("ok"));

export default app;
