---
id: doc-guid-quick-start
title: 快速开始
sidebar_label: 快速开始
---
___

## 前言
如果你已经用过`redux`或者`mobx`之类的状态管理框架，`concent`对你的上手过程来说并不会有非常大的障碍，如果没有使用过的话，也没有关系，可以先了解核心概念与功能，在尝试编写代码会更容易理解，推荐使用在线IDE边写边观察效果，以便加深api的理解，推荐fork提供的在线示例做进一步的修改。

## hello concent
这是一个基于class的简单示例
[在线示例](https://stackblitz.com/edit/cc-course-hello-concent-simple?file=index.js)

### 注册成为concent类
通过示例我们可以看到以下几个特殊的细节
-  store的定义和UI的书写是各自独立的，顶层并没有包裹`<Provider>`
- 数据由store直接注入到了`state`
- `setState`具有了改写store的能力
- `state`同时也允许扩充自己的私有字段
- `this.ctx.dispatch`是concent注入的函数，因为`concent`的高阶函数`register`默认使用反向继承策略来包裹你的react类，这样可以使得dom层级更少
```
import React from 'react';
import ReactDOM from 'react-dom';
import {run, register, connectDumb, CcFragment} from 'concent';

run({
  welcomeModule:{//定义模块名
    state:{//必需，定义模块下的state
      text:'hello',
      name:'concent',
      author:'zzk',
    },
    reducer:{//可选
      changeName:(name)=>{
        console.log('changeName', name);
        if(name.length === 10) return {name:`${name}__len over 10!`}
        else return {name};
      }
    }
  }
});

/** 定义一个类组件 */
class HelloConcent_ extends React.Component{
  constructor(props, context){
    super(props, context);
    this.state = {_privText:''}
  }

  componentDidMount(){
    this.ctx.emit('receiveMsg', `[${this.props.tag}] mounted`);
  }

  changeName = (e)=>{
    const name = e.currentTarget.value;
    this.ctx.dispatch('changeName', name);
  }

  changeText = (e)=>{
    const text = e.currentTarget.value;
    //注意，此处调用setState，另一个实例的UI也会触发渲染
    this.setState({text});
  }

  changePrivText = (e)=>{
    const _privText = e.currentTarget.value;
    //注意，此处调用setState，另一个实例的UI并不会触发渲染，因为并不是store里声明的字段
    this.setState({_privText});
  }

  render(){
    console.log('watch', this.state);
    const { name, text } = this.state;
    return (
      <fieldset style={{border:'3px solid green',width:'300px', display:'inline-block'}}>
        <legend>class demo</legend>
        <p>{text} {name}</p>
        name: <input value={name} onChange={this.changeName} style={{width:'200px'}} />
        <br/>
        text:<input value={text} onChange={this.changeText} style={{width:'200px'}} />
        <br/>
        _privText:<input value={_privText} onChange={this.changePrivText} style={{width:'200px'}} />
      </fieldset>
    );
  }
} 
/** 注册为到welcomeModule模块的组件 */
const HelloConcent = register('HelloConcent',{module:'welcomeModule', watchedKeys:'*'})(HelloConcent_)
// 简写为
// const HelloConcent = register('HelloConcent','welcomeModule')(HelloConcent_)


function App(){
  return (
    <div>
      <HelloConcent tag="hc1" />
      <HelloConcent tag="hc2" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```
### 属性代理模式的concent类
[在线示例](https://stackblitz.com/edit/cc-course-hello-concent-simple?file=index.js)

大多数情况下，`concent`推荐使用上面例子里的默认的反向继承策略，更少的dom层级意味着更好的渲染性能
```
const HelloConcent = register('HelloConcent',{
  module:'welcomeModule', 
  watchedKeys:'*', 
  isPropsProxy:true, //是用属性代理模式
})(HelloConcent_)
```
使用属性代理模式，必需要在构造器里，调用`this.props.$$attach(this)`，以便让concent接管`setState`句柄，而且必需是定义state之后调用
```
  constructor(props, context){
    super(props, context);
    this.state = {_privText:''};
    this.props.$$attach(this);//不能忘记调用这句话，否则concent会提示报错
  }
```

## 更复杂的hello concent
[在线示例](https://stackblitz.com/edit/cc-course-hello-concent-complex)

该示例展现了concent的基本主要能力

### 完整的模块定义
```
import React from 'react';
import ReactDOM from 'react-dom';
import {run, register, connectDumb, CcFragment} from 'concent';

const sleep = ms => new Promise((resolve)=>setTimeout(resolve, ms));
run({
  welcomeModule:{//定义模块名
    state:{//必需，定义模块下的state
      text:'hello',
      name:'concent',
      author:'zzk',
    },
    reducer:{//可选
      changeName:(name)=>{
        console.log('changeName', name);
        if(name.length === 10) return {name:`${name}__len over 10!`}
        else return {name};
      }
    },
    watch:{//可选，定义模块级别的watch
      name:(newVal, oldVal)=>{//name发生变化时，触发该watch函数，通常watch用于执行一些异步逻辑
        // if(newVal.length>10)alert(newVal+ ' len over 10');
      }
    },
    computed:{//可选，定义模块级别的computed
      name:(newVal)=>{//对name计算反转值，并缓存起来，仅当name再次发生变化时，才会触发该计算函数
        return newVal.split('').reverse().join('');
      }
    },
    init:async ()=>{//可选，定义一些需要异步从后端获取的初始化状态
      //3秒后初始化模块的name值
      await sleep(3000);
      console.log('init');
      return {name:'boom come from module init'};
    }
  }
},{
  middlewares:[
    (ctx, next)=>{
      console.log(ctx);
      next();
    }
  ]
});
```
### 类组件
```
/** 定义一个类组件 */
class HelloConcent_ extends React.Component{
  componentDidMount(){
    this.ctx.emit('receiveMsg', `[${this.props.tag}] mounted`);
  }

  changeName = (e)=>{
    const name = e.currentTarget.value;
    this.ctx.dispatch('changeName', name);
  }

  $$setup(ctx){
    //定义实例级别的computed
    ctx.computed('name', (newVal)=>{
      return `ref computed[${newVal}]`
    });

    //定义实例级别的watch
    ctx.watch('name', (newVal)=>{
      ctx.emit('receiveMsg', `come from ref[${this.props.tag}] watch ${newVal}`);
      // alert('come from ref watch '+newVal);
    });
  }

  render(){
    console.log('watch', this.state);
    const { name, text } = this.state;
    const { name: reversedName } = this.ctx.moduleComputed;//取出计算好的反转值
    return (
      <fieldset style={{border:'3px solid green',width:'300px', display:'inline-block'}}>
        <legend>class demo</legend>
        <p>{text} {name}</p>
        <p>module reversedName:{reversedName}</p>
        <p>ref reversedName:{this.ctx.refComputed.name}</p>
        <input value={name} onChange={this.changeName} style={{width:'200px'}} />
      </fieldset>
    );
  }
} 
/** 注册为一个属于welcomeModule模块的cc组件，cc类名叫HelloConcent */
const HelloConcent = register({module:'welcomeModule', watchedKeys:'*'}, 'HelloConcent')(HelloConcent_)
// 简写为
// const HelloConcent = register('welcomeModule', 'HelloConcent')(HelloConcent_)
```

### function组件
```
// <<<------------------- 定义一个function组件 ---------------------

//## 定义setup, 组件初次挂载时执行，返回结果会收集到ctx.settings里
const setup = ctx=>{
  //备注，以下回调里的ctx和外层的ctx指向的是同一个上下文引用对象，
  //提供ctx在回调参数列表里是为了方便用户书写的函数可以脱离setup内部

  // ctx.defineEffect(ctx=>{
  ctx.defineEffect(() => {
    ctx.emit('receiveMsg', `${ctx.props.tag} mounted`);
  }, []);
  //定时实例级别的watch
  ctx.defineWatch({
    //观察组件所属默认模块的name值变化
    '/name': (newVal, oldVal, keyDesc, ctx) => {
      ctx.emit('receiveMsg', `come from ref[${ctx.props.tag}] watch ${newVal}`);
    }
  })
  //定时实例级别的computed
  ctx.defineComputed({
    '/name':(newVal, oldVal, keyDesc, ctx)=>{
      return `ref computed[${newVal}]`
    }
  });

  //定义changeName函数
  const changeName = e =>{
    const name = e.currentTarget.value;
    // ctx.ctx.dispatch('changeName', name);
    // or
    ctx.reducer.welcomeModule.changeName(name);
  };
  const changePrivText = e=>{
    const _privText = e.currentTarget.value;
    ctx.setState({_privText});
  }

  return { changeName, changePrivText }
}

//## 定义mapProps
const mapProps = ctx => {
  const { text, name } = ctx.moduleState;//这是所属模块的state

  //从settings获取定义好的方法
  const {changeName, changePrivText} = ctx.settings;

  const refReversedName = ctx.refComputed.name;
  const moduleReversedName = ctx.moduleComputed.name;
  const _privText = ctx.state._privText;//这是local state
  return {_privText, text, name, changeName, refReversedName, moduleReversedName, changePrivText};
}

//## 定义UI
const HelloConcentUI = props =>{
  //这里你可已使用react hook，
  //但是基于concent已经提供了管理局部状态的能力，操作reducer和打通store的能力
  //所以hook在这里是没有必要的了

  return (
    <fieldset style={{border:'3px solid purple',width:'300px', display:'inline-block'}}>
      <legend>class demo</legend>
      <p>{props.text} {props.name}</p>
      <p>module reversedName:{props.moduleReversedName}</p>
      <p>ref reversedName:{props.refReversedName}</p>
      <p>_privText:{props._privText}</p>
      name: <input value={props.name} onChange={props.changeName} style={{width:'200px'}} />
      <br />
      _privText: <input value={props._privText} onChange={props.changePrivText} style={{width:'200px'}} />
    </fieldset>
  );
}

//这是每一个组件私有的state
// const state = {_privText:''};如果写成对象，concent会对其做深拷贝，以便让每一个实例拥有一个自己的局部state
const state = ()=> ({_privText:''});

//## 连接模块，组装函数组件
const connectFn = connectDumb({state, setup, mapProps, module:'welcomeModule'});
const HelloConcentFnComp = connectFn(HelloConcentUI)
const HelloConcentFnComp2 = connectFn(HelloConcentUI)
// >>> ------------------ end ------------------
```

### 定义CcFragment
connectDumb是基于`CcFragment`的进一步抽象，有的时候我们可能只是在视图里插入一个片段，快速连接其他模块并消费数据，皆可以直接使用`CcFragment`
```
// <<< ----------------------  此处定义一个MsgBoard，用于辅助显示通知消息 ----------------------
const setupBoard = ctx => {
  //定义on事件监听，concent会确保组件挂载完毕才开始接受监听事件触发监听函数
  ctx.on('receiveMsg', msg => {
    const msgList = ctx.state.msgList;
    msgList.push(msg);
    ctx.setState({msgList});
  });
}

// <CcFragment connect={{foo:'*', bar:'*'}} /> ---传入connect连接多个模块
const MsgBoard = <CcFragment state={{msgList:[]}} setup={setupBoard} render={(ctx)=>{
  const msgList = ctx.state.msgList;
  return (
    <div style={{border:'1px solid blue', minHeight:'19px', maxHeight:'200px', overflowY:'auto'}}>
      <span style={{color:'red'}}>total {msgList.length}</span>
      {msgList.map((msg, idx)=>{
        return <p key={idx}>{msg}</p>
      })}
    </div>
  );
}} />
// >>> ------------------------- end ------------------------------
```
### 渲染结果
```
function App(){
  return (
    <div>
      {MsgBoard}
      <HelloConcent tag="hc1" />
      <HelloConcent tag="hc2" />
      <HelloConcentFnComp tag="hcFn1" />
      <HelloConcentFnComp tag="hcFn2" />
      <HelloConcentFnComp2 tag="hcFn3" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```