---
id: api-ctx-set-state
title: 为组件设置新的片段状态
sidebar_label: ctx.setState
---
___
注册为cc组件后，提供的`setState`方法已不再是react提供的原始的`setState`，如果用户想触发原始的`setState`，可以调用`ctx.reactSetState`，***但是强烈不建议这么做***，除非你明确的知道你做的什么以及明白其后果。  

当属于`foo`模块的cc组件实例调用`setState`，将用户的新片段状态提交之后，`concent`会分析这份片段状态除了传递给当前实例，还将找出其他同样属于`foo`模块的类组件实例或者连接到`foo`的类组件实例，并将这份提交状态分发到这些实例上触发渲染。


## 函数签名定义
```javascript
setState: (
  partialState: object, 
  callback?: fullState=>void, 
  renderKey?:string
  delay?:number, 
)=>void
```

## 参数解释
* partialState<br/>
提交的新片段状态
* callback<br/>
新片段状态合并后的回调函数
* renderKey<br/>
触发渲染的目标渲染Key
* delay<br/>
广播延迟时间，单位(ms)

## 如何使用
### 在Class里调用
#### 直接调用
在class里使用时，如果忽略其`renderKey`和`delay`参数的话，使用方式和体验的reactClass是一致的
```jsx
@register({module:'foo', connect:{bar:'*', baz:'*'}}, 'Foo');
class Foo extends Component{
  changeBarName = (e)=>{
    //修改name
    this.setState({name:e.currentTarget.value});

    //修改name, 回调里拿到最新的的state
    this.setState({name:e.currentTarget.value}, state=>{
      console.log(state);
    });

    //concent为每一个实例都构建了一个上下文，this.setState等同于调用this.ctx.setState
    this.ctx.setState({name:e.currentTarget.value});
  }
}
```
#### 带renderKey调用
当实例携带`renderKey`调用时，concent会去寻找和传递的`renderKey`值一样的实例触发渲染，而每一个cc实例，如果没有人工设置`renderKey`的话，默认的`renderKey`值就是`ccUniqueKey`(即每一个cc实例的唯一索引)，所以当我们拥有大量的消费了store某个模块下同一个key如`sourceList`（通常是map和list）下的不同数据的组件时，如果调用方传递的`renderKey`就是自己的`ccUniqueKey`, 那么`renderKey`机制将允许组件修改了`sourceList`下自己的数据同时也只触发自己渲染，而不触发其他实例的渲染，这样大大提供这种场景的渲染性能。
```
// code in model/product/reducer.js
export function changeName({name, pid}, moduleState){
  const list = moduleState.list;
  const target = list.find(v=> v.id===pid);
  target.name = name;
  return {list};
}

//code in page/product/ProductItem.js
@register({module:'product', watchedKeys:['list']})
class ProductPage extends Component{
  changeName = (e)=>{
    //修改name，传递自己的`ccUniqueKey`作为`renderKey`
    //虽然list遍历出来生成的其他ProductItem虽然同样观察key `list`的变化
    //但是它们将不会被触发渲染
    this.setState({name:e.currentTarget.value}, null, this.ctx.ccUniqueKey);
  }

  render(){
    const pid = this.props.pid;
    const productItem = this.state.list[pid];//取自己的数据渲染

    return (
      <div>
        {productItem.name}
        <input onChange={this.changeName}/>
      </div>
    );
  }
}

//code in page/product/container.js
@register('product')
class ProductPage extends Component{
  render(){
    return (
      <div>
        this.state.list.map((v)=>{
          return <ProductItem key={v.pid} pid={v.pid} />
        });
      </div>
    );
  }
}
```

#### 带delay调用
当属于模块`foo`的某个cc组件实例修改状态时，默认情况下`concent`是实时将状态分发到其他关系这些状态变化的实例的，如果有一些状态变化非常频繁，且关心这个状态变化的组件很多时，可以使用delay参数，延迟状态的分发从而提高渲染性能。

delay的值单位是毫秒，表示状态变化之后多少毫秒内，如果没有新的转态输入，才将最后这份状态分发到其他实例
>注意当前实例总是实时的收到最新状态的，只有其他实例才是延迟收到
```
// code in models/foo/state.js
export default {
  name:'',
}

// code in models/foo/reducer.js
export function changeName(name, moduleState){
  return {name};
}

// code in pages/foo/MyInput.js
@register('foo')
class MyInput extends Component{
  changeName = (e)=>{
    //没有新的状态输入的3秒后，才将状态分发给其他实例
    this.setState({name:e.currentTarget.value}, null, null, 3000);
  }

  render(){
    return <input onChange={this.changeName}/>;
  }
}


// code in pages/foo/index.js
@register('foo')
class Foo extends Component{
  render(){
    return (
      <div>
        {/** 其中任何一个MyInput产生输入行为，然后停止输入行为3秒后，其他实例将收到最新的输入 */}
        <MyInput />
        <MyInput />
        <MyInput />
        <MyInput />
      </div>
    );
  }
}
```

### 在RenderProps里调用
#### 基于registerDumb创建的组件
```
export default registerDumb('foo')(
  (ctx) => {
    const changeName = e => ctx.setState({ name: e.currentTarget.name });
    return <input value={ctx.state.name} onChange={this.changeName} />;
  }
)


//定义mapProps, SFC组件props指向mapProps返回的结果
const mapProps = ctx => {
  const changeName = e => ctx.setState({ name: e.currentTarget.name });
  return { name: ctx.state.name, changeName };
}
export default registerDumb({ module: 'foo', mapProps })(
  ({ changeName, name }) => {
    return <input value={name} onChange={this.changeName} />;
  }
)

//将api定义提升到setup，只触发一次定义
const setup = ctx => {
  const changeName = e => ctx.setState({ name: e.currentTarget.name });
  return { changeName };
}
const mapProps = ctx => {
   return { name: ctx.state.name, changeName: ctx.settings.changeName };
}
export default registerDumb({ module: 'foo', mapProps, setup })(
  ({ changeName, name }) => {
    return <input value={name} onChange={this.changeName} />;
  }
)
```
#### 基于CcFragment创建的组件
```
//将api定义提升到setup，只触发一次定义
const setup = ctx => {
  const changeName = e => ctx.setState({ name: e.currentTarget.name });
  return { changeName };
}
const mapProps = ctx => {
  return { name: ctx.state.name, changeName: ctx.settings.changeName };
}
export default () => (
  <CcFragment module="foo" mapProps={mapProps} setup={setup} render={
    ({ changeName, name }) => {
      return <input value={name} onChange={this.changeName} />;
    }} 
  />
)
```
### 在Hook里调用
#### 在hook组件里定义并调用
```
import { useConcent } from 'concent';
export default function MyInput() {
  const { state, setState } = useConcent('foo');
  const changeName = e => ctx.setState({ name: e.currentTarget.name });
  return <input value={state.name} onChange={changeName} />;
}
```
#### 提升到setup
```
import { useConcent } from 'concent';

const setup = ctx=>{
  const changeName = e => ctx.setState({ name: e.currentTarget.name });
  return { changeName };
}
export default function MyInput() {
  const { state, settings } = useConcent({module:'foo', setup});
  return <input value={state.name} onChange={settings.changeName} />;
}
```