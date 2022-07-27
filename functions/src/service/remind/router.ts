import * as express from "express";
import { CommandDialogResponse } from "../../interface/commandDialogResponse";
import { CommandInteraction, isDialogResponse } from "../../interface/commandInteraction";
import { AttachmentActionType, AttachmentButtonStyle, AttachmentFields, CommandResponse, isField, ResponseType } from "../../interface/commandReponse";
import { CommandRequest } from "../../interface/commandRequest";
import { EndPoint } from "../../lib/contants";
import { stagingLog } from "../../util/logger";
import { generateUUID } from "../../util/utils";
import { messageToChannel, registeredTaskListInChannel, registerOnceManualTask, registerOnceTask, registerPeriodicTask, removeTask, showManualInputDialog } from "./service";

const router = express.Router();

// 슬래시 커맨드 실행 시 호출되는 Router
router.post(EndPoint.Request, async (req: express.Request, res: express.Response) => {
  const request = req.body as CommandRequest

  if (request.text === 'help') {
    var response = {
      responseType: ResponseType.Ephemeral,
      replaceOriginal: false,
      deleteOriginal: false,
      text: `
        /remind {메시지} 👈 리마인더 추가
        /remind list 👈 현재 채널에 등록된 리마인더 목록 조회
        /remind remove {리마인드ID} 👈 리마인더 제거
        /remind help 👈 도움말
        `,
      attachments: []

    } as CommandResponse
    res.status(200).json(response)
    return
  }

  if (request.text === 'list') {
    const text = await registeredTaskListInChannel(request.tenantId, request.channelId)
    var response = {
      responseType: ResponseType.Ephemeral,
      replaceOriginal: false,
      deleteOriginal: false,
      text: text,
      attachments: []

    } as CommandResponse
    res.status(200).json(response)
    return
  } else if (request.text.indexOf('remove') > -1) {
    // remove 명령어 가능성
    const sliced = request.text.split(' ')
    if (sliced.length == 2 && sliced[0] === 'remove') {
      await removeTask(sliced[1])
      var response = {
        responseType: ResponseType.Ephemeral,
        replaceOriginal: false,
        deleteOriginal: false,
        text: "삭제했습니다",
        attachments: []

      } as CommandResponse
      res.status(200).json(response)
      return

    } else {
      var response = {
        responseType: ResponseType.Ephemeral,
        replaceOriginal: false,
        deleteOriginal: false,
        text: `
        /remind {메시지} 👈 리마인더 추가
        /remind list 👈 현재 채널에 등록된 리마인더 목록 조회
        /remind remove {리마인드ID} 👈 리마인더 제거
        /remind help 👈 도움말
        `,
        attachments: []

      } as CommandResponse
      res.status(200).json(response)
      return
    }
  } else if (request.text === '') {
    var response = {
      responseType: ResponseType.Ephemeral,
      replaceOriginal: false,
      deleteOriginal: false,
      text: `
        /remind {메시지} 👈 리마인더 추가
        /remind list 👈 현재 채널에 등록된 리마인더 목록 조회
        /remind remove {리마인드ID} 👈 리마인더 제거
        /remind help 👈 도움말
        `,
      attachments: []

    } as CommandResponse
    res.status(200).json(response)
    return
  }

  var response = {
    responseType: ResponseType.Ephemeral,
    replaceOriginal: false,
    deleteOriginal: false,
    text: request.text,
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
            style: AttachmentButtonStyle.default
          },
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '주기적',
            value: 'periodic',
            style: AttachmentButtonStyle.default
          },
          {
            name: 'repeat',
            type: AttachmentActionType.Button,
            text: '취소',
            value: 'cancel',
            style: AttachmentButtonStyle.default
          }
        ]
      }
    ]

  } as CommandResponse

  res.status(200).json(response)
});

