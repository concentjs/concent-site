---
id: api-type-ref-ctx
title: RefCtx
sidebar_label: RefCtx
---
所有的cc组件，不管是由`register`、`registerDumb`、`registerHook`创建的，还是基于`CcFragment`和`useConcent`直接声明的，都包含着一个实例上下文对象

```
type RefCtx = {
  module: string, //cc实例所属模块
  ccClassKey: string,
  ccKey: string,
  ccUniqueKey: string,
  renderCount: number,
  initTime: number,
  storedKeys: string[],
  watchedKeys: string[],
  connect: {[moduleName:string]: string[]},
  ccOption:{
    storedKeys: string[] | '*',
    persistStoredKeys: boolean,
  },

  props: object,
  prevState: object,
  state: object,
  moduleState: object,
  globalState: object,
  connectedState:{
    [moduleName:string]: object,
  },

  refComputed:{
    [stateKey:string]: object,
  },
  refConnectedComputed:{
    [moduleName:string]: {
      [stateKey:string]: object
    },
  },
  moduleComputed:{
    [stateKey:string]: object,
  },
  globalComputed:{
    [stateKey:string]: object,
  },
  connectedComputed:{
    [moduleName:string]: {
      [stateKey:string]: object
    },
  },

  mapped: object,
}
```
