---
id: doc-intro-what-is-concent
title: concent是什么
sidebar_label:  concent是什么
---
___
## 序
concent是一个专为`react`提供状态管理服务的框架，提炼现有各大框架的精华，以及社区公认的最佳实践，通过良好的模块设计，既保证react的最佳性能又允许用户非常灵活的解耦UI逻辑与业务逻辑的关系，从整体上提高代码的<b>可读性</b>、<b>可维护性</b>和<b>可扩展性</b>。

concent携带以下特性
* 核心api少且简单，功能强大，上手容易，入侵小，容易调试
* 提供全局模块化的单一数据源
* 支持0入侵的方式，渐进式的重构已有react代码
* 对组件扩展了事件总线、computed、watch、双向绑定等特性
* 完美支持function组件
* 基于引用定位和状态广播，支持细粒度的状态订阅，渲染效率出众
* 支持中间件，可以扩展你的个性化插件处理数据变更
* 支持react 0.10+任意版本；

为用户提供更舒适和简单的react编码体验

## 精心的模块设计理念
### state
concent对模块的定义是经过对实际业务场景反复思考和推敲，最终得出的答案，首先，数据是模块的灵魂，承载着对你的功能模块的最基础的字符描述，离开数据，一切上层业务功能都是空谈，所以`state`是模块里的必包含的定义。
### reducer
修改数据的方式灵活度是concent提供给用户惊喜之一，因为concent的核心是通过接管`setState`做状态管理，所以用户接入concent那一刻可以无需立即改造现有的代码就能够享受到状态管理的好处，同样的，concent也支持用户定义[reducer](doc-core-reducer)函数修改状态，这也是推荐的最佳实践方式，可以彻底解耦UI渲染与业务逻辑，因为`reducer`函数本质上只是`setState`的变种写法，所以强调的是总是返回需要更新的片段状态，而且由于concent支持`reducer`函数之间相互调用，任意组合，所以可以允许用户按需任意切割`reducer`函数对状态的更新粒度,然后形成链式调用关系，然后通过`dispatch`句柄来触发`reducer`函数

![cc-dispatch](/concent-site/img/cc-dispatch.png)

如果链式调用层级过深，会造成很多次渲染，从上图中可以看出有3个函数返回新的片段状态，造成3次渲染，所以`concent`也同样提供`lazyDispatch`句柄来让用户可以有多一种选择来触发对`reducer`函数的调用，`concent`会在调动过程中自动缓存当前调用链上所有属于同一个模块的状态并做合并，直到调用链结束，才做一次性的提交

![cc-lazy-dispatch](/concent-site/img/cc-lazy-dispatch.png)
### computed
`computed`提供一个入口定义需要对发生变化的key做计算的函数，通常来说，大部分state的数据并非是UI渲染直接需要的数据，我们通常需要对其做一些格式化或者转换操作，但是这些操作其实没有必要再每次渲染前都做一遍，`computed`将只对发生了变化的`key`计算并将其结果缓存起来。
### watch
`watch`和`computed`最大的不同是，不需要返回一个具体的结果，通常用于在关心某些`key`变化时，做一些异步操作，就可以对这些`key`定义`watch`函数
### init
我们知道state的定义是同步的，`init`允许用户有一次对`state`做异步获取并改写的机会，注意，如果此时存在着该模块的实例，改写了模块的状态后，`concent`会自动将这些状态广播到对应的实例上，同样的，如果不存在，在有些的该模块的实例生成时，这些实例将同步到模块最新的状态，所以当我们有一些状态不是需要依赖实例挂载上且触发`componentDidMount`来获取的时候，就可以将状态的初始化提升到模块的`init`里

![cc-lazy-dispatch](/concent-site/img/cc-module.png)

## 灵活的模块和组件映射关系
模块是先于组件存在的概念，当我们有了模块的定义后，便可以对组件提供强有力的支持，`concent`里通过`register`函数将react组件注册为concent组件(也称之为concent类)

![cc-lazy-dispatch](/concent-site/img/cc-reactclass-ccclass.png)

注册的时候，可以指定专属的模块，理论来说，我们应该保持组件与模块干净的对应关系，即一个组件专属于某个模块，消费的是该模块的数据，操作的所属模块的`reducer`函数，但是实际场景可能有不少组件都是跨多个模块消费和修改数据的，所以`concent`也允许用户通过`connect`定义来指定组件连接的其他模块，唯一不同的是调用句柄默认带的上下文是指向自己专属模块的，如果需要调用其他模块的方法，则需要显示指定模块名
```
@register('Foo', {module:'foo', connect:{bar:'*'}})
class Foo extends Component(){
  onNameChange = (name)=>{
    this.$$dispatch('changeName', name);//默认调用的foo模块reducer里的changeName方法

    this.$$dispatch('bar/changeName', name);//指定bar模块, 调用bar模块的reducer里的changeName方法修改bar模块的数据
  }
}
```
![cc-ccclass-module](/concent-site/img/cc-ccclass-module.png)
对于`CcClass`来说，因为调用`setState`就能够修改store，所以数据是直接注入到`state`里的，对于其他模块的数据，是注入到`connectedState`,这样既保持了所属模块和其他模块的数据隔离，又能够让用户非常方便消费多个模块的数据。
![cc-class-and-instance-state](/concent-site/img/cc-class-and-instance-state.png)

