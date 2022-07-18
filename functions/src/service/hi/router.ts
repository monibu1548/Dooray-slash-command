import axios from "axios";
import * as express from "express";
import { CommandDialog } from "../../interface/commandDialog";
import { CommandInteraction } from "../../interface/commandInteraction";
import { AttachmentActionType, AttachmentButtonStyle, AttachmentDropdownAction, CommandResponse, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";
import { stagingLog } from "../../util/logger";
import { generateUUID } from "../../util/utils";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  stagingLog(JSON.stringify(request))

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
                value: '1',
                style: AttachmentButtonStyle.default
              },
              {
                name: '이름2',
                type: AttachmentActionType.Button,
                text: '텍스트2',
                value: '2',
                style: AttachmentButtonStyle.default
              },
              {
                name: '이름3',
                type: AttachmentActionType.Button,
                text: '텍스트3',
                value: '3',
                style: AttachmentButtonStyle.default
              },
            ]
          }
        ]
      }
      break;
    case 'e-menu':
      response = {
        text: "e-menu",
        deleteOriginal: false,
        responseType: ResponseType.Ephemeral,
        replaceOriginal: false,
        attachments: [
          {
            actions: [
              {
                name: 'name',
                type: AttachmentActionType.Dropdown,
                text: 'text',
                options: [
                  {
                    text: '1',
                    value: '1'
                  },
                  {
                    text: '2',
                    value: '2'
                  },
                  {
                    text: '3',
                    value: '3'
                  }
                ]
              } as AttachmentDropdownAction
            ]
          }
        ]
      }
      break;
    case 'dialog':
      await axios.post(`https://${request.tenantDomain}/messenger/api/channels/${request.channelId}/dialogs`, {
        token: request.cmdToken,
        triggerId: generateUUID(),
        dialog: {
          callbackId: generateUUID(),
          title: request.text,
          submitLabel: '리마인더 생성',
          elements: [
            {
              type: "text",
              subtype: "number",
              label: "Page Number",
              name: "page",
              value: 0,
              minLength: 1,
              maxLength: 2,
              placeholder: "0 ~ 50",
              hint: "Must in 0 ~ 50",
              optional: false
            },
            {
              "type": "textarea",
              "label": "Note",
              "name": "note",
              "optional": true
            },
            {
              "type": "select",
              "label": "Is this important?",
              "name": "important",
              "value": "false",
              "optional": false,
              "options": [
                {
                  "label": "Yes",
                  "value": "true"
                },
                {
                  "label": "No",
                  "value": "false"
                }
              ]
            }
          ]
        }
      } as CommandDialog, {
        headers: {
          token: request.cmdToken
        }
      })
      response = {
        text: "Dialog를 띄웁니다",
        deleteOriginal: false,
        responseType: ResponseType.InChannel,
        replaceOriginal: false,
        attachments: null
      }
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

  stagingLog(JSON.stringify(interaction))

  res.status(200).json({
    text: interaction.actionValue,
    responseType: ResponseType.InChannel,
    replaceOriginal: true
  } as CommandResponse)
});

module.exports = router