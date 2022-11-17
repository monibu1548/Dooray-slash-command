import { CommandDialogResponse } from "./commandDialogResponse"
import { CommandResponse } from "./commandReponse"

export interface InteractionTenant {
  id: string,
  domain: string
}

export interface InteractionChannel {
  id: string,
  name: string
}

export interface InteractionUser {
  id: string
}

export interface CommandInteraction {
  tenant: InteractionTenant,
  channel: InteractionChannel,
  user: InteractionUser,
  commandName: string,
  command: string,
  text: string,
  callbackId: string,
  actionName: string,
  actionValue: string,
  appToken: string,
  cmdToken: string,
  triggerId: string,
  commandRequestUrl: string,
  commandResponseUrl: string,
  channelLogId: string,
  originalMessage: CommandResponse
}

export function isInteraction(body: CommandInteraction | CommandDialogResponse): body is CommandInteraction {
  return (<CommandInteraction>body).channelLogId !== undefined;
}

export function isDialogResponse(body: CommandInteraction | CommandDialogResponse): body is CommandDialogResponse {
  return (<CommandDialogResponse>body).submission !== undefined;
}