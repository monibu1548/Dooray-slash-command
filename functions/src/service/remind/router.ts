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
            value: 'periodic',
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
  message.replaceOriginal = true

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
              value: 'c',
              style: AttachmentButtonStyle.default
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
              style: AttachmentButtonStyle.default
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
        },
        {
          actions: [
            {
              name: 'AM/PM',
              text: 'AM/PM',
              type: AttachmentActionType.Dropdown,
              options: [
                {
                  type: AttachmentActionType.Dropdown,
                  text: '오전',
                  value: 'morning'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '오후',
                  value: 'afternoon'
                }
              ]
            },
            {
              name: 'hour',
              text: 'hour',
              type: AttachmentActionType.Dropdown,
              options: [
                {
                  type: AttachmentActionType.Dropdown,
                  text: '12시',
                  value: '12h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '1시',
                  value: '1h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '2시',
                  value: '2h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '3시',
                  value: '3h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '4시',
                  value: '4h'
                },
              ]
            },
            {
              name: 'min',
              text: 'min',
              type: AttachmentActionType.Dropdown,
              options: [
                {
                  type: AttachmentActionType.Dropdown,
                  text: '00',
                  value: '00m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '05',
                  value: '05m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '10',
                  value: '10m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '15',
                  value: '15m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '20',
                  value: '20m'
                },
              ]
            }
          ]
        },
        {
          callbackId: generateUUID(),
          title: '확인',
          actions: [
            {
              name: 'confirm',
              type: AttachmentActionType.Button,
              text: '생성',
              value: 'confirm',
              style: AttachmentButtonStyle.Primary
            },
            {
              name: 'confirm',
              type: AttachmentActionType.Button,
              text: '취소',
              value: 'cancel',
              style: AttachmentButtonStyle.default
            },
          ]
        },
      ]
    }
  }

  // 1-1.한번 예약
  if (interaction.actionName == 'once') {
    stagingLog('action name: once')

    switch (interaction.actionValue) {
      // DB 에 Work Queue 생성
      case '1min':
        break;
      case '3min':
        break;
      case '5min':
        break;
      case '10min':
        break;
      case '15min':
        break;
      case '30min':
        break;
      case '60min':
        break;
      case 'manual':
        break;
    }
  }



  // 1-2. 정기적 예약 (요일 클릭 시)
  if (interaction.actionName == 'periodic') {
    stagingLog('action name: periodic')

    switch (interaction.actionValue) {
      // DB 에 Work Queue 생성
      // 클릭 시 누적
      case 'mon':
        break;
      case 'tue':
        break;
      case 'wed':
        break;
      case 'thu':
        break;
      case 'fri':
        break;
      case 'sat':
        break;
      case 'sun':
        break;
    }
  }


  res.status(200).json(message)
});

module.exports = router