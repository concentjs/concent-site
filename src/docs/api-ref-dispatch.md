---
id: api-ref-dispatch
title: this.$$dispatch
sidebar_label: this.$$dispatch
---
___

注册成为concent类后，实例上都可以调用`this.$$dispatch`来呼叫`reducer`函数，具体介绍请移步[dispatch](api-common-dispatch)

## 如何使用
### 触发所属模块的`reducer`
任意一个concent类都有一个所属模块，如果在注册成为concent类时用户不指定，则类会被归为`$$default`模块，调用`this.$$dispatch`时，不添加模块前缀字符串，则表示调用所属模块的`reducer`函数
```
import { register } from 'concent';

@register('Foo', {module:'foo'});
class Foo extends Component{
  changeName = (e)=>{
    this.$$dispatch('changeName', e.currentTargetValue);
    // 等同于
    // this.$$dispatch('foo/changeName', e.currentTargetValue);
  }
  render(){

  }
}
```
> 如果调用方实例所属模块和`reducer`返回的状态所属的模块值一样时，允许返回一些非模块里`stateKey`，此次属于模块的那部分状态会同步到store并随后会被广播到其他实例，属于非模块的状态（即用户自定义的扩展的私有状态）则被提交给调用实例
```
@register('Foo', {module:'foo'});
class Foo extends Component{
  state = {
    _privName:'',
  }
  changeName = (e)=>{
    //当前实例属于foo模块，调用doSomething
    this.$$dispatch('doSomething');
  }
}

//code in model/foo/state.js
export default {
  name:'zk',
  age:1,
}

//code in model/foo/reducer.js
export function doSomething(payload, moduleState){
  //新的片段状态要提交到foo模块，和调用实例保持一致
  //则整个状态{name:'newName', age:19, _privName:'xxx'}都会提交给实例
  //同时属于模块的状态{name:'newName', age:19}被提取出来，同步到store，广播给其他实例
  return {name:'newName', age:19, _privName:'xxx'};
}

```
非foo模块实例调用
```
@register('Bar', {module:'bar'});
class Bar extends Component{
  changeName = (e)=>{
    //当前实例属于bar模块，调用doSomething方法修改foo模块的数据
    this.$$dispatch('foo/doSomething');
  }
}

//code in model/foo/reducer.js
export function doSomething(payload, moduleState){
  //新的片段状态要提交到foo模块，和调用实例不是一致的
  //此时属于foo模块的状态{name:'newName', age:19}被提取出来，同步到store，广播给其他实例
  //{_privName:'xxx'}则被丢弃
  return {name:'newName', age:19, _privName:'xxx'};
}

```
> 所有要对调用关系保持清醒，通常一个模块的reducer都应该只被自己模块的实例调用，如果存在着某个模块的reducer被其他模块的实例调用的情况，则需要注意保持该模块的`reducer`函数返回的片段状态只属于这个模块，而不夹着其他私有状态

### 触发其他模块的`reducer`
```
@register('Foo', {module:'foo', connect:{bar:'*', baz:'*'}});
class Foo extends Component{
  changeBarName = (e)=>{
    this.$$dispatch('bar/changeName', e.currentTargetValue);
  }
  changeBazName = (e)=>{
    this.$$dispatch('baz/changeName', e.currentTargetValue);
  }
  render(){

  }
}
```
