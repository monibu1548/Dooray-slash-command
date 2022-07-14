export class RemindSchedule {
  weeks: Array<string>
  morning: string
  hour: string
  min: string

  constructor(
    message: string
  ) {
    const val = message.split('"')
    this.weeks = val[1].split('')
    this.morning = val[3]
    this.hour = val[5]
    this.min = val[7]
  }
}

export const nextScheduleTimestamp = (schedule: RemindSchedule) => {
  // 현재 요일 찾아두고

  // 시간 기준 으로 안지남
  // 스케줄 요일 중 오늘 요일의 직전 요일을 찾음
  // 

  // 시간 기준으로  지남
  // 스케줄 요일 중 오늘 요일의 다음 요일 찾음
}

export class RemindTask {
  id: string
  jobId: string
  schedule: RemindSchedule | null // null 이면 1회성
  tenantId: string
  tenantDomain: string
  userId: string
  cmdToken: string
  channelId: string
  channelName: string
  text: string

  constructor(
    id: string,
    jobId: string,
    schedule: RemindSchedule | null,
    tenantId: string,
    tenantDomain: string,
    userId: string,
    cmdToken: string,
    channelId: string,
    channelName: string,
    text: string
  ) {
    this.id = id
    this.jobId = jobId
    this.schedule = schedule
    this.tenantId = tenantId
    this.tenantDomain = tenantDomain
    this.userId = userId
    this.cmdToken = cmdToken
    this.channelId = channelId
    this.channelName = channelName
    this.text = text
  }
}

export class ScheduledJob {
  id: string
  taskId: string
  timestamp: number
  schedule: RemindSchedule | null // null 이면 1회성
  tenantId: string
  tenantDomain: string
  userId: string
  cmdToken: string
  channelId: string
  channelName: string
  text: string

  constructor(
    id: string,
    taskId: string,
    timestamp: number,
    schedule: RemindSchedule | null,
    tenantId: string,
    tenantDomain: string,
    userId: string,
    cmdToken: string,
    channelId: string,
    channelName: string,
    text: string
  ) {
    this.id = id
    this.taskId = taskId
    this.timestamp = timestamp
    this.schedule = schedule
    this.tenantId = tenantId
    this.tenantDomain = tenantDomain
    this.userId = userId
    this.cmdToken = cmdToken
    this.channelId = channelId
    this.channelName = channelName
    this.text = text
  }
}

