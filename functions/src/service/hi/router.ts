import * as express from "express";
import { AttachmentButtonActionType, CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  var response: CommandResponse

  switch (request.text) {
    case 'A':
      response = {
        text: "a-menu",
        deleteOriginal: false,
        responseType: ResponseType.InChannel,
        replaceOriginal: false,
        attachments: null
      }
      break;
    case 'b-menu':
      response = {
        text: "b-menu",
        deleteOriginal: false,
        responseType: ResponseType.InChannel,
        replaceOriginal: false,
        attachments: null
      }
      break;
    case 'c-menu':
      response = {
        text: "c-menu",
        deleteOriginal: false,
        responseType: ResponseType.Ephemeral,
        replaceOriginal: false,
        attachments: [
          {
            callbackId: 'f',
            title: '버튼 타이틀',
            actions: [
              {
                name: '이름1',
                type: AttachmentButtonActionType.Button,
                text: '텍스트1',
                value: 0
              },
            ]
          }
        ]
      }
      break;
    default:
      response = {
        text: "명령어를 찾을 수 없습니다.",
        deleteOriginal: false,
        responseType: ResponseType.InChannel,
        replaceOriginal: false,
        attachments: null
      }
      break;
  }

  res.status(200).json(response)
});

// 사용자의 상호작용시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  res.status(200).json({
    text: request.text,
    responseType: ResponseType.InChannel
  } as CommandResponse)
});

module.exports = router