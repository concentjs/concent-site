---
id: api-top-dispatch
title: 派发
sidebar_label: dispatch
---
___
`dispatch`让用户可以调用reducer函数，从而触发对应的组件渲染，具体调用方式见[通用api-dispatch](api-common-dispatch)

## 函数签名
```
dispatch: (
  typeDescriptor:string, 
  payload?:object, 
  delay?:number, 
  identity?:string
)=>void
```

## 如何使用
```
import { dispatch } from 'concent';

// 调用foo模块的reducer函数'updateF1'，传递的payload参数为 {f1:'gogogo'}
dispatch('foo/updateF1', {f1:'gogogo'});

// 调用所有模块的'resetTime'方法
dispatch('*/resetTime');
```

## 何时使用
在cc类、reducer方法外部，想要调用某个模块的reducer方法时，使用dispatch去触发，同时因为顶层的`dispatch`支持模糊匹配调用，当你使用了模块克隆功能时，如果想集中的做一些清理工作，可以很方便的使用`*/{reducerFunctionName}`语法去调用
> 真实的业务场景里，推荐使用cc类实例里的`this.$$dispatch`、reducer函数参数列表里的`dispatch`，它们携带了调用实例的上下文信息，同时能够形成调用链，方便`concent`做集中式的提交状态任务的管理和优化

## console里使用
打开浏览器console窗口，输入cc.dispatch即可以console里使用该接口