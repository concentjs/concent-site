---
id: api-top-register
title: 注册
sidebar_label: register
---

___
`register`函数负责将用户的普通`react类`注册成为`cc类`，变成`cc类`后，你的组件实例将获得更多的能力，具体请参考实例api章节

## 函数签名定义
```
register(
  ccClassKey:string,
  option?:{
    module?:string,
    sharedStateKeys?: '*' | string[],
    globalStateKeys?: '*' | string[],
    storedStateKeys?: '*' | string[],
    isSingle?:boolean
  }
)
```

## 参数解释
* ccClassKey
> 每一个cc类都必须有一个类名，通常这个名字可以和你的react类名保持一致，以便于理解，你的cc组件渲染到界面上后，react dom tree里看到的标签名字来自于你这里定义的名字
* option.module
> 表示你这个cc类属于哪个模块，如果不设置的话，concent将其默认为内置的`$$default`模块
* option.sharedStateKeys
> 表示要将要挑选所属模块的哪些key的值注入到你的实例state上，当前cc类的所有实例，以及其他同属于这个模块的同样观察了这些key变化的cc类所有实例，它们都将共享这些key的值变化，既它们当中任意一个实例改变了这些key中任意一个的值，concent都将这些变化的状态广播给其他实例并触发它们的渲染<br/>默认是空数组，可以设置为`*`,表示观察并共享所属模块的所有key变化，也可以写具体的key数组挑选想要观察的key
* option.globalStateKeys
> 所有cc类不仅可以指定自己所属的专属模块，它们还可以共同观察concent内置的`$$global`模块的key变化，同样的你可以挑选一些具体的key写为数组，或者设置为`*`表示观察`$$global`模块的所有key变化，这些key的值同样的会注入到实例的state里
* option.storedStateKeys
> 组件销毁后，如果希望挂载回来时状态能够恢复回来，设置想要存储的key
>>理解这一点要特别注意，class里的stateKey分为4类<br/>
>>* sharedStateKeys 从所属模块状态的所有key里，挑选要观察和共享的key
>>* globalStateKeys 从`$$global`模块状态的所有key里，挑选要观察和共享的key
>>* storedStateKeys 表示不属于sharedStateKeys和storedStateKeys，但是希望被存储的key
>>* temporaryStateKeys 则表示随着组件卸载就丢失状态的key 
---
所以需要理解实例里的state是合成出来的，由global、module、self 三部分state合成得出
* option.isSingle
> 表示是否允许改cc类实例话多次，默认是false，允许一个cc类有多个cc实例

## 如何使用
假设store的state定义为如下，有3个模块:`foo`、`bar`、`$$global`
```
run({
  foo:{
    state:{
      f1:1,
      f2:2
    }
  },
  bar:{
    state:{
      b1:11,
    }
  }
  $$global{
    state:{
      theme:'red'
    }
  }
})
```
### 注册成为指定模块的类
注册一个类Foo，观察和共享foo模块的f1值变化，我们在其构造器里申明一个初始的state
```
import { register } from 'concent';
@register('Foo', {module:'foo', sharedStateKeys:['f1'], globalStateKeys:['theme']})
class Foo extends Component{
  constructor(props, context){
    super(props, context);
    this.state = {
      f1:100,
      f2:200,
      theme:'black',
      age:22
    };
  }
  render(){
    // 初次渲染打印：{f1:1, f2:200, theme:'red', age:22}
    console.log(this.state);
  }
}
```
可以看到f1尽管在constructor里申明了值为100，theme值为'black',但是打印的时候f1的值和theme的值将从`store`里恢复为1和'red'，这是因为我们标记了sharedStateKeys和globalStateKeys而导致的结果

### 观察和共享其他模块的key变化
每一个cc类除了能够观察和共享自己所属模块的key变化，也能够观察和共享其他模块的key变化，其他模块的将从`this.$$connectedState`里获取
```
import { register } from 'concent';
@register('Foo', {
  module:'foo', 
  sharedStateKeys:['f1'], 
  globalStateKeys:['theme'], 
  connect:{bar:'*'}}, //连接到bar模块，观察和共享它的所有key变化，
)
class Foo extends Component{
  render(){
    // 打印为：{b1:11}
    console.log(this.$$connectedState.bar);
  }
}
```
> 如果注册成为cc类时不指定模块，将被默认属于`$$default`模块，所以如果这个类不属于任何模块，但是同时观察和共享其他多个模块的key变化，请使用[connect](api-top-connect)替代

## setState
成为cc类后，setState将得到增强，你的调用方式和原来一样，只是扩展了2个参数
```
this.setState(partialState:object, cb:function, delay:number, identity:string)
```
在你的render里写入
```
render(){
  return (
    <div>
      <label>{this.state.name}</label>
      <input value={this.state.age} onChange={(e)=>this.setState({age:e.currentTarget.value})}/>
    </div>
  );
}
```
如果你在别的地方实例化多个`Foo`，它们之间任意一个改变了age的值，另一个组件都将同步到数据并渲染
```
<div>
  <Foo />
  <Foo />
</div>
```
如果我们对第三个参数写入delay值3000ms，其他组件将延迟3秒后同步到数据并发生变化
```
<input value={this.state.age} onChange={(e)=>this.setState({age:e.currentTarget.value}, null, 3000)}/>
```

## forceUpdate
同样的，cc的实例调用`forceUpdate`除了会强制触发属性当前实例的重渲染，当前实例观察的key所属模块下的其他cc实例也会被一起强制触发渲染
```
this.forceUpdate(cb:function, delay:number, identity:string)
```

## 其他实例api
其他实例api请点击左侧导航查看

## 在线示例
### [示例1](https://stackblitz.com/edit/ccapi-top-register-1?file=index.js)
演示cc类和react类的区别，以及帮助你理解
> * `sharedStateKeys`、`globalStateKeys`、`storedStateKeys`的作用
> * 实例的状态是被`concent`合成后交给实例的

### [示例2](https://stackblitz.com/edit/ccapi-top-register-2?file=index.js)
演示一个指定了具体模块同时也观察其他模块的cc类，帮助你理解
> 每个cc类都有自己的专属模块，数据从state上获取，如果想观察其他模块的变化，需要定义`connect`参数，实例可以从`$connectedState`上获取