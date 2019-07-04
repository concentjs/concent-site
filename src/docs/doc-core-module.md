---
id: doc-core-module
title: 模块的定义
sidebar_label: 模块
---
___
模块是一个很重要的概念，一个应用程序随着不停的迭代一定会变得越来越复杂， 为了同时满足<b>容易维护</b>、<b>方便扩展</b>、<b>适合多人协同开发</b>这些特点，我们通常都会按照`领域对象`或者`业务模型`将我们庞大的应用拆分为各个模块，`concent`经过整合现有各个UI框架的最佳实践，为模块提炼出了5个核心的概念
- `state`
- `reducer`
- `init`
- `computed`
- `watch`
![模块](/concent-site/img/cc-module.png)
我们使用[run](api-top-run)函数启动`concent`时，载入的就是各个模块定义，然后通过提供[register](api-top-register)、[connect](api-top-connect)、[connectDumb](api-top-connect-dumb)函数让用户可以很方便的将ui与模块关联起来
> 模块是独立于组件存在的，用户根据自己的实际情况按需连接组件与模块

## state
状态是react里非常重要的概念，它的变化驱动着视图的变化，同样的，状态也是`concent`模块里必不可少的配置，我们定义一个模块时，可以缺省`reducer`、`computed`、`watch`、`init`，唯独不能缺省`state`的定义
### 状态定义
[在线示例](https://stackblitz.com/edit/cc-course-define-state?file=index.js)

定义好`foo`模块的状态后，使用[run](api-top-run)载入`foo`模块，使用[register](api-top-register)将react类注册成为concent类并指定其属于`foo`模块
```
import React from 'react';
import ReactDOM from 'react-dom';
import { run, register } from 'concent';


run({
  foo: {//定义foo模块
    state: {//为foo模块定义state
      label:'hello concent'
    },
  },
});

class App extends React.Component{
  render(){
    const label = this.state.label;
    return (
      <div>
        {label}<br/>
        <input value={label} onChange={this.$$sync('label')} />
      </div>
    )
  }
}
const App_ = register('App', {module:'foo', watchedKeys:'*'})(App);
```
### 状态合成
 上述示例中，我们并没有在`constructor`里声明过`state`，`render`函数里却直接从`state`里获取到`label`的值，是因为我们将`App`注册到`foo`模块了，`concent`在`componentWillMount`阶段自动将模块的`state`注入到实例上，实际上，你也可以显示的在`constructor`声明其他的状态，这并不妨碍的`concent`的正常运行，`concent`在实例首次`render`将指定模块的状态和用户自定义的状态合成到实例的`state`里。

 [在线示例](https://stackblitz.com/edit/cc-course-define-state-zjywcb?file=index.js)
 ```
 class App extends React.Component{
  constructor(props, context){
    super(props, context);
    this.state = { myLabel:'my private label' };
  }
  render(){
    const {label, myLabel} = this.state;
    return (
      <div>
        label:{label}<br/>
        myLabel:{myLabel}<br/>
        <input value={label} onChange={this.$$sync('label')} />
      </div>
    )
  }
}
const App_ = register('App', {module:'foo', watchedKeys:'*'})(App);
// or
// const App_ = register('App', 'foo')(App);
 ```
 >render里，我们取到了`label`、`myLabel`两个值，`label`来自于`foo`模块，`myLabel`来自于我们在狗朝气里的自定义值!<br/>
 >如果在我们在构造器里定义`label`值为'see what happen'，render里依然取到的是'hello concent'，`concent`总是会用模块里的状态覆盖掉用户的自定义状态，如果出现同名的key的话。
### 状态连接
上述示例中，我们定义`App`专属于`foo`模块，如果我们新增两个模块`bar`、`baz`，让`App`也能够读取到新增模块的值的话，定义`connect`属性，表示`App`还要连接其他的模块

 [在线示例](https://stackblitz.com/edit/cc-course-connect-state-in-register)
```
run({
  foo: {//定义foo模块
    state: {//为foo模块定义state
      label:'hello concent'
    },
  },
  bar:{//定义bar模块
    state:{
      barProp1: 'barProp1',
    }
  },
  baz:{//定义baz模块
    state:{
      bazProp1: 'bazProp1',
    }
  }
});

class App extends React.Component{
  render(){
    const label = this.state.label;
    const {bar, baz} = this.$$connectedState;
    return (
      <div>
        {label}<br/>
        {bar.barProp1}<br/>
        {baz.bazProp1}<br/>
        <input value={label} onChange={this.$$sync('label')} />
        <input value={bar.barProp1} onChange={this.$$sync('bar/barProp1')} />
      </div>
    )
  }
}
const App_ = register('App', {
  module:'foo', 
  watchedKeys:'*', 
  connect:{bar:'*', baz:'*'}, //连接bar模块和baz模块
})(App);
```

当然我们也可以注册的时候不指定concent类属于任何任何模块，直接使用`connect`定义来帮助用户获取`store`各个模块的数据

[在线示例](https://stackblitz.com/edit/cc-course-connect-all-state)
```

class App extends React.Component{
  render(){
    const {foo, bar, baz} = this.$$connectedState;
    return (
      <div>
        {foo.label}<br/>
        {bar.barProp1}<br/>
        {baz.bazProp1}<br/>
        <input value={foo.label} onChange={this.$$sync('foo/label')} />
        <input value={bar.barProp1} onChange={this.$$sync('bar/barProp1')} />
      </div>
    )
  }
}
const App_ = register('App', {
  connect:{foo:'*', bar:'*', baz:'*'}, //连接foo模块,bar模块和baz模块
})(App);
```
> 此时所有的模块状态都从`this.$$connectedState`上获取了，如果一个类不属于任何模块，同时也要连接多个模块，可以使用`connect`方法代替`register`方法
```
import { connect } from 'concent';
const App_ = connect('App', {foo:'*', bar:'*', baz:'*'} )(App);
```

### 状态修改
对比react类，concent类扩展了很多特性，如上述示例中，你可能留意到了`this.$$sync`的写法，但是如果你不需要用到它们，或者在你没有了解它们之前，你依然可以按照最古典的react写法类书写你的代码，唯一不同的只是，状态被提升到了`store`的某个模块下

[在线示例](https://stackblitz.com/edit/cc-course-classic-writing-in-concent-class?file=index.js)
```
import React from 'react';
import { run, register } from 'concent';

run({
  foo: {//定义foo模块
    state: {//为foo模块定义state
      label:'hello concent'
    },
  },
});

class App extends React.Component{
  changeLabel = (e)=>{
    this.setState({label: e.currentTarget.value});
  }
  render(){
    const label = this.state.label;
    return (
      <div>
        {label}<br/>
        <input value={label} onChange={this.changeLabel} />
      </div>
    )
  }
}
const App_ = register('App', {module:'foo', watchedKeys:'*'})(App);
```
### 状态变更观察
上述演示的古典写法里，除了修改`foo`模块的`label`值，似乎并没有看出其他不同之处，我们仔细看`register`函数里，传入了一个`watchedKeys`，正如其名字描述的一样，表示当前concent类的实例将观察`foo`模块的所有`key`的值变化，只要任意一个实例修改了`foo`下的任意`key`的值，那么其他实例都将获得最新的修改值并被触发渲染。

[在线示例](https://stackblitz.com/edit/cc-course-classic-writing-and-state-been-shared?file=index.js)
```
class Foo extends React.Component{
  changeLabel = (e)=>{
    this.setState({label: e.currentTarget.value});
  }
  render(){
    const label = this.state.label;
    return (
      <div>
        {label}<br/>
        <input value={label} onChange={this.changeLabel} />
      </div>
    )
  }
}
const Foo_ = register('Foo', 'foo')(Foo);
// or
// const Foo_ = register('Foo', {module:'foo', watchedKeys:'*'})(Foo);

const App = ()=>{
  return (
    <div>
      <Foo />
      <Foo />
      <Foo />
    </div>
  );
}
``` 
> 以上三个`Foo`实例，任意一个修改`label`值，都会同步到其他两个实例上

## reducer
`reducer`函数用于书写用户的业务逻辑并返回新的片段状态，提高代码的复用性，并将视图渲染和业务逻辑彻底隔离，更多关于`reducer`的定义[请跳转此处查看](doc-core-reducer)

## watch
`watch`允许用户观察某些`key`的变化书写一些异步逻辑
> 典型的场景1，导航组件切换标签页，对应的路由组件需要刷新的逻辑，导航组件负责跟上tabId，其他组件负责观察tabId变化，并刷新对应tabId的数据<br />

>典型的场景2, 类组件里，一个单选按钮组切换，类里定义watch观察并更新，注：这里指的是实例级别的watch函数，不同上面的模块级别的watch函数，但它们本质都一样:某些场景里，需要让数据的变化和业务逻辑解耦，就是你需要使用watch的时候
```
class Foo extends Component{
  $$watch() {
    return {
      /** 观察到_duration发生变化，从后端获取最新数据 */
      _duration: () => {
        this.fetchStatData(this.state._account);
      }
    }
  }
  render(){
    return (
      <Group value={_duration} onChange={this.$$sync('_duration')}>
        <Button value="day">日</Button>
        <Button value="week">周</Button>
        <Button value="month">月</Button>
      </Group>
    );
  }
}
```
## computed
对key定义computed后，concent调用这些key的computed函数结算出结果并将结果缓存起来，只有当key再次发生变化时，才会触发重计算
```

```