import * as functions from "firebase-functions";
import * as express from "express";
import { ServicePath } from "./lib/contants";
import { run } from "./service/remind/service";

const app = express();

// Router
const hiRouter = require('./service/hi/router')
const remindRouter = require('./service/remind/router')

app.use(ServicePath.Hi, hiRouter);
app.use(ServicePath.Remind, remindRouter);

// Health Check
app.get("/", async (req: express.Request, res: express.Response) => res.status(200).send("OK"));

exports.api = functions
  .region("asia-northeast3")
  .https
  .onRequest(app);

exports.remindTaskRunner = functions
  .region("asia-northeast3")
  .runWith({ memory: '2GB' })
  .pubsub
  .schedule('* * * * *')
  .onRun(async context => {
    return run()
  })