---
id: api-ctx-dispatch
title: ctx.dispatch
sidebar_label: ctx.dispatch
---
___

所有实例都可以调用`ctx.dispatch`来呼叫`reducer`函数，具体介绍请移步[dispatch](api-common-dispatch)

## 如何使用
### 触发所属模块的`reducer`
任意一个concent组件都有一个所属模块，如果在注册成为concent组件时用户不指定，则类会被归为`$$default`模块，调用`ctx.dispatch`时，不添加模块前缀字符串，则表示调用所属模块的`reducer`函数去修改所属模块的数据
- class hoc 方式
```
import { register } from 'concent';

@register('foo')
class Hello extends Component{
  changeName = (e)=>{
    this.ctx.dispatch('changeName', e.currentTargetValue);
    // 等同于
    // this.ctx.dispatch('foo/changeName', e.currentTargetValue);
  }
  render(){
    return <h1 onClick={handelClick}>hello concent</h1>
  }
}
```
- renderProps 方式
```
import { registerDumb } from 'concent';

registerDumb('foo')(ctx=>{
  const handelClick = ()=> ctx.dispatch('changeName');
  return (
    <h1 onClick={handelClick}>hello concent</h1>
  );
})
```
- hook 方式
```
import { useConcent } from 'concent';

function Hello(){
  const ctx = useConcent('foo');
  const handelClick = ()=> ctx.dispatch('changeName');
  return (
    <h1 onClick={handelClick}>hello concent</h1>
  );
}

```

> 如果调用方的实例所属的模块和调用`reducer`时指定的修改状态模块一样时，允许reducer返回一些非模块里`stateKey`，此时属于模块的那部分状态会同步到store并随后会被广播到其他实例，属于非模块的状态（即用户自定义的扩展的私有状态）连同模块状态一起传递给调用实例
```
@register('foo');
class Foo extends Component{
  state = {
    _privName:'',
  }
  changeName = (e)=>{
    //当前实例属于foo模块，调用doSomething，
    //不指定修改状态模块，默认就是修改当前实例所属模块foo的状态
    this.ctx.dispatch('doSomething');
  }
}

//code in model/foo/state.js
export default {
  name:'zk',
  age:1,
}

//code in model/foo/reducer.js
export function doSomething(payload, moduleState){
  //新的片段状态要提交到foo模块，和调用实例所属模块一样
  //则整个状态{name:'newName', age:19, _privName:'xxx'}都会提交给实例
  //同时属于模块的状态{name:'newName', age:19}被提取出来，同步到store，广播给其他实例
  return {name:'newName', age:19, _privName:'xxx'};
}

```
### 触发其他模块的`reducer`
```
@register('bar');
class Bar extends Component{
  changeName = (e)=>{
    //当前实例属于bar模块，调用doSomething方法修改foo模块的数据
    this.$$dispatch('foo/doSomething');
  }
}

//code in model/foo/reducer.js
export function doSomething(payload, moduleState){
  //新的片段状态要提交到foo模块，和调用实例所属模块bar不一致
  //此时属于foo模块的状态{name:'newName', age:19}被提取出来，同步到store，广播给其他实例
  //{_privName:'xxx'}则被丢弃
  return {name:'newName', age:19, _privName:'xxx'};
}

```
> 所有要对调用关系保持清醒，通常一个模块的reducer都应该只被自己模块的实例调用，如果存在着某个模块的reducer被其他模块的实例调用的情况，则需要注意保持该模块的`reducer`函数返回的片段状态只属于这个模块，而不夹着其他私有状态

