export interface CommandRequest {
  tenantId: string, // 커맨드가 등록된 테넌트의 ID
  tenantDomain: string, // 커맨드가 등록된 테넌트의 도메인
  channelId: string, // 커맨드가 요청한 대화방의 ID
  channelName: string, // 커맨드를 요청한 대화방의 이름
  userId: string, // 커맨드를 요청한 사용자 ID
  command: string, // 요청한 커맨드
  text: string, // 커맨드와 함께 입력한 텍스트
  responseUrl: string, // 커맨드 요청에 응답할 수 있는 웹 훅 URL
  appToken: string, // 등록한 앱의 토큰. 정상 요청인지 검증할 때 사용
  cmdToken: string, // API 호출 시에 사용하는 Token
  triggerId: string, // 다이얼로그에 사용하는 값
}