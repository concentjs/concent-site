---
id: doc-guid-progressive-dev
title: 渐进式的开发
sidebar_label: 渐进式的开发
---
___
得益于`concent`弹性的api设计，和非入侵式的接入方式，用户可以基于经典的`react`编码方式逐步改造或者重构，你也可以根据实际情况局部使用，在根据后续发展情况决定是否要接入到整个应用，这种平滑的过度方式给予用户更多的灵活&自由度。
## 需求
我么先给自己假设一个功能需求：需要提供这样一个页面给用户，界面上绘制一个input框，支持用户输入任意字符，用户输入内容并提交后，如果是首次输入`666`就给用户发放奖励，并给用户添加积分，积分大于1000的时候展示为1000+、2000+，以此类推，同时当用户关闭奖励面板时，上报一次关闭行为发生的数据。

## 传统写法
我们按照传统写法来实现一遍 [在线示例](https://stackblitz.com/edit/cc-course-award-panel-v1?file=index.js):
```
class AwardPanel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      mask: false,//用于用户中奖时，禁止用户的后续操作
      inputCode: '',//用户输入的内容
      awardList: [],//已获得的奖励列表
      bonus: 0,//已获得的积分
      displayBonus: 0,//用于展示的积分
    }
  }
  /** 首次挂载完毕，做初始化动作 */
  componentDidMount() {
    this.init();
  }
  /** 关闭时上报关闭行为 */
  componentWillUnmount(){
    api.track('closeAwardPanel');
  }
  /** 初始化获取奖励和积分 */
  init = () => {
    this.setState({mask:true});
    Promise.all([
      api.fetchAwardList().then(awardList => this.setState({ awardList })),
      api.fetchBonus().then(this.convertBonus)
    ]).then(()=>this.setState({mask:false}));
  }
  /** 转换积分 */
  convertBonus = (bonus) => {
    let displayBonus;
    if (bonus < 1000) {
      displayBonus = bonus;
    } else {
      displayBonus = parseInt(bonus / 1000) * 1000 + '+';
    }
    this.setState({ bonus, displayBonus });
  }
  /** 处理输入变化 */
  handleStrChange = (e) => {
    const { awardList } = this.state;
    const inputCode = e.currentTarget.value;
    const toSet = { inputCode };
    //首次中奖
    if (inputCode === '666' && !awardList.find(v => v.code === '666')) {
      api.giveUserAward(userId, inputCode).then(this.init);
    }
    this.setState(toSet);
  }
  render() {
    const { mask, inputCode, awardList, displayBonus } = this.state;
    return (
      <div style={stBox}>
        {
          mask ? <div style={stMask}>loading</div> : ''
        }
        <div>
          <input value={inputCode} onChange={this.handleStrChange} />
          <button onClick={this.init}>刷新</button>
        </div>
        <div>awardList: {awardList.map((v, idx) => <div>{v.name} *{v.num}</div>)}</div>
        <div>displayBonus: {displayBonus}</div>
      </div>
    );
  }
}
```
> 可以看出，整个AwardPanel类里已经包含不少业务逻辑，当某一天我们需要在另一处也写一个奖励面板时，除了ui，业务都是要复用的，这种混杂在一起的写法，随着迭代的深入，终将会面临着到处都充斥着重复的代码。
## 抽象模块
我们这里抽象出一个业务模块`award`，把`AwardPanel`看做消费`award`模块状态的组件之一，将来可能有其他组件需要消费`award`模块的状态时，就可以很方便的连接到`award`模块了。

上例中显然`awardList`、`bonus`和`displayBonus`是属于`award`业务模块，剩下的`mask`和`inputCode`属于组件实例自己独立维护的和业务无关的状态，我们将`awardList`、`bonus`和`displayBonus`抽离出来，交给[run](api-top-run)启动时载入
```
import { run, register } from 'concent';
run({
  award:{
    state:{
      awardList: [],//已获得的奖励列表
      bonus: 0,//已获得的积分
      displayBonus: 0,//用于展示的积分
    }
  }
});

```
## 注册成为concent类，指定所属模块
载入`award`模块后，所有concent组件可以消费指定模块的数据了，我们将上面基于写好的`AwardPanel`，一行代码都不用改动得情况下，使用[register](api-top-register)函数直接注册为concent组件`AwardPanel_`后，再交给react渲染
```
const AwardPanel_ = register(
  'AwardPanel', 
  {
    module:'award', //指定该组件属于award模块
    //共享award模块的所有状态变化，等同于写为 ['awardList','bonus','displayBonus']
    sharedStateKeys:'*',//不定义的话，就是默认观察所有key变化
  }
)(AwardPanel);
```
>运行起来后，`concent`将整个`store`绑定在`window.sss`下(后期会提供dev-tool，方便用户可视化的查看store)，用户可以在`console`输入`sss`并回车，就可以查看`concent`的整个`store`数据了

![查看store](/concent-site/img/cc-sss-show.png)

## 改造完成
至此我们再上下文做了3件事情，<b>源代码一行没有改动</b>，该示例依然能够完美正常运行。
- 申明一个模块
- 载入模块，启动concent
- 将组件注册为cc组件，提升state到store

[在线示例](https://stackblitz.com/edit/cc-course-award-panel-v2)

## 抽象reducer函数
reducer函数是我们负责处理数据的核心逻辑，我们在以上基础上继续改造，将上述例子中的`init`、`handleStrChange`，放在一个`reducer.js`文件里，以便达到业务逻辑和渲染逻辑分离的效果
```
// model/reducer.js
export function track(ev){
  alert(ev);
  api.track(ev);
}

export function setMask(mask){
  return {mask};
}

export async function fetchAwardList(){
  const awardList = await api.fetchAwardList();
  return {awardList};
}

export async function fetchBonus(){
  const bonus = await api.fetchBonus();
  return {bonus};
}

export async function init(payload, moduleState, ctx){
  //开启遮罩效果，注意虽然setMask本身不是一个async函数，
  //但是concent将所有reducer函数保证为promise函数，所以这里可以使用await
  //await ctx.dispatch(setMask, true);

  //但是因其setMask内部并没有异步逻辑，所以这里忽略await
  //逻辑依然是从上往下按顺序串行执行的
  ctx.dispatch(  setMask, true);

  //获取奖励列表
  await ctx.dispatch(fetchAwardList);
  //可以基于字符串调用reducer，因为当前同一个模块的reducer函数处于同一个文件，可以直接写函数
  //await ctx.dispatch('fetchAwardList');

  //获取积分
  await ctx.dispatch(fetchBonus);
  //关闭遮罩效果
  ctx.dispatch(setMask, false);
}

export function setState(state){
  return state;
}

export async function handleInputCodeChange(inputCode, moduleState, ctx){
  const { awardList, mask } = moduleState;
  if(mask) return;//请求中，不接受新的输入
  //首次中奖
  if (inputCode === '666' && !awardList.find(v => v.code === '666')) {
    ctx.dispatch(setState, {inputCode, mask:true});
    await api.giveUserAward(userId, inputCode);
    await ctx.dispatch(init);
  }else{
    ctx.dispatch(setState, {inputCode});
  }
}
```
## 抽离computed函数
我们注意到bonus是一个需要进一步计算的值，我们当然可以直接在reducer里直接处理，然后放在state里，但是更好的做法是，对bonus写一个computed函数，这样的话，计算结果会被缓存，只有当bonus发生变化时，才会重新计算
```
//model/computed.js

export function bonus(newVal, oldVal){
  let displayBonus;
  if (newVal < 1000) {
    displayBonus = newVal;
  } else {
    displayBonus = parseInt(newVal / 1000) * 1000 + '+';
  }
  return displayBonus;
}

```
>计算后的结果将搜集在`$$moduleComputed`里，render期间可以通过`this.$$moduleComputed.{key}`获得结果

## concent组件改造完成
然后我们将原来的类改写为如下示例
```
class AwardPanel extends React.Component {
  /** 首次挂载完毕，做初始化动作 */
  componentDidMount() {
    this.$$dispatch('init');
  }
  /** 关闭时上报关闭行为 */
  componentWillUnmount(){
    this.$$dispatch('track');
  }
  /** 处理输入变化 */
  handleStrChange = (e) => {
    const inputCode = e.currentTarget.value;
    this.$$dispatch('handleInputCodeChange', inputCode);
  }
  render() {
    const { mask, inputCode, awardList, displayBonus } = this.state;
    const { bonus:displayBonus } = this.$$moduleComputed;
    return (
      <div style={stBox}>
        {
          mask ? <div style={stMask}>loading</div> : ''
        }
        <div>
          <input value={inputCode} onChange={this.handleStrChange} />
          <button onClick={this.init}>刷新</button>
        </div>
        <div>awardList: {awardList.map((v, idx) => <div>{v.name} *{v.num}</div>)}</div>
        <div>displayBonus: {displayBonus}</div>
      </div>
    );
  }
}
```
我们抽离完reducer函数和computed函数，可以发现ui逻辑已经轻薄很多，这将有利于后续的维护与迭代.

[在线示例](https://stackblitz.com/edit/cc-course-award-panel-v3)

## 升级为函数式组件
class写法会让用户面临着不少`this.`的调用，`concent`基于`CcFragment`抽象了`connectDumb`函数，让用户可以淋漓痛快的用函数式的语法书写你的ui逻辑
### 定义setup
setup在组件初次渲染前执行一次，返回的结果将返回到`ctx.settings`里
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
    'inputCode':(nevVal)=> ctx.setModuleState({msg:'inputCode 变为 '+nevVal }),
  });
  ctx.defineComputed({
    //表示计算 所属模块的key inputCode
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
### 定义mapProps
函数组件每次渲染前，mapProps都会被调用，帮助用户组装想要的props数据
```
const mapProps = ctx => {
  //将bonus的计算结果取出
  const displayBonus = ctx.moduleComputed.bonus;
  //将settings里的 handleStrChange方法、init方法 取出
  const { handleStrChange, init } = ctx.settings;
  //将inputCode取出
  const { msg, inputCode, awardList, mask } = ctx.moduleState;

  const { inputCode:cuInputCode } = ctx.refComputed;

  //该返回结果会映射到组件的props上
  return { msg, cuInputCode, init, mask, inputCode, awardList, displayBonus, handleStrChange }
}
```
### 定义函数组件
用户可以书写function组件，只负责描述UI，绑定数据和方法
```
const AwardPanelUI = (props) => {
  return (
    <div style={stBox}>
      {
        props.mask ? <div style={stMask}>loading</div> : ''
      }
      <div>
        <input value={props.inputCode} onChange={props.handleStrChange} />
        <button onClick={props.init}>刷新</button>
      </div>
      <div>awardList: {props.awardList.map((v, idx) => <div key={idx}>{v.name} *{v.num}</div>)}</div>
      <div>displayBonus: {props.displayBonus}</div>
    </div>
  );
};
```
### 连接到模块
我们使用`connectDumb`将函数组件连接到模块，生成一个新的函数组件
```
const AwardPanel = connectDumb({
  setup, //传入预先定义好的setup
  mapProps, //传入预先定义好的mapProps
  module:'award', //将AwardPanelUI连接到award模块，默认观察该模块的所有key变化
})(AwardPanelUI);
```
### 升级完毕
经过以上几步操作，我们已经将`AwardPanel`由class写法改为function写法，具体该用哪一种写法取决于用户的个人喜好，但是function组件可以灵活组合，更加面向函数式书写体验。

[在线示例](https://stackblitz.com/edit/cc-course-award-panel-v4?file=index.js)