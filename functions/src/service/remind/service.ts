import { CommandResponse, ResponseType } from "../../interface/commandReponse"
import { firebaseFirestore } from "../../lib/firebase"
import { RemindSchedule, RemindTask, ScheduledJob } from "./entity"
import axios from 'axios';
import { stagingLog } from "../../util/logger";
import { CommandInteraction } from "../../interface/commandInteraction";
import { CommandDialog } from "../../interface/commandDialog";
import { CommandDialogResponse } from "../../interface/commandDialogResponse";


// 수동 1회성 Task 등록
export const registerOnceManualTask = async (dialogResponse: CommandDialogResponse, message: string, timestamp: number) => {
  const task = new RemindTask(
    '',
    '',
    null,
    dialogResponse.tenant.id,
    dialogResponse.tenant.domain,
    dialogResponse.user.id,
    dialogResponse.cmdToken,
    dialogResponse.channel.id,
    dialogResponse.channel.name,
    message
  )

  const taskID = await firebaseFirestore
    .collection('remindTask')
    .add(JSON.parse(JSON.stringify(task)))
    .then((doc) => {
      return doc.id
    })
    .catch((err) => {
      stagingLog('[ADD ONCE TASK] error => ' + JSON.stringify(err))
      return ''
    })

  const jobID = await registerScheduledJob(taskID, task, timestamp)

  await firebaseFirestore
    .collection('remindTask')
    .doc(taskID)
    .set({
      id: taskID,
      jobId: jobID
    }, { merge: true })
    .catch((err) => {
      stagingLog('[UPDATE ONCE TASK ID] error => ' + JSON.stringify(err))
    })

  // TODO: 에러처리
  return true
}

// 1회성 Task 등록
export const registerOnceTask = async (request: CommandInteraction, min: string) => {

  const task = new RemindTask(
    '',
    '',
    null,
    request.tenant.id,
    request.tenant.domain,
    request.user.id,
    request.cmdToken,
    request.channel.id,
    request.channel.name,
    request.text
  )

  const taskID = await firebaseFirestore
    .collection('remindTask')
    .add(JSON.parse(JSON.stringify(task)))
    .then((doc) => {
      return doc.id
    })
    .catch((err) => {
      stagingLog('[ADD ONCE TASK] error => ' + JSON.stringify(err))
      return ''
    })


  const timestamp = new Date().getTime() + (+min * 60 * 1000) // ms 단위
  const jobID = await registerScheduledJob(taskID, task, timestamp)

  await firebaseFirestore
    .collection('remindTask')
    .doc(taskID)
    .set({
      id: taskID,
      jobId: jobID
    }, { merge: true })
    .catch((err) => {
      stagingLog('[UPDATE ONCE TASK ID] error => ' + JSON.stringify(err))
    })

  // TODO: 에러처리
  return true
}

// 주기성 Task 등록
export const registerPeriodicTask = async (request: CommandInteraction, scheduleMessage: string) => {
  stagingLog('[registerPeriodicTask] request => ' + JSON.stringify(request))
  stagingLog('[registerPeriodicTask] scheduleMessage => ' + scheduleMessage)

  const schedule = new RemindSchedule(scheduleMessage)

  const task = new RemindTask(
    '',
    '',
    schedule,
    request.tenant.id,
    request.tenant.domain,
    request.user.id,
    request.cmdToken,
    request.channel.id,
    request.channel.name,
    request.text
  )

  const taskID = await firebaseFirestore
    .collection('remindTask')
    .add(JSON.parse(JSON.stringify(task)))
    .then((doc) => {
      return doc.id
    })
    .catch((err) => {
      stagingLog('[ADD PERIODIC TASK] error => ' + JSON.stringify(err))
      return ''
    })

  // timestamp 계산해 넣기
  const timestamp = nextScheduleTimestamp(schedule)
  const jobID = await registerScheduledJob(taskID, task, timestamp)

  await firebaseFirestore
    .collection('remindTask')
    .doc(taskID)
    .set({
      id: taskID,
      jobId: jobID
    }, { merge: true })
    .catch((err) => {
      stagingLog('[UPDATE PERIODIC TASK ID] error => ' + JSON.stringify(err))
    })

  // TODO: 에러처리
  return true
}

