import { IS_STAGING } from "../lib/environments";

export function stagingLog(log: any) {
  if (IS_STAGING) {
    console.log(log)
  }
}