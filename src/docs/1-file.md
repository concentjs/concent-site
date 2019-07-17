## welcome star
你的star将是我最大的精神鼓励，[欢迎star](https://github.com/concentjs/concent)🥺🥺🥺

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

![cc-dispatch](https://user-gold-cdn.xitu.io/2019/7/17/16bfebea587e3779?w=1270&h=539&f=png&s=34762)

如果链式调用层级过深，会造成很多次渲染，从上图中可以看出有3个函数返回新的片段状态，造成3次渲染，所以`concent`也同样提供`lazyDispatch`句柄来让用户可以有多一种选择来触发对`reducer`函数的调用，`concent`会在调动过程中自动缓存当前调用链上所有属于同一个模块的状态并做合并，直到调用链结束，才做一次性的提交

![cc-lazy-dispatch](https://user-gold-cdn.xitu.io/2019/7/17/16bfebea58b11da3?w=1092&h=563&f=png&s=37078)
### computed
`computed`提供一个入口定义需要对发生变化的key做计算的函数，通常来说，大部分state的数据并非是UI渲染直接需要的数据，我们通常需要对其做一些格式化或者转换操作，但是这些操作其实没有必要再每次渲染前都做一遍，`computed`将只对发生了变化的`key`计算并将其结果缓存起来。
### watch
`watch`和`computed`最大的不同是，不需要返回一个具体的结果，通常用于在关心某些`key`变化时，做一些异步操作，就可以对这些`key`定义`watch`函数
### init
我们知道state的定义是同步的，`init`允许用户有一次对`state`做异步获取并改写的机会，注意，如果此时存在着该模块的实例，改写了模块的状态后，`concent`会自动将这些状态广播到对应的实例上，同样的，如果不存在，在有些的该模块的实例生成时，这些实例将同步到模块最新的状态，所以当我们有一些状态不是需要依赖实例挂载上且触发`componentDidMount`来获取的时候，就可以将状态的初始化提升到模块的`init`里

![cc-lazy-dispatch](https://user-gold-cdn.xitu.io/2019/7/17/16bfebea58d9013c?w=762&h=260&f=png&s=16664)

## 灵活的模块和组件映射关系
模块是先于组件存在的概念，当我们有了模块的定义后，便可以对组件提供强有力的支持，`concent`里通过`register`函数将react组件注册为concent组件(也称之为concent类)

![cc-lazy-dispatch](https://user-gold-cdn.xitu.io/2019/7/17/16bfebed27c7b9d3?w=598&h=276&f=png&s=10018)

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
![cc-ccclass-module](https://user-gold-cdn.xitu.io/2019/7/17/16bfebef45665ecc?w=668&h=322&f=png&s=12186)
对于`CcClass`来说，因为调用`setState`就能够修改store，所以数据是直接注入到`state`里的，对于其他模块的数据，是注入到`connectedState`,这样既保持了所属模块和其他模块的数据隔离，又能够让用户非常方便消费多个模块的数据。
![cc-class-and-instance-state](https://user-gold-cdn.xitu.io/2019/7/17/16bfebef45a7809e?w=797&h=504&f=png&s=40903)

所以整体来说，组件与`store`之间将构成一张关系明确和清晰的结构网，有利于用户为大型的`react`工程初期整齐的划分业务模块，中期灵活的调整模块定义
![cc-class-and-store](https://user-gold-cdn.xitu.io/2019/7/17/16bfebf074609fca?w=859&h=611&f=png&s=45185)

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
    //key inputCode的值发生变化时，触发此观察函数
    'inputCode':(nevVal)=> ctx.setState({msg:'inputCode 变为 '+nevVal })
  });
  ctx.defineComputed({
    //key inputCode的值发生变化时，触发此计算函数
    'inputCode':(newVal)=>`${newVal}_${Date.now()}`
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
  const displayBonus = ctx.moduleComputed.bonus;
  //将settings里的 handleStrChange方法、init方法 取出
  const { handleStrChange, init } = ctx.settings;
  //将inputCode取出
  const { inputCode, awardList, mask, msg } = ctx.moduleState;

  //从refConnectedComputed获取实例对模块key的计算值
  const { inputCode:cuInputCode } = ctx.refComputed.award;

  //该返回结果会映射到组件的props上
  return { msg, cuInputCode, init, mask, inputCode, awardList, displayBonus, handleStrChange }
}
```
### 连接函数组件
```
const AwardPanel = connectDumb({setup, mapProps, module:'award'})(AwardPanelUI);
```
### hook真的是答案吗
有了`setup`的支持，可以将这些要用到方法提升为静态的上下文api，而不需要反复重定义，也不存在大量的临时闭包问题，同时基于函数式的写法，可以更灵活的拆分和组合你的U代码与业务代码，同时这些setup函数，经过进一步抽象，还可以被其他地方复用。

同时函数式编程也更利于`typescript`做类型推导，`concent`对函数组件友好支持，让用户可以在`class`和`function`之间按需选择，`concent`还允许定义`state`来做局部状态管理，所以经过`connectDumb`包裹的`function`组件，既能够读写本地状态，又能够读写store状态，还有什么更好的理由非要使用`hook`不可呢？
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
将`concent`接入`react`应用是非常轻松和容易的，对于已存在的react应用，不需要你修改现有的react应用任何代码，只需要先将`concent`启动起来，就可以使用了，不需要在顶层包裹`Provider`之类的组件来提供全局上下文，因为启动`concent`之后，`concent`自动就维护着一个自己的全局上下文，所以你可以理解`concent`和`react`应用是一个平行的关系，而非嵌套或者包裹的关系，唯一注意的是在渲染`react`应用之前，优先将`concent`启动就可以了。
![cc-struct](https://user-gold-cdn.xitu.io/2019/7/17/16bfebf400c8bcbc?w=854&h=625&f=png&s=46179)

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

## concent组件工作流程
concent组件并非魔改了react组件，只是在react组件上做了一层语法糖封装，整个react组件的生命周期依然需要被你了解，而`concentDumb`将原生命周期做了巧妙的抽象，才得以使用`defineEffect`、`defineWatch`、`defineComputed`等有趣的功能而无需在关注类组件的生命周期，无需再和`this`打交道，让函数组件和类组件拥有完全对等的功能。
![cc-process](https://user-gold-cdn.xitu.io/2019/7/17/16bfebf9988c356f?w=1269&h=883&f=png&s=121472)

## 对比主流状态管理方案
我们知道，现有的状态框架，主要有两大类型，一个是`redux`为代表的基于对数据订阅的模式来做状态全局管理，一种是以`mobx`为代表的将数据转变为可观察对象来做主动式的变更拦截以及状态同步。

## vs redux
我们先聊一聊`redux`，这个当前`react`界状态管理的一哥。
### redux难以言语的reducer
写过`redux`的用户，或者`redux wrapper`（如`dva`、`rematch`等）的用户，都应该很清楚 `redux`的一个约定：`reducer`必需是纯函数，如果状态改变了，必需解构原`state`返回一个新的`state`
```
// fooReducer.js
export default (state, action)=>{
  switch(action.type){
    case 'FETCH_BOOKS':
      return {...state, ...action.payload};
    default:
      return state;
  }
}
```
纯函数没有副作用，容易被测试的特点被提起过很多次，我们写着写着，对于`actionCreator`和`reducer`，有了两种流派的写法，
- 一种是将异步的请求逻辑以及请求后的数据处理逻辑，都放在`actionCreator`写完了，然后将数据封装为`payload`,调用`dispatch`,
讲数据派发给对应的`reducer`。

> 此种流派代码，慢慢变成`reducer`里全是解构`payload`然后合成新的`state`并返回的操作，业务逻辑全部在
`actionCreator`里了，此种有一个有一个严重的弊端，因为业务逻辑全部在`actionCreator`里，`reducer`函数里的`type`值全部变成了一堆类似`CURD`的命名方式，`saveXXModel`、`updateXXModelXXField`、`setXXX`、`deleteXXX`等看起来已经和业务逻辑全然没有任何关系的命名，大量的充斥在`reducer`函数里，而我们的状态调试工具记录的`type`值恰恰全是这些命名方式，你在调试工具里看到变迁过程对应的`type`列表，只是获取到了哪些数据被改变了的信息，但全然不知这些状态是从哪些地方派发了`payload`导致了变化，甚至想知道是那些UI视图的什么交互动作导致了状态的改变，也只能从代码的`reducer`的`type`关键字作为搜索条件开始，反向查阅其他代码文件。
- 还有一种是让`actionCreator`尽可能的薄，派发同步的action就直接return，异步的action使用thunk函数或者`redux-saga`等第三方库做处理，拿到数据都尽可能早的做成`action`对象，派发到`reducer`函数里，
> 此种模式下，我们的`actionCreator`薄了，做的事情如其名字一样，只是负责产生`action`对象，同时因为我们对数据处理逻辑在`reducer`里了，我们的`type`值可以根据调用方的动机或者场景来命名了，如`formatTimestamp`、`handleNameChanged`、`handelFetchedBasicData`等，但是由于`redux`的架构导致，你的ui触发的动作避免不了的要要经过两个步骤，一步经过`actionCreator`生成`action`，第2步进过经过`reducer`处理`payload`合成新的`state`，所以`actionCreator`的命名和`reducerType`的命名通常为了方便以后阅读时能够带入上下文信息很有可能会变成一样的命名，如`fetchProductList`，在`actionCreator`里出现一遍，然后在`reducerType`又出现一遍

### concent化繁为简的reducer
concent里`reducer`担任的角色就是负责返回一个新的片段视图，所以你可以认为它就是一个`partialStateGenerator`函数，你可以声明其为普通函数
```
//code in fooReducer.js
function fetchProductList(){
}
```
也可以是async函数或者generator函数
```
async function fetchProductList(){
}
```
如果，你的函数需要几步请求才能完成全部的渲染，但是每一步都需要及时触发视图更新，concent允许你自由组合函数，如果同属于一个模块里的`reducer`函数，相互之间还可以直接基于函数签名来调用
```javascript
function _setProductList(dataList){
  return {dataList};
}

//获取产品列表计基础数据
async function fetchProductBasicData(payload, moduleState, ctx){
  const dataList = await api.fetchProductBasicData();
  return {dataList};//返回数据，触发渲染
  // or ctx.dispatch(_setProductList, dataList);
}

//获取产品列表计统计数据，统计数据较慢，分批拉取 (伪代码)
async function fetchProductStatData(payload, moduleState, ctx){
  const dataList = moduleState.dataList;
  //做分批拉取统计数据的ids，逻辑略...... 
  const batchIdsList = [];
  const len = batchIds.length;

  for(let i=0; i<len; i++){
    const ids = batchIdsList[i];
    const statDataList = await api.fetchProductBasicData(ids);

    //逻辑略...... 游标开始和结束，改变对应的data的统计数据
    let len = statDataList.length;
    for(let j=0; j<len; j++){
      dataList[j+cursor].stat = statDataList[j];//赋值统计数据
    }
    await ctx.dispatch(_setProductList, dataList);//修改dataList数据，触发渲染
  }
}

//一个完整的产品列表既包含基础数据、也包含统计数据，分两次拉取，其中统计数据需要多次分批拉取
async function fetchProductList(payload, moduleState, ctx){
  await ctx.dispatch(fetchProductBasicData);
  await ctx.dispatch(fetchProductStatData);
}
```
现在你只需要视图实例里调用`$$dispatch`触发更新即可
```
//属于product模块的实例调用
this.$$dispatch('fetchProductList');

//属于其他模块的实例调用
this.$$dispatch('product/fetchProductList');
```

可以看到，这样的代码组织方式，更符合调用者的使用直觉，没有多余的操作，相互调用或者多级调用，可以按照开发者最直观的思路组织代码，并且很方便后期不停的调整后者重构模块里的reducer。

concent强调返回欲更新的片段状态，而不是合成新的状态返回，从工作原理来说，因为concent类里标记了观察key信息，reducer提交的状态越小、越精准，就越有利于加速查找到关心这些key值变化的实例，还有就是concent是允许对key定义`watch`和`computed`函数的，保持提交最小化的状态不会触发一些冗余的`watch`和`computed`函数逻辑；从业务层面上来说，你返回的新状态是需要符合函数名描述的，我们直观的解读一段函数时，大体知道做了什么处理，最终返回一个什么新的片段状态给concent，是符合线性思维的^_^，剩下的更新UI的逻辑就交给concent吧。

可能读者留意到了，`redux`所提倡的纯函数容易测试、无副作用的优势呢？在concent里能够体现吗，其实这一点担心完全没有必要，因为你观察上面的reducer示例代码可以发现，函数有无副作用，完全取决于你声明函数的方式，async(or generator)就是副作用函数，否则就是纯函数，你的ui里可以直接调用纯函数，也可以调用副作用函数，根据你的使用场景具体决定，函数名就是`type`，没有了`actionCreator`是不是世界清静了很多？

进一步挖掘`reducer`本质，上面提到过，对于concent来说，`reducer`就是`partialStateGenerator`函数，所以如果讨厌走dispatch流派的你，可以直接定义一个函数，然后调用它，而非必需要放置在模块的`reducer`定义下。
```javascript
function inc(payload, moduleState, ctx){
  ctx.dispatch('bar/recordLog');//这里不使用await，表示异步的去触发bar模块reducer里的recordLog方法
  return {count: moduleState.count +1 };
}

@register('Counter', 'counter')(Counter)
class Counter extends Component{
  render(){
    return <div onClick={()=> this.$$invoke(inc}>count: {this.state.count}</div>
  }
}
```

`concent`不仅书写体验友好，因为`concent`是以引用收集为基础来做状态管理，所以在concent提供的状态调试工具里可以精确的定位到每一次状态变更提交了什么状态，调用了哪些方法，以及由哪些实例触发。
![cc-core](https://user-gold-cdn.xitu.io/2019/7/17/16bfec79341b8a44?w=897&h=562&f=png&s=44430)

### redux复杂的使用体验
尽管`redux`核心代码很简单，提供`composeReducers`、`bindActionCreators`等辅助函数，作为桥接`react`的`react-redux`提供`connect`函数，需要各种手写`mapStateToProps`和`mapDispatchToProps`等操作，整个流程下来，其实已经让代码显得很臃肿了，所以有了`dva`、`rematch`等`redux wrapper`做了此方面的改进，化繁为简，但是无论怎么包装，从底层上看，对于`redux`的更新流程来说，任何一个`action`派发都要经过所有的`reducer`，`reducer`返回的状态都要经过所有`connect`到此`reducer`对应状态上的所有组件，经过一轮浅比较（这也是为什么redux一定要借助解构语法，返回一个新的状态的原因），决定要不要更新其包裹的子组件。
```
const increaseAction = {
  type: 'increase'
};

const mapStateToProps = state => {
  return {value: state.count}
};

const mapDispatchToProps = dispatch => {
  return {
    onIncreaseClick: () => dispatch(increaseAction);
  }
};


const App = connect(
  mapStateToProps,
  mapDispatchToProps
)(Counter);

```
### concent简单直接的上手体验
注册成为concent类的组件，天生就有操作store的能力，而且数据将直接注入`state`
```
//Counter里直接可以使用this.$$dispatch('increase')
class Counter extends Component{
  render(){
    return <div onClick={()=> this.$$dispatch('increase')}>count: {this.state.count}</div>
  }
}

const App = register('Counter', 'counter')(Counter);
```
你可以注意到，concent直接将`$$dispatch`方法，绑定在this上，因为concent默认采用的是反向继承策略来包裹你的组件，这样产生更少的组件嵌套关系从而使得Dom层级更少。

store的`state`也直接注入了this上，这是因为从`setState`调用开始，就具备了将转态同步到`store`的能力，所以注入到`state`也是顺其自然的事情。

当然concent也允许用户在实例的`state`上声明其他非`store`的key，这样他们的值就是私有状态了，如果用户不喜欢`state`被污染，不喜欢反向继承策略，同样的也可以写为
```
class Counter extends Component{
  constructor(props, context){
    super(props, context);
    this.props.$$attach(this);
  }
  render(){
    return(
      <div onClick={()=> this.props.$$dispatch('increase')}>
        count: {this.props.$$connectedState.counter.count}
      </div>
    )
  }
}

const App = register('Counter', {connect:{counter:'*'}, isPropsProxy:true} )(Counter);
```

## vs mobx
`mobx`是一个函数响应式编程的库，提供的桥接库`mobx-react`将`react`变成彻底的响应式编程模式，因为`mobx`将定义的状态的转变为可观察对象，所以
用户只需要修改数据，`mobx`会自动将对应的视图更新，所以有人戏称`mobx`将`react`变成类似`vue`的编写体验，数据自动映射视图，无需显示的调用`setState`了。

本质上来说，所有的`mvvm`框架都在围绕着数据和视图做文章，react把单项数据流做到了极致，`mobx`为`react`打上数据自动映射视图的补丁，提到自动映射，自动是关键，框架怎么感知到数据变了呢？`mobx`采用和`vue`一样的思路，采用`push`模式来做变化侦测，即对数据`getter`和`setter`做拦截，当用户修改数据那一刻，框架就知道数据变了，而`react`和我们当下火热的小程序等采用的`pull`模式来做变化侦测，暴露`setState`和`setData`接口给用户，让用户主动提交变更数据，才知道数据发生了变化。

`concent`本质上来说没有改变`react`的工作模式，依然采用的是`pull`模式来做变化侦测，唯一不同的是，让`pull`的流程更加智能，当用户的组件实例创建好的那一刻，`concent`已知道如下信息：
- 实例属于哪个模块
- 实例观察这个模块的哪些key值变化
- 实例还额外连接其他哪些模块

同时实例的引用将被收集到并保管起来，直到卸载才会被释放。

所以可以用0改造成本的方式，直接将你的react代码接入到`concent`，然后支持用户可以渐进式的分离你的ui和业务逻辑。

### 需要自动映射吗
这里我们先把问题先提出来，我们真的需要自动映射吗？

当应用越来越大，模块越来越多的时候，直接修改数据导致很多不确定的额外因素产生而无法追查，所以`vue`提供了`vuex`来引导和规范用户在大型应用的修改状态的方式，而`mobx`也提供了`mobx-state-tree`来约束用户的数据修改行为，通过统一走`action`的方式来让整个修改流程可追查，可调试。

### 改造成本
所以在大型的应用里，我们都希望规范用户修改数据的方式，那么`concent`从骨子里为`react`而打造的优势将体现出来了，可以从`setState`开始享受到状态管理带来的好处，无需用户接入更多的辅助函数和大量的装饰器函数（针对字段级别的定义），以及完美的支持用户渐进式的重构，优雅的解耦和分离业务逻辑与ui视图，写出的代码始终还是`react`味道的代码。

## 结语
`concent`围绕`react`提供一种了更舒适、更符合阅读直觉的编码体验，同时新增了更多的特性，为书写`react`组件带来更多的趣味性和实用性，不管是传统的`class`流派，还是新兴的`function`流派，都能够在`concent`里享受到统一的编码体验。

依托于concent的以下3点核心工作原理：
- 引用收集
- 观察key标记
- 状态广播

基于引用收集和观察key标记，就可以做到热点更新路径缓存，理论上来说，某一个reducer如果返回的待更新片段对象形状是不变的，初次触发渲染的时候还有一个查找的过程（尽管已经非常快），后面的话相同的reducer调用都可以直接命中并更新，有点类似v8里的热点代码缓存，不过concent缓存的reducer返回数据形状和引用之间的关系，所以应用可以越运行越快，尤其是那种一个界面上百个组件，n个模块的应用，将体现出更大的优势，这是下一个版本concent正在做的优化项，为用户带来更快的性能表现和更好的编写体验是`concent`始终追求的目标。
 
## 彩蛋 [Ant Design Pro powered by concent](https://github.com/concentjs/antd-pro-concent) 🎉🎉🎉
尽管`concent`有一套自己的标准的开发方式，但是其灵活的架构设计非常的容易与现有的项目集成，此案例将`concent`接入到`antd-pro`(js版本的最后一个版本2.2.0)，源代码业务逻辑没有做任何改动，只是做了如下修改，lint-staged验收通过：
- 在src目录下加入runConcent脚本
- models 全部替换为concent格式定义的，因为umi会自动读取model文件夹定义注入到dva里，所以所有concent相关的model都放在了model-cc文件夹下
- 组件层的装饰器，全部用`concent`替换了`dva`，并做了少许语法的修改
- 引入`concent-plugin-loading`插件，用于自动设置`reducer`函数的开始和结束状态
- 引入`react-router-concent`，用于连接`react-router`和`concent`
- 引入`concent-middleware-web-devtool`(第一个可用版本，比较简陋^_^)，用于查看状态`concent`状态变迁过程
> 注意，运行期项目后，可以打开console，输入`sss`,查看store，输入`cc.dispatch`或`cc.reducer.**`直接触发调用，更多api请移步[concent官网文档](https://concentjs.github.io/concent-site/)查看，更多antd-pro知识了解请移步[antd-pro官网](https://pro.ant.design/index-cn)

## 如何运行
* 下载源代码
```
git clone git@github.com:concentjs/antd-pro-concent.git
```
* 进入根目录，安装依赖包
```
npm i
```
* 运行和调试项目
```
npm start
```
> 默认src目录下放置的是`concent`版本的源代码，如需运行`dva`版本，执行`npm run start:old`，切换为`concent`,执行`npm run start:cc`

## 其他
happy coding, enjoy concent ^_^   
[欢迎star](https://github.com/concentjs/concent)
___
<div align="center">

An out-of-box UI solution for enterprise applications as a React boilerplate.

![](https://user-gold-cdn.xitu.io/2019/7/17/16bfec863f99054c?w=3104&h=1914&f=png&s=573962)