---
id: api-type-watch-fn
title: WatchFn
sidebar_label: WatchFn
---
___
## 类型参数定义
```
type WatchFn = (
  newVal: any, 
  oldVal: any,
  keyDesc: {
    key:string,
    module:string,
    moduleState:object,
  },
  ctx: CcFragmentCtx,
)=>bool | undefined
```
