import { InteractionChannel, InteractionTenant, InteractionUser } from "./commandInteraction";

export interface CommandDialogResponse {
  type: string,
  tenant: InteractionTenant,
  chnnel: InteractionChannel,
  user: InteractionUser,
  responseUrl: string,
  cmdToken: string,
  updateCmdToken: string,
  prevCmdToken: string,
  callbackId: string,
  submission: Map<string, string>
}
