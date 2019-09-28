// I know this is ugly and I shouldn't do this... but it works

declare const logger: import('../logger/Logger').default
declare const config: import('./Config').default
declare const connections: import('../ConnectionsManager').default
declare const discord: import('./DiscordGlobal').default
declare const messenger: import('./MessengerGlobal').default

declare namespace NodeJS {
  interface Global {
    logger?: import('../logger/Logger').default
    config?: import('./Config').default
    connections?: import('../ConnectionsManager').default
    discord?: import('./DiscordGlobal').default
    messenger?: import('./MessengerGlobal').default
  }
  interface Process {
    pkg?: any
  }
}
