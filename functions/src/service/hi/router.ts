import * as express from "express";
import { CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post('/', async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  res.status(200).json({
    text: request.text,
    responseType: ResponseType.InChannel
  } as CommandResponse)
});
