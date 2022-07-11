export enum ResponseType {
  Ephemeral = 'ephemeral',
  InChannel = 'inChannel'
}

export interface AttachmentButtons {
  callbackId: string,
  title: string,
  actions: [AttachmentButtonAction] | null
}

export enum AttachmentButtonActionType {
  Button = 'button'
}

export interface AttachmentButtonAction {
  name: string,
  type: AttachmentButtonActionType,
  text: string,
  value: number
}

export interface CommandResponse {
  text: string, // 메시지 내용
  responseType: ResponseType, // Ephemeral (나에게만 보이는 메시지), InChannel (채널에 공유되는 메시지)
  replaceOriginal: boolean, // 기존에 보낸 메시지를 업데이트 (알림 X)
  deleteOriginal: boolean, // 기존 메시지를 삭제하고 새로 전송 (알림 O)
  attachments: [AttachmentButtons] | null
}