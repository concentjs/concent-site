---
id: api-top-emit
title: 发射
sidebar_label: emit
---
___
`emit`支持你发射事件以及欲传递的参数，任何监听了该事件的实例都将被触发执行其监听的回调函数

## 函数签名定义
```
emit: (eventName , args?:any[])
```

## 如何使用
假设已有一个cc类`Foo`在`componentDidMount`里监听了事件`boom`
```
class Foo extends Component{
  componentDidMount(){
    this.$$on('boom', this.handleBoom);
  }
  handleBoom = (param1, param2, param3)=>{
    console.log(param1, param2, param3);
  }
}
```
现在你可以在任意地方发射`boom`事件
```
/**
* 或者写为
* import cc from 'concent'; 
* 然后调用cc.emit
*/
import {emit} from 'concent';

emit('boom', 11, 22, 33)
```
然后所有的`Foo实例`都将触发其`handleBoom`函数调用
```
  handleBoom = (param1, param2, param3)=>{
    // 将打印 11,22,33
    console.log(param1, param2, param3);
  }
```

## 何时使用
### 组件存在有实例时才能修改其状态
当你的组件期望存在有实例的时候才需要被调用其方法，推荐使用emit&on模式，我们先假设有个弹窗a组件定义如下
```
//code in ModalB.js
class ModalB extends Components{
  componentDidMount(){
    this.$$on('openFooModal', ()=>{
      this.$$dispatch(openFooModal);
    });
  }
}

//code in reducer.js
export function openFooModal(){
  return {visible:true};
}
```
对比一下两种写法
> 写法1：组件a直接打开弹窗组件b，直接调用弹窗b的reducer函数`openFooModal`
```
class A extends Components{
  render(){
    return <button onClick={this.$$dispatch('modalB/openModal')}>打开弹窗组件b</button>
  }
}
```
>写法2：使用emit方式去调用
```
class A extends Components{
  render(){
    return <button onClick={this.$$emit('openFooModal')}>打开弹窗组件b</button>
  }
}
```
最大的区别就是，如果Modal没有实例化过，使用写法1会直接先修改了modalB模块里的visible值为true，当你下次再某个地方实例化ModalB的时候，因为其visible已近为true了，当你实例化的时候，就直接打开弹窗了，这不一定是你预期的效果

### 跨组件间通信时
`concent`允许你的cc类组件不标记属于任何模块，不设定任何需要观察和共享的key变化，但是这种cc类实例同样具有$$emit&$$on功能，方便你实现组件件通信

## console里使用
打开浏览器console窗口，输入cc.emit即可以console里使用该接口