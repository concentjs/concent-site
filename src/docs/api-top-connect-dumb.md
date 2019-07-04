---
id: api-top-connect-dumb
title: 连接函数组件
sidebar_label: connectDumb
---
___
`connectDumb`提供能力连接你的函数组件和`store`，方便你既想写函数组价，又想获得`concent`提供的全部功能支持

## 函数签名定义
```
connectDumb: ({
  module?:string,
  watchedKeys?:string[] | '*',
  connect?:ConnectSpec,
  setup: (ctx)=>settings:object,
  mapState:(ctx)=> mappedState:object
})=> (fn:(props:{mappedState:object, ctx:CcFragmentCtx})=>ReactDom) => wrappedComponent:CcFragment

connectDumb: ({
  module?:string,
  watchedKeys?:string[] | '*',
  connect?:ConnectSpec,
  setup: (ctx)=>settings:object,
  mapProps:(ctx)=> mappedProps:object
})=> (fn:(props:MappedProps)=>ReactDom) => wrappedComponent:CcFragment
```

## 参数解释
* module<br/>
`CcFragment`实例所属的模块
* watchedKeys<br/>
`CcFragment`实例观察模块里的哪些key值变化，不设置此值的话，默认是`*`，即所属模块的任意key值发生变化都会触发改实例渲染
* connect<br/>
要连接的模块，除了指定实例的专属模块，还可以通过指定`connect`连接其他模块
* mapState<br/>
提供的回调，让用户可以挑选`connectedState`做2次计算与封装
> 注意使用mapState时，包裹的函数的参数列表是
```
const UIForMapState = ({mappedState, ctx})=>{
  //mappedState及是mapState函数返回的结果
  //ctx即实例的上下文
}
```
* mapProps<br/>
提供的回调，让用户可以挑选`connectedState`做2次计算与封装
> 注意使用mapProps时，包裹的函数的参数列表是mappedProps，区别于`mapState`，`mapProps`让函数组件更纯粹，保持对ctx上下文不可见
```
const UIForMapProps = (mappedProps)=>{
  //mappedProps即是mapProps函数返回的结果
}
```

## 如何使用
[在线示例](https://stackblitz.com/edit/ccapi-top-connect-dumb-1)
### 使用mapState对所有的状态的做二次处理
```
import {connectDumb} from 'concent';

const MyDumb = ({ mappedState, ctx }) => {
  const [localF1, f1Setter] = ctx.hook.useState('');
  return (
    <div style={st1}>
      <p>f1: {mappedState.f1}</p>
      <p>f2: {mappedState.f2}</p>
      <br />
      <input placeholder="输入临时f1" value={localF1} onChange={f1Setter} />
      <button onClick={ctx.sync('f1', localF1)}>确认改变foo模块的f1</button>
      <button onClick={() => f1Setter('')}>清除本地f1值</button>
    </div>
  );
}
const SmartDumb = connectDumb({
  module: 'foo',
  mapState(ctx) {
    return ctx.moduleState;
  }
})(MyDumb);
```
### 使用mapProps生成UI的props参数
```
const MyDumb2 = ({ fooF1, fooF2, barB1 }) => {
  return (
    <div style={st1}>
      <p>f1: {fooF1}</p>
      <p>f2: {fooF2}</p>
      <p>b1: {barB1}</p>
    </div>
  );
}
const SmartDumb2 = connectDumb({
  module: 'foo',
  connect: { bar: '*' },//连接bar模块，观察bar的所有key值变化
  mapProps(ctx) {
    const { moduleState, connectedState: { bar: barState } } = ctx;
    return { fooF1: moduleState.f1, fooF2: moduleState.f2, barB1: barState.b1 };
  }
})(MyDumb2);
```

## cc工具函数
### 【属性】connectedState
```
const MyDumb = ({state, cc})=>{
  const connectedState = cc.connectedState;//获得你连接上的状态
}
```
### 【属性】connectedComputed
```
const MyDumb = ({state, cc})=>{
  const connectedComputed = cc.connectedComputed;//获得你连接上的状态的计算结果
}
```
### 【属性】hook
hook是`concent`自带的功能，不是来自于react，所以你可以在react16版本之前一样的使用，使用方法和react一样，以下做一些简介
* hook.useState(initState:any)=> [state:any, setter:function]<br />
定义本地临时状态
```
const MyDumb = ({state, cc})=>{
  const [localVal, valSetter] = cc.hook.useState('');
}
```
* hook.useEffect(cb:()=>function | undefined, valArr:(string|number)[])=> void<br />
定义副作用
> 如果不传递第二个值数组，那么第一个回调函数在每次组件渲染(包括组成初次渲染)后都会执行。<br />
> 如果传递第二个值数组为`[]`，那么第一个回调函数只在初次渲染后执行，其他时候不再执行。<br />
> 如果传递第二个值数组为带值得，那么第一个回调函数初次渲染后执行后，后面的执行已否要看数组里的值有没有变化。<br />
> 第一个回调函数如果返回了一个函数，那么组件卸载时将触发这个函数的执行，通常我们将其称为清理函数<br />

## 在线示例
### [hook、sync](https://stackblitz.com/edit/ccapi-top-connect-dumb-1?file=index.js)
> 本示例中你将看到cc工具函数的hook与sync能力