// 사용자의 상호작용시 호출되는 Router
router.post(EndPoint.Interaction, async (req: express.Request, res: express.Response) => {

  if (isDialogResponse(req.body)) {

    const dialogResponse = req.body as CommandDialogResponse
    const value = dialogResponse.submission.manual as string
    const messageText = dialogResponse.submission.message as string

    // value => date 로 변경하면서 유효성 검사
    stagingLog('[DEBUG] value => ' + JSON.stringify(value))

    const [dateComponents, timeComponents] = value.split(' ');
    const [year, month, day] = dateComponents.split('/');
    const [hours, minutes] = timeComponents.split(':');

    const date = new Date(+year, +month - 1, +day, +hours, +minutes, 0);
    await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", dialogResponse.tenant.domain, dialogResponse.cmdToken, dialogResponse.channel.id, ResponseType.Ephemeral)


    await registerOnceManualTask(dialogResponse, messageText, date.getTime() - (9 * 60 * 60 * 1000))

    await messageToChannel("등록했습니다", dialogResponse.tenant.domain, dialogResponse.cmdToken, dialogResponse.channel.id, ResponseType.Ephemeral)

    // 리마인더 등록
    const message = {
      text: date.toLocaleString(),
      responseType: ResponseType.Ephemeral,
      replaceOriginal: true,
      deleteOriginal: true,
      attachments: []
    } as CommandResponse
    res.status(200).json(message)
    return
  }

  const interaction = req.body as CommandInteraction

  stagingLog(JSON.stringify(interaction))

  var message = interaction.originalMessage
  message.replaceOriginal = true

  // 1. 반복 설정
  if (interaction.actionName == 'repeat') {
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
            },
            {
              name: 'once',
              type: AttachmentActionType.Button,
              text: '취소',
              value: 'cancel',
              style: AttachmentButtonStyle.default
            },
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
                {
                  type: AttachmentActionType.Dropdown,
                  text: '5시',
                  value: '5h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '6시',
                  value: '6h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '7시',
                  value: '7h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '8시',
                  value: '8h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '9시',
                  value: '9h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '10시',
                  value: '10h'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '11시',
                  value: '11h'
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
                {
                  type: AttachmentActionType.Dropdown,
                  text: '25',
                  value: '25m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '30',
                  value: '30m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '35',
                  value: '35m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '40',
                  value: '40m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '45',
                  value: '45m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '50',
                  value: '50m'
                },
                {
                  type: AttachmentActionType.Dropdown,
                  text: '55',
                  value: '55m'
                },
              ]
            }
          ]
        },
        {
          fields: [
            {
              title: '주기',
              value: '매주 "월화수목금" 마다 "오전" "12"시 "00"분'
            }
          ]
        },
        {
          fields: [
            {
              title: '메시지 내용',
              value: message.text
            }
          ]
        },
        {
          callbackId: generateUUID(),
          title: '리마인더',
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
    } else if (interaction.actionValue == 'cancel') {
      message.attachments = []
      message.text = '취소했습니다'
    }
  }

  // 1-1.한번 예약
  if (interaction.actionName == 'once') {
    switch (interaction.actionValue) {
      // DB 에 Work Queue 생성
      case '1min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '1')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case '3min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '3')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case '5min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '5')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case '10min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '10')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case '15min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '15')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case '30min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '30')
        message.attachments = []
        message.text = '등록했습니다'
        break;
      case '60min':
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)
        await registerOnceTask(interaction, '60')
        message.attachments = []
        message.text = '등록했습니다 ✔️'
        break;
      case 'manual':
        // 미지원
        const res = await showManualInputDialog(interaction)
        stagingLog('[DEBUG] showManualInputDialog => ' + JSON.stringify(res.data))
        message.attachments = []
        message.text = '직접 설정을 완료해주세요'
        break;
      case 'cancel':
        message.attachments = []
        message.text = '취소했습니다'
        break;
    }
  }



  // 1-2. 정기적 예약 (요일 클릭 시)
  if (interaction.actionName == 'periodic') {
    updatePeriodicAttachment(message, interaction.actionValue, null, null, null)

    stagingLog('updatePeriodicAttachment week: ' + JSON.stringify(message))
  }

  // 1-2. 정기적 예약 (오전오후 클릭 시)
  if (interaction.actionName == 'AM/PM') {
    updatePeriodicAttachment(message, null, interaction.actionValue, null, null)

    stagingLog('updatePeriodicAttachment morning: ' + JSON.stringify(message))
  }

  // 1-2. 정기적 예약 (시간 클릭 시)
  if (interaction.actionName == 'hour') {
    updatePeriodicAttachment(message, null, null, interaction.actionValue, null)

    stagingLog('updatePeriodicAttachment hour: ' + JSON.stringify(message))
  }

  // 1-2. 정기적 예약 (분 클릭 시)
  if (interaction.actionName == 'min') {
    updatePeriodicAttachment(message, null, null, null, interaction.actionValue)

    stagingLog('updatePeriodicAttachment min: ' + JSON.stringify(message))
  }

  // 2. 확인
  if (interaction.actionName == 'confirm') {

    switch (interaction.actionValue) {
      case 'confirm':
        // DB 적재 및 Flow 종료
        await messageToChannel("등록 중. 잠시만 기다려주세요 🚗", interaction.tenant.domain, interaction.cmdToken, interaction.channel.id, ResponseType.Ephemeral)

        await registerPeriodicTask(interaction, periodicAttachment(message).value)

        message.text = '등록했습니다'
        message.attachments = []
        break;
      case 'cancel':
        message.attachments = []
        message.text = '취소했습니다'
        break;
    }
  }

  res.status(200).json(message)
});


