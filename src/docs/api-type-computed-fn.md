---
id: api-type-computed-fn
title: ComputedFn
sidebar_label: ComputedFn
---
___
## 类型参数定义
```
type ComputedFn = (
  newVal: any, 
  oldVal: any,
  keyDesc: {
    key:string,
    module:string,
    moduleState:object,
  },
  ctx: CcFragmentCtx,
)=> any
```
