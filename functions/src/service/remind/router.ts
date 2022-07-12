import * as express from "express";
import { CommandInteraction } from "../../interface/commandInteraction";
import { AttachmentActionType, AttachmentButtonStyle, CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";
import { stagingLog } from "../../util/logger";
import { generateUUID } from "../../util/utils";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  stagingLog(JSON.stringify(request))

  var response = {
    responseType: ResponseType.Ephemeral,
    replaceOriginal: false,
    deleteOriginal: false,
    text: '리마인드 설정',
    attachments: [
      {
        callbackId: generateUUID(),
        title: '반복 설정',
        actions: [
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '한번',
            value: 'once',
            style: AttachmentButtonStyle.Primary
          },
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '주기적',
            value: 'repeat',
            style: AttachmentButtonStyle.default
          }
        ]
      }
    ]

  } as CommandResponse

  stagingLog(JSON.stringify(response))

  res.status(200).json(response)
});

// 사용자의 상호작용시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {
  const interaction = req.body as CommandInteraction

  stagingLog(JSON.stringify(interaction))

  var message = interaction.originalMessage

  // 1. 반복 설정
  if (interaction.actionName == 'repeat') {
    stagingLog('action name: repeat')
    message.attachments = []

    if (interaction.actionValue == 'once') {
      message.attachments = [
        {
          callbackId: generateUUID(),
          title: '예약',
          actions: [
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '1분 후',
              value: '1min',
              style: AttachmentButtonStyle.Primary
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '3분 후',
              value: '3min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '5분 후',
              value: '5min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '10분 후',
              value: '10min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '15분 후',
              value: '15min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '30분 후',
              value: '30min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '60분 후',
              value: '60min',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '직접 설정',
              value: 'manual',
              style: AttachmentButtonStyle.default
            }
          ]
        }
      ]
    } else if (interaction.actionValue == 'periodic') {
      message.attachments = [
        {
          callbackId: generateUUID(),
          title: '주기 설정',
          actions: [
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '월',
              value: 'mon',
              style: AttachmentButtonStyle.Primary
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '화',
              value: 'tue',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '수',
              value: 'wed',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '목',
              value: 'thu',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '금',
              value: 'fri',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '토',
              value: 'sat',
              style: AttachmentButtonStyle.default
            },
            {
              name: 'periodic',
              type: AttachmentActionType.Button,
              text: '일',
              value: 'sun',
              style: AttachmentButtonStyle.default
            }
          ]
        }
      ]
    }
  }

  // 1-1.한번 예약
  if (interaction.actionName == 'once') {
    stagingLog('action name: once')
  }



  // 1-2. 정기적 예약
  if (interaction.actionName == 'periodic') {
    stagingLog('action name: periodic')
  }


  res.status(200).json(message)
});

module.exports = router