// 다음 알림일정 계산. timestamp 반환 
export const nextScheduleTimestamp = (schedule: RemindSchedule) => {
  stagingLog('[nextScheduleTimestamp] called')
  var current = new Date(new Date().getTime() + (9 * 60 * 60 * 1000))

  var week = new Array('일', '월', '화', '수', '목', '금', '토');

  var todayWeek = week[current.getDay()]
  if (current.getHours() < 9) {
    todayWeek = week[current.getDay() + 1]
  }
  // 1.요일 비교

  stagingLog('[nextScheduleTimestamp] today: ' + todayWeek)
  stagingLog('[nextScheduleTimestamp] schedule.weeks: ' + schedule.weeks)
  stagingLog('[nextScheduleTimestamp] getHours: ' + current.getHours())
  stagingLog('[nextScheduleTimestamp] getHours + 9: ' + (current.getHours() + 9))
  if (schedule.weeks.indexOf(todayWeek) >= 0) {
    stagingLog('[nextScheduleTimestamp] 오늘이 대상일에 포함')
    // 오늘이 대상일에 포함된 경우

    // 시간이 이전인 경우
    var scheduleHour: number = 0
    if (schedule.morning === '오전') {
      scheduleHour = +schedule.hour
    } else {
      scheduleHour = +schedule.hour + 12
    }
    var scheduleMin = +schedule.min

    stagingLog('[nextScheduleTimestamp] scheduleHour:' + scheduleHour)
    stagingLog('[nextScheduleTimestamp] scheduleMin:' + scheduleMin)

    if (scheduleHour === current.getHours()) {
      stagingLog('[nextScheduleTimestamp] scheduleHour === current.getHours()')

      if (scheduleMin > current.getMinutes() + 1) {
        stagingLog('[nextScheduleTimestamp] scheduleMin > current.getMinutes() + 1')
        // 오늘, scheduleHour 시, schleduleMin 으로 timestamp 생성

        var targetDate = new Date()
        var diff = 0
        if (current.getHours() < 9) {
          diff += 1
        }

        targetDate.setDate(targetDate.getDate() + diff)
        targetDate.setHours(scheduleHour)
        targetDate.setMinutes(scheduleMin, 0, 0)
        return targetDate.getTime() - (9 * 60 * 60 * 1000)
      } else {
        stagingLog('[nextScheduleTimestamp] scheduleMin <= current.getMinutes() + 1')
        // 시간이 지난 경우와 동일하게 처리.
        var weeks = schedule.weeks
        const sorted = sortedWeek(weeks)
        const index = sorted.indexOf(todayWeek)

        var nextWeek: string
        if (weeks.length - 1 == index) {
          nextWeek = sorted[0]
        } else {
          nextWeek = sorted[index + 1]
        }

        // diff: n일 뒤가 목표 일
        var diff = weekWeight(nextWeek) - weekWeight(todayWeek)
        if (diff <= 0) {
          diff += 7
        }

        stagingLog('[nextScheduleTimestamp] diff:' + diff)

        var scheduleHour: number = 0
        if (schedule.morning === '오전') {
          scheduleHour = +schedule.hour
        } else {
          scheduleHour = +schedule.hour + 12
        }
        var scheduleMin = +schedule.min

        var targetDate = new Date()
        // 날짜 설정 시 KTC Date hour가 0 ~ 9 인 경우 (== UTC로는 전날인 경우 setDate 시 -1일이 되므로), 하루 보정
        if (current.getHours() < 9) {
          diff += 1
        }

        targetDate.setDate(targetDate.getDate() + diff)
        targetDate.setHours(scheduleHour)
        targetDate.setMinutes(scheduleMin, 0, 0)

        // 현재 날짜 + n일, 알림 시,분 설정하여 timestamp 계산
        return targetDate.getTime() - (9 * 60 * 60 * 1000)
      }

    } else if (scheduleHour > current.getHours()) {
      stagingLog('[nextScheduleTimestamp] scheduleHour > current.getHours()')
      // 오늘, scheduleHour 시, schleduleMin 으로 timestamp 생성

      var targetDate = new Date()

      var diff = 0
      // 날짜 설정 시 KTC Date hour가 0 ~ 9 인 경우 (== UTC로는 전날인 경우 setDate 시 -1일이 되므로), 하루 보정
      if (current.getHours() < 9) {
        diff += 1
      }

      targetDate.setDate(targetDate.getDate() + diff)
      targetDate.setHours(scheduleHour)
      targetDate.setMinutes(scheduleMin, 0, 0)
      return targetDate.getTime() - (9 * 60 * 60 * 1000)
    } else if (scheduleHour < current.getHours()) {
      stagingLog('[nextScheduleTimestamp] scheduleHour < current.getHours()')
      // 시간이 지난 경우와 동일하게 처리.
    }

    // 시간이 지난 경우
    var weeks = schedule.weeks

    stagingLog('[nextScheduleTimestamp] weeks: ' + weeks.join(', '))

    const index = weeks.indexOf(todayWeek)

    stagingLog('[nextScheduleTimestamp] index: ' + index)

    var nextWeek: string
    if (weeks.length - 1 == index) {
      nextWeek = weeks[0]
    } else {
      nextWeek = weeks[index + 1]
    }

    stagingLog('[nextScheduleTimestamp] nextWeek: ' + nextWeek)
    stagingLog('[nextScheduleTimestamp] todayWeek: ' + todayWeek)

    // diff: n일 뒤가 목표 일
    var diff = weekWeight(nextWeek) - weekWeight(todayWeek)
    if (diff <= 0) {
      diff += 7
    }

    stagingLog('[nextScheduleTimestamp] diff: ' + diff)

    var scheduleHour: number = 0
    if (schedule.morning === '오전') {
      scheduleHour = +schedule.hour

    } else {
      scheduleHour = +schedule.hour + 12
    }
    var scheduleMin = +schedule.min

    var targetDate = new Date()

    // 날짜 설정 시 KTC Date hour가 0 ~ 9 인 경우 (== UTC로는 전날인 경우 setDate 시 -1일이 되므로), 하루 보정
    if (current.getHours() < 9) {
      diff += 1
    }

    targetDate.setDate(targetDate.getDate() + diff)
    targetDate.setHours(scheduleHour)
    targetDate.setMinutes(scheduleMin, 0, 0)

    // 현재 날짜 + n일, 알림 시,분 설정하여 timestamp 계산

    stagingLog('[nextScheduleTimestamp] return :' + (targetDate.getTime() - (9 * 60 * 60 * 1000)))
    return targetDate.getTime() - (9 * 60 * 60 * 1000)
  } else {
    stagingLog('[nextScheduleTimestamp] 오늘이 미포함인 경우')
    // 가장 빠른 대상 요일이 몇일 뒤인지. 
    var weeks = JSON.parse(JSON.stringify(schedule.weeks)) as string[]

    weeks.push(todayWeek)
    const sorted = sortedWeek(weeks)
    const index = sorted.indexOf(todayWeek)

    var nextWeek: string
    if (weeks.length - 1 == index) {
      nextWeek = sorted[0]
    } else {
      nextWeek = sorted[index + 1]
    }

    // diff: n일 뒤가 목표 일
    var diff = weekWeight(nextWeek) - weekWeight(todayWeek)
    if (diff <= 0) {
      diff += 7
    }

    stagingLog('[nextScheduleTimestamp] diff:' + diff)

    var scheduleHour: number = 0
    if (schedule.morning === '오전') {
      scheduleHour = +schedule.hour

    } else {
      scheduleHour = +schedule.hour + 12
    }
    var scheduleMin = +schedule.min

    var targetDate = new Date()

    // 날짜 설정 시 KTC Date hour가 0 ~ 9 인 경우 (== UTC로는 전날인 경우 setDate 시 -1일이 되므로), 하루 보정
    if (current.getHours() < 9) {
      diff += 1
    }
    targetDate.setDate(targetDate.getDate() + diff)
    targetDate.setHours(scheduleHour)
    targetDate.setMinutes(scheduleMin, 0, 0)

    // 현재 날짜 + n일, 알림 시,분 설정하여 timestamp 계산
    stagingLog('[nextScheduleTimestamp] result: ' + (targetDate.getTime() - (9 * 60 * 60 * 1000)))
    return targetDate.getTime() - (9 * 60 * 60 * 1000)
  }
}

