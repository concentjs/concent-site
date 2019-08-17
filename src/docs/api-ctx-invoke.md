---
id: api-ctx-invoke
title: ctx.invoke
sidebar_label: ctx.invoke
---
___
`invoke`和`dispatch`本质上没有区别，都是触发一个函数，拿到该函数的返回结果作为新的片段状态提交给当前触发调用的实例，并提取模块状态广播给其他实例，唯一的不同就是`dispatch`可以呼叫事先规划在`reducer`里的函数，`invoke`允许用户直接呼叫自定义的函数

## 函数签名定义
```
invoke: (
  fn: (payload:any, moduleState:object, ctx:HandlerCtx)=>object | undefined, 
  payload?:any, 
  delay?:number, 
  renderKey?:string
)=>Promise<any>
```
> HandlerCtx移步[这里查看](api-type-handler-ctx)

## 参数解释
* fn<br/>
欲调用的函数
* payload<br/>
传递的参数
* delay<br/>
广播延迟时间，单位(ms)
* renderKey<br/>
触发渲染的目标渲染Key

## 在类里使用
### 独立调用
```
function  changeName(name){
  return {name};
}

@register('Foo', {module:'foo', connect:{bar:'*', baz:'*'}});
class Foo extends Component{
  changeBarName = (e)=>{
    this.$$invoke(changeName, e.currentTarget.value);
  }
}
```
### 链式调用
```
function setLoading(loading){
  return {loading};
}
function  changeName(name){
  return {name};
}

async function handelNameChanged(name, moduleState, ctx){
  await ctx.invoke(setLoading, true);
  await ctx.invoke(changeName, name);
  await ctx.invoke(setLoading, false);
}

@register('Foo', {module:'foo', connect:{bar:'*', baz:'*'}});
class Foo extends Component{
  changeBarName = (e)=>{
    this.$$invoke(handelNameChanged, e.currentTarget.value);
  }
}
```
### 混合调用
既调用自定义函数，也调用reducer函数
```
function  changeName(name){
  return {name};
}

async function handelNameChanged(name, moduleState, ctx){
  await ctx.dispatch('setLoading', true);
  await ctx.invoke(changeName, name);
  await ctx.dispatch('setLoading', false);
}

@register('Foo', {module:'foo', connect:{bar:'*', baz:'*'}});
class Foo extends Component{
  changeBarName = (e)=>{
    this.$$invoke(handelNameChanged, e.currentTarget.value);
  }
}
```
### 指定模块调用
```
function  changeName(name){
  return {name};
}

@register('Foo', {module:'foo', connect:{bar:'*', baz:'*'}});
class Foo extends Component{
  changeBarName = (e)=>{
    this.$$invoke({fn:changeName, module:'bar'}, e.currentTarget.value);
  }
}
```
>注意调用方实例属于`foo`模块，`this.$$invoke`触发的函数指定修改的是`bar`模块的数据，只有`bar`模块下关心`changeName`返回状态的实例会被触发渲染

## 在CcFragment里使用
```
<CcFragment render={()=>{
  
}}>
```