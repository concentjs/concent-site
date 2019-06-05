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
  connect?:ConnectSpec,
  mapState::(connectedState, props)
})=> (fn:(props:{state:object, cc:CcFnProvider})=>ReactDom) => wrappedComponent:CcFragment
```

## 参数解释
* connect<br/>
要连接的模块
* mapState<br/>
提供的回调，让用户可以挑选`connectedState`做2次计算与封装

## 如何使用
```
import {connectDumb} from 'concent';

const MyDumb = ({state, cc})=>{
  const [localF1, f1Setter] =cc.hook.useState('');
  return (
    <div>
      <p>f1: {state.f1}</p>
      <p>f2: {state.f2}</p>
      <br />
      <input placeholder="输入临时f1" value={localF1} onChange={f1Setter} />
      <button onClick={cc.sync('foo/f1', localF1)}>确认改变foo模块的f1</button>
    </div>
  );
}

const SmartDumb = connectDumb({
  connect:{foo:'*'},
  mapState(connectedState){
    return {...connectedState.foo};
  }
})(MyDumb);
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