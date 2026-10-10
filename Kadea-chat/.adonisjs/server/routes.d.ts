import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'email.verification.notice': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'email.verification.notice': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'email.verification.notice': { paramsTuple?: []; params?: {} }
    'home': { paramsTuple?: []; params?: {} }
    'email.verify': { paramsTuple: [ParamValue]; params: {'token': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'dashboard': { paramsTuple?: []; params?: {} }
    'password_resets.create': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'password_resets.store': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}