const sortedWeek = (weeks: Array<string>) => {
  return weeks.sort((lhs, rhs) => {
    return weekWeight(lhs) - weekWeight(rhs)
  })
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


// Scheduled Job 등록
const registerScheduledJob = async (taskId: string, task: RemindTask, timestamp: number) => {
  const scheduledJob = new ScheduledJob(
    '',
    taskId,
    timestamp,
    task.schedule,
    task.tenantId,
    task.tenantDomain,
    task.userId,
    task.cmdToken,
    task.channelId,
    task.channelName,
    task.text
  )

  const docID = await firebaseFirestore
    .collection('scheduledJob')
    .add(JSON.parse(JSON.stringify(scheduledJob)))
    .then((doc) => {
      return doc.id
    })
    .catch((err) => {
      stagingLog('[REGISTER SCHEDULED JOB] error => ' + JSON.stringify(err))
      return 's'
    })

  await firebaseFirestore
    .collection('scheduledJob')
    .doc(docID)
    .set({
      id: docID
    }, { merge: true })
    .catch((err) => {
      stagingLog('[UPDATE SCHEDULED JOB ID] error => ' + JSON.stringify(err))
    })

  return docID
}

export const run = async () => {
  const targetJobs = await runToList()

  var jobs: Promise<any>[] = []
  for (const job of targetJobs) {
    jobs.push(executeJob(job))
  }

  stagingLog(`[RUN] ${jobs.length}개 job을 수행합니다`)

  if (jobs.length > 0) {
    return await Promise.all(jobs)
  } else {
    return await Promise.resolve()
  }
}

// 실행시켜야 하는 Job 목록 조회
const runToList = async () => {
  const currentAtMs = new Date().getTime()

  const jobList = await firebaseFirestore
    .collection('scheduledJob')
    .where('timestamp', '<=', currentAtMs)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return []
      }

      var jobs = Array<ScheduledJob>()

      for (const doc of snapshot.docs) {
        const job = doc.data() as ScheduledJob
        jobs.push(job)
      }

      return jobs
    })

  return jobList
}

