export enum ResponseType {
  Ephemeral = 'ephemeral',
  InChannel = 'inChannel'
}

export interface AttachmentButtons {
  callbackId: string,
  title: string,
  actions: Array<AttachmentButtonAction> | null
}

export enum AttachmentActionType {
  Button = 'button',
  Dropdown = 'select'
}

export interface AttachmentButtonAction {
  name: string,
  type: AttachmentActionType,
  text: string,
  value: string,
  style: AttachmentButtonStyle
}

export enum AttachmentButtonStyle {
  Primary = 'primary',
  Danger = 'danger',
  default = 'default'
}

export interface AttachmentDropdown {
  actions: Array<AttachmentDropdownAction>
}

export interface AttachmentDropdownAction {
  name: string,
  text: string,
  type: AttachmentActionType,
  options: Array<AttachmentDropdownOption>
}

export interface AttachmentDropdownOption {
  type: AttachmentActionType,
  text: string,
  value: string
}

export interface AttachmentFields {
  fields: Array<AttachmentField>
}

export interface AttachmentField {
  title: string,
  value: string
}

export interface CommandResponse {
  text: string, // 메시지 내용
  responseType: ResponseType, // Ephemeral (나에게만 보이는 메시지), InChannel (채널에 공유되는 메시지)
  replaceOriginal: boolean, // 기존에 보낸 메시지를 업데이트 (알림 X)
  deleteOriginal: boolean, // 기존 메시지를 삭제하고 새로 전송 (알림 O)
  attachments: Array<AttachmentButtons | AttachmentDropdown | AttachmentFields> | null
}

export function isField(attachment: AttachmentButtons | AttachmentDropdown | AttachmentFields): attachment is AttachmentFields {
  return (<AttachmentFields>attachment).fields !== undefined;
}

export function isButton(attachment: AttachmentButtons | AttachmentDropdown | AttachmentFields): attachment is AttachmentButtons {
  return (<AttachmentButtons>attachment).callbackId !== undefined;
}

export function isDropdown(attachment: AttachmentButtons | AttachmentDropdown | AttachmentFields): attachment is AttachmentDropdown {
  return (<AttachmentDropdown>attachment).actions !== undefined;
}