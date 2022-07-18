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

