---
id: api-ctx-invoke
title: ctx.invoke
sidebar_label: ctx.invoke
---
___
`invoke`和`dispatch`本质上没有区别，都是触发一个函数，拿到该函数的返回结果作为新的片段状态提交给当前触发调用的实例，并提取模块状态广播给其他实例，唯一的不同就是`dispatch`可以呼叫事先规划在`reducer`里的函数，`invoke`允许用户直接呼叫自定义的函数

## 函数签名定义
```
type InvokeFn = (payload:any, moduleState:object, ctx:HandlerCtx)=>object | undefined;
type InvokeObj = {fn:InvokeFn, module:string};

invoke: (
  fnOrObj: InvokeFn | InvokeObj, 
  payload?:any, 
  renderKey?:string
  delay?:number, 
)=>Promise<any>
```
> HandlerCtx移步[这里查看](api-type-handler-ctx)

## 参数解释
* fn<br/>
欲调用的函数
* payload<br/>
传递的参数
* renderKey<br/>
触发渲染的目标渲染Key
* delay<br/>
广播延迟时间，单位(ms)

## 如何使用
### 在Class里调用
```jsx
function  changeName(name){
  return {name};
}

@register({module:'foo', connect:{bar:'*', baz:'*'}}, 'Foo');
class Foo extends Component{
  changeBarName = (e)=>{
    //修改foo模块的数据, 写法1
    this.ctx.invoke(changeName, e.currentTarget.value);

    //修改foo模块的数据，写法2，因当前类属于foo，
    //调用方法时上下文默认修改的就是foo模块的数据，所以推荐用写法1
    this.ctx.invoke({module:'foo', fn:changeName}, e.currentTarget.value);

    //修改其他模块(如 bar)的数据
    //注意bar模块的state里也含有stateKey：name
    this.ctx.invoke({module:'bar', fn:changeName}, e.currentTarget.value);
  }
}
```
> 注意调用方实例属于`foo`模块，`this.ctx.invoke`触发的函数指定修改的是`bar`模块的数据的时候，只有`bar`模块下关心`changeName`函数返回状态的实例会被触发渲染


### 在RenderProps里使用
#### 在UI函数里定义并调用
```jsx
//直接在回调定义函数
registerDumb({module:'foo', connect:{bar:'*', baz:'*'}}, 'Foo')(ctx=>{
  const handleNameChanged = e=> ctx.invoke(changeName, e.currentTarget.value);

  return <input value={ctx.state.name} onChange={handleNameChanged} />
});
```
#### 在mapProps里定义并调用
```jsx
//定义mapProps, 组件每次渲染前都被调用，返回结果传递给组件的props
const mapProps = ctx=>{
  const handleNameChanged = e=> ctx.invoke(changeName, e.currentTarget.value);
  return {name:ctx.state.name, handleNameChanged};
}

registerDumb({module:'foo', connect:{bar:'*', baz:'*'}, mapProps}, 'Foo')(
({name, handleNameChanged})=>{
  return <input value={name} onChange={handleNameChanged} />
});
```
#### 在setup里定义并调用
```jsx
//定义setup，只在组件初次渲染前被调用一次，返回结果放置在ctx.settings里
const setup = ctx=>{
  const handleNameChanged = e=> ctx.invoke(changeName, e.currentTarget.value);
  return {handleNameChanged}
}

const mapProps = ctx=>{
  const handleNameChanged = ctx.settings.handleNameChanged;
  return {name:ctx.state.name, handleNameChanged};
}

registerDumb({module:'foo', connect:{bar:'*', baz:'*'}, mapProps}, 'Foo')(
({name, handleNameChanged})=>{
  return <input value={name} onChange={handleNameChanged} />
});

```

### 组合多个invoke调用
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
    this.ctx.invoke(handelNameChanged, e.currentTarget.value);
  }
}
```

### 混合dispatch调用
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
    this.ctx.invoke(handelNameChanged, e.currentTarget.value);
  }
}
```
> invoke提供了一种更自由的方式组织业务代码，但是如果项目里修改模块状态都是走reducer的话，建议统一走reducer，当然用户可以根据一些特殊场景的需要或者个人喜好，走invoke组织业务代码的方式。

## 在CcFragment里使用
```
<CcFragment render={()=>{
  
}}>
```