export const messageToChannel = async (message: string, tenantDomain: string, cmdToken: string, channelId: string, responseType: ResponseType) => {
  const url = `https://${tenantDomain}/messenger/api/commands/hook/${cmdToken}`

  const response = {
    channelId: channelId,
    responseType: responseType,
    text: message,
    attachments: [],
    replaceOriginal: false,
    deleteOriginal: false

  } as CommandResponse

  return await axios.post(url, response)
}
// Job 실행
const executeJob = async (job: ScheduledJob) => {
  const url = `https://${job.tenantDomain}/messenger/api/commands/hook/${job.cmdToken}`

  const response = {
    channelId: job.channelId,
    responseType: ResponseType.InChannel,
    text: `${job.text}\n\n⏰ ${getUserMention(job.userId, job.tenantId)}님의 리마인더 ⏰`,
    attachments: [],
    replaceOriginal: false,
    deleteOriginal: false

  } as CommandResponse

  await axios.post(url, response)

  if (job.schedule === null) {
    // task 삭제
    const deleteTask = firebaseFirestore
      .collection('remindTask')
      .doc(job.taskId)
      .delete()
      .then(() => { return true })
      .catch(() => { return false })

    const deleteJob = firebaseFirestore
      .collection('scheduledJob')
      .doc(job.id)
      .delete()
      .then(() => { return true })
      .catch(() => { return false })

    return Promise.all([deleteTask, deleteJob])

  } else {
    // 다음 task 등록
    const nextTimestamp = nextScheduleTimestamp(job.schedule)

    return firebaseFirestore
      .collection('scheduledJob')
      .doc(job.id)
      .set({
        timestamp: nextTimestamp
      }, { merge: true })
      .then(() => { return true })
      .catch(() => { return false })
  }
}

