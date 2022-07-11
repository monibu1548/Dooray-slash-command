import * as express from "express";
import { CommandInteraction } from "../../interface/commandInterfaction";
import { CommandResponse } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  console.log(request)

  res.status(200).json({
    text: "hi Request"
  } as CommandResponse)
});

// 유저의 상호작용 시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandInteraction

  console.log(request)

  res.status(200).json({
    text: "hi "
  } as CommandResponse)
});

module.exports = router