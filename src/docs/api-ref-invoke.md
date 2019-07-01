---
id: api-ref-invoke
title: this.$$invoke
sidebar_label: this.$$invoke
---
___
`$$invoke`和`$$dispatch`本质上没有区别，都是触发一个函数，拿到该函数的返回结果作为新的片段状态提交给当前触发调用的实例，并提取模块状态广播给其他实例，唯一的不同就是`$$dispatch`可以呼叫实现规划在`reducer`里的函数，`$$invoke`允许用户直接呼叫自定义的函数

## 函数签名定义
```
this.$$invoke: (
  fn: (payload:any, moduleState:object, ctx:ReducerCtx)=>object | undefined, 
  payload?:object, 
  delay?:number, 
  identity?:string
)=>Promise<object>
```

## 参数解释
* fn<br/>
欲调用的函数