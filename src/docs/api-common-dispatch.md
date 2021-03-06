---
id: api-common-dispatch
title: dispatch
sidebar_label: dispatch
---

reducer函数参数列表里解构出的dispatch句柄方便用户调用其他reducer函数，方便用户将业务逻辑解耦为不同的reducer函数后，可以自由组合调用.
dispatch函数返回一个Promise对象，让你的dispatch调用可以串行执行

## 函数签名定义

```
type TypeDescriptor = {
  type: string,
  module?: string,
  reducerModule?: string,
};

dispatch: (
  type: string | TypeDescriptor,
  payload?:any, 
  renderKey?:string
  delay?:number, 
)=>Promise<any>
```

## 使用`type`调用，不含斜杠
大多数场景，推荐使用基于`type`直接调用reducer函数，dispatch句柄暗含了调用方的上下文（所属模块），concent会自动命中这个模块的命名为type的reducer函数去执行
```
// code in foo/reducer.js

export function setLoading(loading){
  return {loading};
}

export function updateF1(f1, _, {dispatch}){
  await dispatch('setLoading', true);
  await api.updateF1(f1);
  //下面两句话可以写为 return {f1, loading:false}，这样就只触发一次渲染
  await dispatch('setLoading', false);
  return {f1};
}
```

## 使用`moduleName/type`调用，含一个斜杠
用户可以显式的重设上下文的模块信息。
> 上面的updateF1在调用dispatch时，等同于如下写法
```
export function updateF1(f1, _, {dispatch}){
  await dispatch('foo/setLoading', true);
  await api.updateF1(f1);
  //下面两句话可以写为 return {f1, loading:false}，这样就只触发一次渲染
  await dispatch('foo/setLoading', false);
  return {f1};
}

```
如果你想调用其他模块的reducer函数，因为可以重设模块信息，就很方便了
> 使用`moduleName/type`告诉concent要调用bar模块的someModuleStateChanged方法
```
export function updateF1(f1, _, {dispatch}){
  await dispatch('bar/someModuleStateChanged', {changedKey:'f1', value:f1, module:'foo'});
  await dispatch('foo/setLoading', true);
  await api.updateF1(f1);
  await dispatch('foo/setLoading', false);
  return {f1};
}

```
通常情况下，foo模块的reducer只会由foo模块的cc实例触发调用，如果用户设计的这个模块会被其他模块的cc实例调用时：
> 解构出来的module就是调用方的module
```
export function updateF1(f1, _, {dispatch, module}){
  await dispatch('bar/someModuleStateChanged', {changedKey:'f1', value:f1, module});
}
```

## 使用`moduleName/reducerModule/type`调用，含两个斜杠
大多数时候，我们的reducer模块和state模块是放在一起的，但是因为concent允许配置一些通用的reducer函数，它们和state模块没关系，此时我们就可以用此语法来调用reducer
> 调用common模块下的track函数去修改foo模块的f1值
```
export function updateF1(f1, _, {dispatch}){
  await dispatch('foo/common/track', {f1});
}
```

## 使用`/reducerModule/type`调用，含两个斜杠，不指定数据模块
如果我们想修改的数据所属的模块的跟着调用方的上下文走
> 调用方cc实例属于哪个模块X，就调用common模块下的track函数去修改X模块的f1值
```
export function updateF1(f1, _, {dispatch}){
  await dispatch('/common/track', {f1});
}

// 等同于写为，调用实例所属的module在这里显式的再传递一次
export function updateF1(f1, _, {module, dispatch}){
  await dispatch(`${module}/common/track`, {f1});
}
```

## 设置renderKey参数
[参件setState](api-ctx-set-state)，含义是一样的

## 设置delay参数
delay参数单位为ms，表示当前dispatch函数修改了目标模块的状态后，是否延迟广播通知其他同样关心此模块的这些状态的cc实例<br />
默认是0，没有延迟，每一次的状态变更都会实时广播出去
> 以下写法表示，如果存在有其他关心bar模块的任意一个key `changedKey`、`value`、`module`的cc实例，它们都会在2秒后被触发渲染
```
// code in bar/reducer.js
export function someModuleStateChanged({changedKey:'f1', value:f1, module}){
  return {changedKey:'f1', value:f1, module};
}

export function updateF1(f1, _, {module, dispatch}){
  await dispatch('bar/someModuleStateChanged', {changedKey:'f1', value:f1, module}, null, 2000);
}
```
[更多用法参见setState](api-ctx-set-state)

## 使用TypeDescriptor调用
TypeDescriptor是一个描述type的对象，会决定怎么调用reducer，不用书写带斜杠的type string<br/>
```
type TypeDescriptor = {
  type: string,
  module?: string,
  reducerModule?: string,
};
```