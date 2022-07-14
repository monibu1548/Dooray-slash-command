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

  stagingLog('[registerOnceTask] task => ' + JSON.stringify(task))

  const taskID = await firebaseFirestore
    .collection('remindTask')
    .add(task)
    .then((doc) => {
      stagingLog('[ADD ONCE TASK] success => ' + JSON.stringify(doc.id))
      return doc.id
    })
    .catch((err) => {
      stagingLog('[ADD ONCE TASK] error => ' + JSON.stringify(err))
      return ''
    })

  stagingLog('[registerOnceTask] taskID => ' + taskID)

  const timestamp = new Date().getTime() + (+min * 60 * 1000) // ms 단위
  const jobID = await registerScheduledJob(taskID, task, timestamp)

  await firebaseFirestore
    .collection('remindTask')
    .doc(taskID)
    .set({
      id: taskID,
      jobId: jobID
    }, { merge: true })
    .then((result) => {
      stagingLog('[UPDATE ONCE TASK ID] success => ' + JSON.stringify(result))
    })
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
      stagingLog('[ADD PERIODIC TASK] success => ' + JSON.stringify(doc.id))
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
    .then((result) => {
      stagingLog('[UPDATE PERIODIC TASK ID] success => ' + JSON.stringify(result))
    })
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
      stagingLog('[REGISTER SCHEDULED JOB] success => ' + JSON.stringify(doc.id))
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
    .then((doc) => {
      stagingLog('[UPDATE SCHEDULED JOB ID] success => ' + JSON.stringify(doc))
    })
    .catch((err) => {
      stagingLog('[UPDATE SCHEDULED JOB ID] error => ' + JSON.stringify(err))
    })

  return docID
}


// 실행시켜야 하는 Job 목록 조회
export const runToList = async () => {
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

  stagingLog('[runToList] ' + JSON.stringify(jobList))
  return jobList
}


// Job 실행
export const executeJob = async (job: ScheduledJob) => {
  const url = `https://${job.tenantDomain}/messenger/api/commands/hook/${job.cmdToken}`

  const response = {
    channelId: job.channelId,
    responseType: ResponseType.InChannel,
    text: job.text,
    attachments: [],
    replaceOriginal: false,
    deleteOriginal: false

  } as CommandResponse

  const result = await axios.post(url, response)

  stagingLog('[execute job] ' + JSON.stringify(result))


  if (job.schedule === null) {
    // task 삭제

    firebaseFirestore
      .collection('remindTask')
      .doc(job.taskId)
      .delete()

    firebaseFirestore
      .collection('scheduledJob')
      .doc(job.id)
      .delete()

  } else {
    // 다음 task 등록
  }

}