---
id: api-type-partial-state-fn
title: PartialStateFn
sidebar_label: PartialStateFn
---

`PartialStateFn`就是能被`dispatch`或者`invoke`直接调用的函数。

 ## 类型参数定义
 ```
 type PartialStateFn = (
   payload:any,
   moduleState:object,
   refCtx:RefCtx,//cc实例上下文
 )
 ```
