---
id: api-ctx-computed
title: 为实例定义计算属性
sidebar_label: ctx.computed
---
___
实例上下文对象提供的`computed`函数允许用户按需要自定义计算属性，是模块的计算后的值存放到`refComputed`或`connectedComputed`下，当相关依赖`stateKey`发生变化时，才会重触发计算，让组件实例在渲染期间节约很多不必要的重复计算。
>该函数属于实例级别的计算函数，即定义完毕后每一个实例都会触发自己的计算函数，如果计算的key是模块级的key且计算结果对于所有实例来说都一样时，建议将computed定义到模块里，以便减少不必要的计算。   
>调用的时候一定要在`setup`里调用，在组件初次渲染之前就静态的定义好相关计算属性。

## 函数签名定义
```javascript
type ComputedFn = (newVal:any, oldVal:any, fnCtx:FnCtx, refCtx:RefCtx)=>any;
type ComputedDescriptor = {
  fn: ComputedFn,
  depKeys?: string[] | '*' | null,
  compare?: boolean,
}

type ComputedDescriptorConfig = {
  [resultKey:string]: ComputedDescriptor
};

computed: (
  resultKey: string,
  fn: ComputedFn,
  depKeys?: string[] | '*' | null,
  compare?: boolean,
)=> any;

computed: (
  resultKey:string,
  computedDescriptor: ComputedDescriptor
)=> any;

computed: (
  computedDescriptorConfig: ComputedDescriptorConfig
)=> any;

computed: (
  cb: (refCtx:RefCtx) => ComputedDescriptorConfig
)=> any;
```
> computed的检查触发时机处于`render`之前，首次渲染之前一定会触发调用，之后就依赖于`depKeys`定义了

## 参数解释
* ***resultKey***<br/>
结果key,表示计算的结果将存入`refComputed`的`${resultKey}`下
* ***fn***<br/>
计算函数,发生变化的key将要触发此函数计算
* ***depKeys***<br/>
`dependencyStateKeys`的缩写,依赖的stateKey列表，列表中任意一项key的值发生变化时，触发计算函数
>当`resultKey`为`stateKey`时，如果用户不显示的指定`depKeys`,默认就是只含有`stateKey`的数组，即只有`stateKey`变化时，才触发计算
* ***compare***<br/>
触发策略，默认是true，表示只有stateKey的值发生变化时才触发计算函数，如果改为false，只要用户设置了stateKey的值就会触发计算函数
> 在concent启动时，配置`computedCompare`为false，则所有`computed`调用不显式的设置`compare`时，默认为false。

## 对stateKey定义计算属性
假设有如下模块定义
```
run({
  foo:{
    state:{
      firstName:'lucy',
      lastName:'green',
    }
  }
});
```
### 普通的resultKey
对`firstName`取反，对`lastName`拼接微笑后缀
```
@register('foo')
class Foo extends React.Component{
  $$setup(ctx){
    //此时retKey 'firstName'等同于stateKey,可以不用指定depKeys
    //等同于写为 ctx.computed('firstName', ()=>{...}, ['firstName'])
    ctx.computed('firstName', (newVal)=>{
      return newVal.split('').reverse().join('');
    });
    

    ctx.computed('lastName', (newVal)=>{
      return `${newVal}_^_^`;
    });
  }
  render(){
    const {firstName, lastName, fullName} = this.ctx.refComputed;
  }
}
```
上面3个计算属性可以使用`ComputedDescriptorConfig`方式合并为一次定义
```
computed({
  'firstName':(newVal)=>{
      return newVal.split('').reverse().join('');
  },
  'lastName':(newVal)=>{
      return newVal.split('').reverse().join('');
  },
  'fullName':{
    fn:(newState)=>{
      return `${newState.firstName} ${newState.lastName}`;
    },
    depKeys:['firstName', 'lastName']
  }
});
```
### 带模块前缀的resultKey
一个连接了其他模块的实例，要依赖其对应模块的`stateKey`触发计算时，可以在`retKey`前加模块名前缀并用斜杠分隔
```
//当前组件属于foo模块，同时连接到bar和baz模块，观察它们下的所有stateKey变化
@register({module:'foo', connect:['bar', 'baz']})
class Foo extends React.Component{
  $$setup(ctx){
    //在bar模块下必须存在key 'firstName', 否则会报错
    ctx.computed('bar/firstName', (newVal)=>{
      return newVal.split('').reverse().join('');
    });
    
    //在bar模块下必须存在key 'lastName', 否则会报错
    ctx.computed('baz/lastName', (newVal)=>{
      return `${newVal}_^_^`;
    });
  }
  render(){
    //获取对应的计算结果
    const { foo, bar } = this.ctx.connectedComputed;
    const { firstName } = foo;
    const { lastName } = bar;
  }
}
```
使用`ComputedDescriptorConfig`方式合并为一次定义
```
  $$setup(ctx){
    ctx.computed({
      'bar/firstName': (newVal)=>{
        return newVal.split('').reverse().join('');
      },
      'baz/lastName': (newVal)=>{
        return `${newVal}_^_^`;
      },
    });
  }
```

## 对应非stateKey定义计算属性
### 普通的resultKey
当`retKey`非`stateKey`时，如果需要对其定义计算属性，必需显式的指定`depKeys`,因为此时`concent`无法自动推导其`stateKey`依赖列表
```
//此时'fullName'并非状态里的key
//显示指定depKeys为['firstName', 'lastName']，表示两者任意一个发生变化，都将触发计算函数
ctx.computed('fullName', (newState)=>{
  return `${newState.firstName} ${newState.lastName}`;
},['firstName', 'lastName']);
```
使用`ComputedDescriptorConfig`方式定义
```
computed({
  'fullName':{
    fn:(newState)=>{
      return `${newState.firstName} ${newState.lastName}`;
    },
    depKeys:['firstName', 'lastName']
  }
});
```
### 带模块前缀的resultKey
一个连接了其他模块的实例，要依赖其对应模块的多个`stateKey`变化计算一个值
```
//当前组件属于foo模块，连接到baz模块，观察baz模块下的所有stateKey变化
@register({module:'foo', connect:['baz']})
class Foo extends React.Component{
  $$setup(ctx){
    //在bar模块下必须存在key 'lastName', 'lastName', 否则会报错
    ctx.computed('baz/fullName', (newState)=>{
      return `${newState.firstName} ${newState.lastName}`;
    }, ['firstName', 'lastName']);
  }
  render(){
    //获取对应的计算结果
    const { bar } = this.ctx.connectedComputed;
    const { fullName } = foo;
  }
}
```
使用`ComputedDescriptor`方式定义
```
  $$setup(ctx){
    ctx.computed('bar/fullName', {
      fn:(newState)=>{
        return `${newState.firstName} ${newState.lastName}`;
      },
      depKeys:['firstName', 'lastName'],
    });
  }
```
使用`ComputedDescriptorConfig`方式定义
```
  $$setup(ctx){
    ctx.computed({
      'bar/fullName': {
        fn:(newState)=>{
          return `${newState.firstName} ${newState.lastName}`;
        },
        depKeys:['firstName', 'lastName'],
      }
    });
  }
```
> 通常来说`ComputedDescriptorConfig`更方便一定行定义多个计算属性