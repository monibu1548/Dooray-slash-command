import * as express from "express";
import { CommandInteraction } from "../../interface/commandInteraction";
import { AttachmentActionType, CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  var response: CommandResponse

  switch (request.text) {
    case 'a-menu':
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
            callbackId: 'a',
            title: '버튼 타이틀',
            actions: [
              {
                name: '이름1',
                type: AttachmentActionType.Button,
                text: '텍스트1',
                value: 1
              },
              {
                name: '이름2',
                type: AttachmentActionType.Button,
                text: '텍스트2',
                value: 2
              },
              {
                name: '이름3',
                type: AttachmentActionType.Button,
                text: '텍스트3',
                value: 3
              },
            ]
          },
          {
            name: '드롭다운 name',
            text: '드롭다운 text',
            type: AttachmentActionType.Dropdown,
            options: [
              {
                text: '메뉴1',
                value: '1'
              },
              {
                text: '메뉴2',
                value: '2'
              },
              {
                text: '메뉴1',
                value: '3'
              }
            ]

          }
        ]
      }
      break;
    case 'd-menu':
      response = {
        text: "d-menu",
        deleteOriginal: false,
        responseType: ResponseType.Ephemeral,
        replaceOriginal: false,
        attachments: [
          {
            name: '드롭다운 name',
            text: '드롭다운 text',
            type: AttachmentActionType.Dropdown,
            options: [
              {
                text: '메뉴1',
                value: '1'
              },
              {
                text: '메뉴2',
                value: '2'
              },
              {
                text: '메뉴1',
                value: '3'
              }
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
  const interaction = req.body as CommandInteraction

  res.status(200).json({
    text: interaction.actionValue,
    responseType: ResponseType.InChannel,
    replaceOriginal: true
  } as CommandResponse)
});

module.exports = router