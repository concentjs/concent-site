---
id: api-type-handler-ctx
title: HandlerCtx
sidebar_label: HandlerCtx
---
___
## 出现场合
 - `PartialStateGenerationFunction` 定义
 ```
 (payload:any, moduleState:object, handlerCtx:HandlerCtx)=> object | undefined
 ```

 ## 类型参数定义
 ```
 type HandlerCtx = {
   invoke:(
      fn:PartialStateGenerationFunction|{fn:PartialStateGenerationFunction, module:string}, 
      payload?:any,
      delay?:number,
      identity?:string,
    )=>Promise<object>,

    lazyInvoke:(
      fn:PartialStateGenerationFunction|{fn:PartialStateGenerationFunction, module:string}, 
      payload?:any,
      delay?:number,
      identity?:string,
    )=>Promise<object>,

    dispatch:(
      typeDescriptor:string | ReducerFunction, 
      payload?:any,
      delay?:number,
      identity?:string,
    )=>Promise<object>,

    lazyDispatch:(
      typeDescriptor:string | ReducerFunction, 
      payload?:any,
      delay?:number,
      identity?:string,
    )=>Promise<object>,

    connectedState:{[moduleName:string]:object},
    rootState:{[moduleName:string]:object},
    globalState:object,
    moduleState:object,
    moduleComputed:object,
    connectedComputed:{[moduleName:string]:{[stateKey:string]:any}},
    refState:object,
 };
 ```