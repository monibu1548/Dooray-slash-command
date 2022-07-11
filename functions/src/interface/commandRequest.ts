export interface CommandRequest {
  tenantId: string, // 커맨드가 등록된 테넌트의 ID
  tenantDomain: string, // 커맨드가 등록된 테넌트의 도메인
  channelId: string, // 커맨드가 요청한 대화방의 ID
  channelName: string, // 커맨드를 요청한 대화방의 이름
  userId: string, // 커맨드를 요청한 사용자 ID
  command: string,
  text: string,
  responseUrl: string,
  appToken: string,
  cmdToken: string,
  triggerId: string,
}