所以整体来说，组件与`store`之间将构成一张关系明确和清晰的结构网，有利于用户为大型的`react`工程初期整齐的划分业务模块，中期灵活的调整模块定义
![cc-class-and-store](/concent-site/img/cc-class-and-store.png)

## 更友好的function支持
在`hook`提案落地后，现有的react社区，已经从class component慢慢转向function component写法，但是正如[Vue Function-based API RFC](https://www.jianshu.com/p/72f7e247b4b0)所说，`hook`显而易见的要创建很多临时函数和产生大量闭包的问题，以及通过提供辅助函数`useMemo/useCallback`等来解决过度更新或者捕获了过期值等问题，提出了`setup`方案，每个组件实例只会在初始化时调用一次 ，状态通过引用储存在 setup() 的闭包内。

综合上述的`setup`思路和好处，`concent`针对`react`的函数组件引入`setup`机制并对其做了更优的改进，同样在在组件实例化时只调用一次，可以定义各种方法并返回，这些方法将收集在上下文的`settings`对象里，还额外的允许`setup`里定义`effect`、`computed`、`watch`函数（当然，这些是实例级别的`computed`和`watch`了）

[在线示例](https://stackblitz.com/edit/cc-course-award-panel-v4?file=index.js)

### UI定义
```
const AwardPanelUI = (props) => {
  return (
    <div style={stBox}>
      {/** 其他略 */}
      <div>displayBonus: {props.displayBonus}</div>
    </div>
  );
};
```
### setup定义
```
const setup = ctx => {
  //定义副作用，第二位参数写空数组，表示只在组件初次挂载完毕后执行一次
  ctx.defineEffect(ctx => {
    ctx.dispatch('init');
    //返回清理函数，组件卸载时将触发此函数
    return () => ctx.dispatch('track', 'user close award panel')
  }, []);

  /** 也支持函数式写法
    ctx.defineWatch(ctx=>{
      return {...}
    });
   */
  ctx.defineWatch({
    //表示观察 所属模块的key inputCode
    '/inputCode':(nevVal)=> ctx.setModuleState({msg:'inputCode 变为 '+nevVal }),
    //等效于写为
    // '/inputCode':(nevVal)=> ctx.setModuleState('award', {msg:'inputCode 变为 '+nevVal }),
  });
  ctx.defineComputed({
    //表示计算 所属模块的key inputCode
    '/inputCode':(newVal)=>`${newVal}_${Date.now()}`
  });

  //定义handleStrChange方法
  const handleStrChange = (e) => {
    const inputCode = e.currentTarget.value;

    //两种写法等效
    ctx.dispatch('handleInputCodeChange', inputCode);
    // ctx.reducer.award.handleInputCodeChange(inputCode);
  }

  //定义init函数
  const init = ctx.reducer.award.init;
  //const init = ()=> ctx.dispatch('init');

  //setup会将返回结果放置到settings
  return { handleStrChange, init };
}
```

### mapProps定义
```
//函数组件每次渲染前，mapProps都会被调用，帮助用户组装想要的props数据
const mapProps = ctx => {
  //将bonus的计算结果取出
  const displayBonus = ctx.connectedComputed.award.bonus;
  //将settings里的 handleStrChange方法、init方法 取出
  const { handleStrChange, init } = ctx.settings;
  //将inputCode取出
  const { inputCode, awardList, mask, msg } = ctx.connectedState.award;

  //从refConnectedComputed获取实例对模块key的计算值
  const { inputCode:cuInputCode } = ctx.refConnectedComputed.award;

  //该返回结果会映射到组件的props上
  return { msg, cuInputCode, init, mask, inputCode, awardList, displayBonus, handleStrChange }
}
```
### 连接函数组件
```
const AwardPanel = connectDumb({setup, mapProps, connect:{award:'*'}})(AwardPanelUI);
```
### hook真的是答案吗
有了`setup`的支持，可以将这些要用到方法提升为静态的上下文api，而不需要反复重定义，也不存在大量的临时闭包问题，同时基于函数式的写法，可以更灵活的拆分和组合你的U代码与业务代码，同时这些setup函数，经过进一步抽象，还可以被其他地方复用。

同时函数式编程也更利于`typescript`做类型推到，`concent`对函数组件友好支持，让用户可以在`class`和`function`之间按需选择，`concent`还允许定义`state`来做局部状态管理，所以经过`connectDumb`包裹的`function`组件，既能够读写本地状态，又能够读写store状态，还有什么更好的理由非要使用`hook`不可呢？
```
const AwardPanel = connectDumb({
  //推荐写为函数式写法，因为直接声明对象的话，concent也会对其做深克隆操作
  //state:()=>({localName:1});
  state:{localName:1},
  setup, 
  mapProps, 
  connect:{award:'*'}
})(AwardPanelUI);

//code in setup
const setup = ctx =>{
  const changeLocalName = name => ctx.setState({localName});
  return {changeLocalName};
}

//code in mapProps
const mapProps = ctx =>{
  const localName = ctx.state.localName;
  return {localName}; 
}
```

## 更加注重使用体验的架构
将`concent`接入`react`应用是非常轻松和容易的，对于已存在的react应用，不需要你修改现有的react应用任何代码，只需要先将`concent`启动起来，就可以使用了，不需要在顶层包裹`Provider`之类的组件来提供全局上下文，因为启动`concent`之后，`concent`自动就维护着一个自己的全局上下文，所以你可以理解`concent`和`react`应用是一个平行的关系，而非嵌套后者包裹的关系，唯一注意的是在渲染`react`应用之前，优先将`concent`启动就可以了。
![cc-struct](/concent-site/img/cc-struct.png)

### 分离式的模块配置
`concent`并非要求用户在启动时就配置好各个模块的定义，允许用户定义某些组件时，调用`configure`函数配置模块，这将极大提高定义`page model`或者`component model`的编码体验。
```
.
|____page
| |____Group
| | |____index.js
| | |____model//定义page model
| |   |____reducer.js //可选
| |   |____index.js
| |   |____computed.js //可选
| |   |____state.js //必包含
| |   |____watch.js //可选
| |   |____init.js //可选
| |
| |____...//各种page组件定义
|
|____App.css
|____index.js
|____utils
| |____...
|____index.css
|____models// 各种业务model的定义
| |____home
| | |____reducer.js
| | |____index.js
| | |____computed.js
| | |____state.js
|
|____components
| |____Nav.js
|
|____router.js
|____logo.png
|____assets
| |____...
|____run-cc.js //启动concent，在入口index.js里第一行就调用
|____App.js
|____index.js //项目入口文件
|____services
| |____...

```
以上图代码文件组织结构为例，page组件`Group`包含了一个自己的`model`,在`model/index.js`里完成定义模块到`concent`的动作,
```
// code in page/Group/model/index.js
import state form './state';
import * as reducer form './reducer';
import * as computed form './computed';
import * as watch form './watch';
import init form './init';
import {configure} from 'concent';

//配置模块到`concent`里，命名为'group'
configure('group', {state, reducer, computed, watch, init});
```
在Group组件对外暴露前，引入一下`model`就可以了
```
import './model';

@register('GroupUI', {module:'group'})
export default class extends Component {

}
```
这种代码组织方式为用户发布携带完整`model`定义的`concent`组件到npm成为了可能，其他用户只需安装它的`concent`应用里，安装了该组件就能直接使用该组件，甚至不使用组件的UI逻辑，只是注册他新写的组件到该组件携带的模块里，完完全全复用模块的除了ui的其他所有定义。

### 模块克隆
对于已有的模块，有的时候我们想完全的复用里面的所有定义但是运行时是彻底隔离的，如果用最笨的方法，就是完全copy目标模块下的所有代码，然后起一个新的名字，配置到`concent`就好了，可是如果有10个、20个甚至更多的组件想复用逻辑但是保持运行时隔离怎么办呢？显然复制多份代码是行不通的，`concent`提供`cloneModule`函数帮助你完成此目的，实际上`cloneModule`函数只是对`state`做了一个深拷贝，其他的因为都是函数定义，所以只是让新模块指向那些函数的引用。

基于`cloneModule`可以在运行时任意时间调用的特性，你甚至可以写一个工厂函数，动态创解绑定了新模块的组件！
```
//makeComp.js
import existingModule from './demoModel';
import { register, cloneModule } from 'concent';

const module_comp_= {};//记录某个模块有没有对应的组件

class Comp extends Component(){
  //......
}

export makeComp(module, CompCcClassName){
  let TargetComp = module_comp_[module];
  if(TargetComp) return TargetComp;

  //先基于已有模块克隆新模块
  cloneModule(module, existingModule);

  //因为module是不能重复的，ccClassName也是不能重复的，
  //所有用户如果没有显式指定ccClassName值的话，可以默认ccClassName等于module值
  const ccClassName = CompCcClassName || module;

  //注册Comp到新模块里
  TargetComp = register(ccClassName, {module})(Comp);
  //缓存起来
  module_comp_[module] = TargetComp;

  return TargetComp;
}

```

## 附：concent组件工作流程
![cc-process](/concent-site/img/cc-process.png)