// Service Router, 서비스 추가할 경우 path 추가 필요
export enum ServicePath {
  Hi = "/hi",
  Remind = '/remind'
}

// 슬래시 커맨드에서 필요한 end point 2개
export enum EndPoint {
  Request = "/",
  Interaction = "/interaction"
}