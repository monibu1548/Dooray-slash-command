export interface Dialog {
  callbackId: string,
  title: string,
  submitLabel: string,
  elements: Array<DialogElementText | DialogElementSelect | DialogElementTextarea>
}

export interface DialogElementText {
  type: string,    // text
  subtype: string,
  label: string,
  name: string,
  value: number,
  minLength: number,
  maxLength: number,
  placeholder: string,
  hint: string,
  optional: boolean
}

export interface DialogElementTextarea {
  type: string, // textarea
  label: string,
  name: string,
  optional: boolean
}

export interface DialogElementSelect {
  type: string, // 'select'
  label: string,
  name: string,
  value: string,
  optional: boolean,
  options: Array<DialogElementSelectOption>
}

export interface DialogElementSelectOption {
  label: string,
  value: string
}

export interface CommandDialog {
  token: string,
  triggerId: string,
  callbackId: string,
  dialog: Dialog
}