import * as functions from "firebase-functions";
import * as express from "express";
import { ServicePath } from "./lib/contants";

const app = express();

// Router
const hiRouter = require('./service/hi/router')

app.use(ServicePath.Hi, hiRouter);

// Health Check
app.get("/", async (req: express.Request, res: express.Response) => res.status(200).send("OK"));

exports.api = functions
  .region("asia-northeast3")
  .https
  .onRequest(app);