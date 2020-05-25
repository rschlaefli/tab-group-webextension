/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="chrome" />

declare interface Window {
  browser: any
  requestIdleCallback: any
  optionsSync: any
}

declare const browser: any
