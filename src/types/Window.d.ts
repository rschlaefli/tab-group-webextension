/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/interface-name-prefix */

/// <reference types="chrome" />

declare interface Window {
  browser: any
  requestIdleCallback: Function
}

declare const browser: any