const periodicAttachment = (message: CommandResponse) => {
  stagingLog('[periodicAttachment] message => ' + JSON.stringify(message))

  const fields = (message.attachments ?? [])
    .filter((attachment) => {
      return isField(attachment)
    })
    .filter((field) => {
      const casted = field as AttachmentFields
      return casted.fields[0].title === '주기'
    })[0] as AttachmentFields

  stagingLog('[periodicAttachment] return => ' + JSON.stringify(fields.fields[0]))
  return fields.fields[0]
}


const updatePeriodicAttachment = (message: CommandResponse, week: string | null, morning: string | null, hour: string | null, min: string | null) => {
  var attachment = periodicAttachment(message)

  stagingLog('updatePeriodicAttachment periodicAttachment: ' + JSON.stringify(attachment))

  var val = attachment.value.split('"')
  var settedWeek = val[1]
  var settedMorning = val[3]
  var settedHour = val[5]
  var settedMin = val[7]

  if (week !== null) {
    var weekValue = weekToKo(week)
    if (weekValue === settedWeek) {
      // 현재 설정된 요일 === 클릭된 요일인 경우, 모든 요일이 선택 해제되기 때문에 아무 행동도 하지 않음. 
    } else {
      if (settedWeek.indexOf(weekValue) > -1) {
        settedWeek = settedWeek.replace(weekValue, '')
      } else {
        settedWeek = settedWeek + weekValue
      }

      settedWeek = sortWeek(settedWeek)
    }
  }

  if (morning !== null) {
    settedMorning = morningToKo(morning) || ''
  }

  if (hour !== null) {
    settedHour = hourToKo(hour)
  }

  if (min !== null) {
    settedMin = minToKo(min)
  }

  attachment.value = `매주 "${settedWeek}" 마다 "${settedMorning}" "${settedHour}"시 "${settedMin}"분`
}

const weekToKo = (week: string) => {
  switch (week) {
    case 'mon':
      return '월'
    case 'tue':
      return '화'
    case 'wed':
      return '수'
    case 'thu':
      return '목'
    case 'fri':
      return '금'
    case 'sat':
      return '토'
    case 'sun':
      return '일'
    default:
      return ''
  }
}

const hourToKo = (hour: string) => {
  return hour.replace('h', '')
}

const minToKo = (hour: string) => {
  return hour.replace('m', '')
}

const morningToKo = (morning: string) => {
  switch (morning) {
    case 'morning':
      return '오전'
    case 'afternoon':
      return '오후'
  }
  return ''
}

const sortWeek = (weeks: string) => {
  return weeks.split('').sort((lhs, rhs) => {
    return weekWeight(lhs) - weekWeight(rhs)
  }).join('')
}

const weekWeight = (week: string) => {
  switch (week) {
    case '월':
      return 1
    case '화':
      return 2
    case '수':
      return 3
    case '목':
      return 4
    case '금':
      return 5
    case '토':
      return 6
    case '일':
      return 7
  }
  return 0
}

module.exports = router