const getUserMention = (userId: string, tenantId: string) => {
  return `(dooray://${tenantId}/members/${userId} "member")`;
}

// 해당 채널의 task 목록 조회
export const registeredTaskListInChannel = async (tenantId: string, channelId: string) => {
  const jobs = await firebaseFirestore
    .collection('scheduledJob')
    .where('tenantId', '==', tenantId)
    .where('channelId', '==', channelId)
    .get()
    .then((shanshot) => {
      if (shanshot.empty) {
        return []
      }

      var jobs = Array<ScheduledJob>()

      for (const doc of shanshot.docs) {
        const job = doc.data() as ScheduledJob
        jobs.push(job)
      }

      return jobs
    })
    .catch(() => { return [] })

  var text = `현재 채널에 등록된 리마인더 ${jobs.length}개\n`

  for (const job of jobs) {
    text += `
        리마인더ID: ${job.taskId}
        메시지: ${job.text}
        반복 설정: ${scheduleText(job.schedule)}
        다음 알림 예정: ${nextRemindText(job)}
        등록자: ${getUserMention(job.userId, tenantId)}
        ___
      `
  }

  return text
}

const scheduleText = (schedule: RemindSchedule | null) => {
  if (schedule === null) {
    return '한번만'
  }

  return `매주 ${schedule.weeks.join(', ')} ${schedule.morning} ${schedule.hour}시 ${schedule.min}분`
}

const nextRemindText = (job: ScheduledJob) => {
  const date = new Date(job.timestamp + (9 * 60 * 60 * 1000))
  return date.toLocaleString()
}

export const removeTask = async (taskID: string) => {
  const removeJob = firebaseFirestore
    .collection('scheduledJob')
    .where('taskId', '==', taskID)
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        return false
      }

      var removeDocs = Array<Promise<boolean>>()

      for (const doc of snapshot.docs) {

        const removeJob = doc.ref.delete()
          .then(() => { return true })
          .catch(() => { return false })

        removeDocs.push(removeJob)
      }

      return removeDocs
    })
    .catch(() => { false })

  const removeTask = firebaseFirestore
    .collection('remindTask')
    .doc(taskID)
    .delete()
    .then(() => { return true })
    .catch(() => { return false })

  return Promise.all([removeJob, removeTask])
}

export const showManualInputDialog = async (request: CommandInteraction) => {
  stagingLog('[request] ' + request)

  const commandResponseUrl = new URL(request.responseUrl)

  stagingLog('[URL] ' + commandResponseUrl)
  stagingLog('[URL host] ' + commandResponseUrl.host)
  stagingLog('[URL hostname] ' + commandResponseUrl.hostname)

  return await axios.post(`https://${commandResponseUrl.host}/messenger/api/channels/${request.channel.id}/dialogs`, {
    token: request.cmdToken,
    triggerId: request.triggerId,
    callbackId: request.callbackId,
    dialog: {
      callbackId: request.callbackId,
      title: request.text,
      submitLabel: '생성',
      elements: [
        {
          type: 'text',
          subtype: 'string',
          label: '메시지 내용을 작성해주세요',
          name: 'message',
          value: request.text,
          placeholder: '메시지 내용을 작성해주세요',
          minLength: 1,
          maxLength: 100,
          hint: '메시지 내용을 작성해주세요',
          optional: false
        },
        {
          type: 'text',
          subtype: 'string',
          label: '메시지를 보낼 날짜, 시간을 입력해주세요',
          name: 'manual',
          value: '',
          placeholder: 'yyyy/MM/dd HH:mm 형식으로 입력해주세요. ex) 2022/12/22 15:30',
          minLength: 16,
          maxLength: 16,
          hint: 'yyyy/MM/dd HH:mm 형식으로 입력해주세요. ex) 2022/12/22 15:30',
          optional: false
        }
      ]
    }
  } as CommandDialog, {
    headers: {
      token: request.cmdToken
    }
  })
}