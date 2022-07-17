import { CommandResponse, ResponseType } from "../../interface/commandReponse"
import { firebaseFirestore } from "../../lib/firebase"
import { RemindSchedule, RemindTask, ScheduledJob } from "./entity"
import axios from 'axios';
import { stagingLog } from "../../util/logger";
import { CommandInteraction } from "../../interface/commandInteraction";

// 1회성 Task 등록
export const registerOnceTask = async (request: CommandInteraction, min: string) => {
  stagingLog('[registerOnceTask] request => ' + JSON.stringify(request))
  stagingLog('[registerOnceTask] min => ' + min)

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
const nextScheduleTimestamp = (schedule: RemindSchedule) => {
  const current = new Date()

  var week = new Array('일', '월', '화', '수', '목', '금', '토');

  var todayWeek = week[current.getDay()]
  // 1.요일 비교
  if (schedule.weeks.indexOf(todayWeek) >= 0) {
    // 오늘이 대상일에 포함된 경우

    // 시간이 이전인 경우
    var scheduleHour: number
    if (schedule.morning === 'morning') {
      scheduleHour = +schedule.hour
    } else {
      scheduleHour = +schedule.hour + 12
    }
    var scheduleMin = +schedule.min

    if (scheduleHour === current.getHours()) {
      if (scheduleMin > current.getMinutes()) {
        // 오늘, scheduleHour 시, schleduleMin 으로 timestamp 생성
      } else {
        // 시간이 지난 경우와 동일하게 처리.
      }

    } else if (scheduleHour > current.getHours()) {
      // 오늘, scheduleHour 시, schleduleMin 으로 timestamp 생성
    } else if (scheduleHour < current.getHours()) {
      // 시간이 지난 경우와 동일하게 처리.
    }



    // 시간이 지난 경우
  } else {
    // 가장 빠른 대상 요일이 몇일 뒤인지. 

    // 현재 날짜 + n일, 알림 시,분 설정하여 timestamp 계산

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

// Job 실행
const executeJob = async (job: ScheduledJob) => {
  const url = `https://${job.tenantDomain}/messenger/api/commands/hook/${job.cmdToken}`

  const response = {
    channelId: job.channelId,
    responseType: ResponseType.InChannel,
    text: `${job.text}\n⏰ ${getUserMention(job.userId, job.tenantId)}님의 리마인더 ⏰`,
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
  }

  return Promise.all([])
}

const getUserMention = (userId: string, tenantId: string) => {
  return `(dooray://${tenantId}/members/${userId} "member")`;
}

// 해당 채널의 task 목록 조회
export const registeredTaskListInChannel = async (tenantId: string, channelId: string) => {
  const tasks = await firebaseFirestore
    .collection('remindTask')
    .where('tenantId', '==', tenantId)
    .where('channelId', '==', channelId)
    .get()
    .then((shanshot) => {
      if (shanshot.empty) {
        return []
      }

      var tasks = Array<RemindTask>()

      for (const doc of shanshot.docs) {
        const task = doc.data() as RemindTask
        tasks.push(task)
      }

      return tasks
    })
    .catch(() => { return [] })

  var text = `현재 채널에 등록된 리마인더 ${tasks.length}개\n`

  for (const task of tasks) {
    text += `
        id: ${task.id}
        text: ${task.text}
        schedule: ${JSON.stringify(task.schedule)}
        author: ${getUserMention(task.userId, tenantId)}
        ___
      `
  }

  return text
}
