import * as express from "express";
import { CommandInteraction } from "../../interface/commandInteraction";
import { AttachmentActionType, CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";
import { stagingLog } from "../../util/logger";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  stagingLog(JSON.stringify(request))

  var response = {
    responseType: ResponseType.Ephemeral,
    replaceOriginal: false,
    deleteOriginal: false,
    text: '',
    attachments: [
      {
        callbackId: '1233',
        title: '반복 설정',
        actions: [
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '한번',
            value: 'once',
          },
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '주기적',
            value: 'repeat'
          }
        ]
      }
    ]

  } as CommandResponse

  res.status(200).json(response)
});

// 사용자의 상호작용시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {
  const interaction = req.body as CommandInteraction

  stagingLog(JSON.stringify(interaction))

  res.status(200).json({
    text: interaction.actionValue,
    responseType: ResponseType.InChannel,
    replaceOriginal: true
  } as CommandResponse)
});

module.exports = router