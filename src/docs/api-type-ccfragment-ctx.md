---
id: api-type-ccfragment-ctx
title: CcFragmentCtx
sidebar_label: CcFragmentCtx
---
`CcFragmentCtx`对象里90%的属性和`CcClass`里报纸用法一致，唯一不同的是`CcClass`里很多方法加了`$$`前缀，表示这里来自于`concent`提供的方法，而`CcFragment`因为弱化了`class`的概念，所有提供的方法都放在`CcFragmentCtx`里，就没有再加`$$`前缀。

更详细的使用方式可以移步左侧导航栏`类api`查看
___
## 出现场合
 - `CcFragment` props.render
 ```
 (ctx:CcFragmentCtx)=> ReactDOM
 ```

 ## 类型参数定义
 ```
 type CcFragmentCtx = {
  module:string, //cc片段所属的模块

  // 在cc片段里定义的实例级别的计算函数返回的结果, 
  // 当计算的stateKey是无模块前缀的stateKey时，计算结果收集到此对象
  // 当计算的stateKey的模块前缀和实例所属模块一样时，计算结果收集到此对象
  refComputed:{[computedStateKey:string]: any}}, 

  //在cc片段里定义的实例级别的计算结果，带模块前缀的stateKey的计算结算都会收集到此对象
  refConnectedComputed:{[moduleName:string]:{[computedStateKey:string]: any}},
  
  // 当实例连接多个模块时，各个模块computed里定义的stateKey的计算结算都会收集到此对象
  connectedComputed: {[moduleName:string]:{[computedStateKey:string]: any}},

  // 实例所属模块的computed里定义的stateKey的计算结算都会收集到此对象
  moduleComputed: {[computedStateKey:string]: any}},

  // 当实例连接多个模块时，各个模块的state会收集到此对象
  connectedState: {[moduleName:string]:object},

  // 实例所属模块的state
  moduleState: object,

  // 实例所属模块的对象和用户自定义的对象的合成结果
  state: object,

  // 实例的props
  props: object,

  // CcFragment自己的props
  fragmentProps: object,

  // 定义副作用
  definedEffect: (
    // 定义副作用函数，执行时机由下面的参数(stateKeys,immediate)决定
    // 可以返回一个清理函数，在组件卸载时会被触发
    fn:()=>Function|undefined, 
    //- 空数组时，只在组件初次挂载执行一次
    //- 不指定时，每次渲染都执行
    //- 指定具体的stateKeys，只有这些stateKeys对应的值发生变化才执行副作用函数
    stateKeys?:string[]|null|undefined, 
    //副作用函数id，默认有concent自动生成，
    //如果用户需要动态的暂停副作用或者删除副作用，才需要显示的设置此值
    eId?:string, 
    //配置指定了具体的stateKeys时，默认是不立即执行的，设定immediate为true，组件初次挂载也触发一次执行
    immediate?:bool
  )=>void

  //按id暂停、恢复、移除副作用
  stopEffect: (eId:string)=>void,
  resumeEffect: (eId:string)=>void,
  removeEffect: (eId:string)=>void,

  //暂停、恢复、移除所有副作用
  stopAllEffect: (eId:string)=>void,
  resumeAllEffect: (eId:string)=>void,
  removeAllEffect: (eId:string)=>void,

  //定义watch函数
  defineWatch: (
    watch: (fragmentCtx:CcFragmentCtx)=>{[watchKey:string]: WatchFn } | {[watchKey:string]: WatchFn }
  )=>void,

   //定义computed函数
  defineComputed: (
    computed: (fragmentCtx:CcFragmentCtx)=>{[computedKey:string]: ComputedFn } | {[computedKey:string]: ComputedFn }
  )=>void,

  //setup返回结果会收集到此处
  settings: object,

  //对布尔值自动取反
  syncBool:(keyPath:string, delay?:number, identity?:string)=>setterFn,
  //尝试自动读取dom上的 data-ccsync属性来当keyPath
  syncBool:(event:Event)=>void,

  sync:(keyPath:string, value:any, delay?:number, identity?:string)=>setterFn,
  //尝试自动读取dom上的 data-ccsync属性来当keyPath
  sync:(event:Event)=>void,

  //自动将输入值转换为int
  syncInt:(keyPath:string, delay?:number, identity?:string)=>setterFn,
  //尝试自动读取dom上的 data-ccsync属性来当keyPath
  sync:(event:Event)=>void,

  //set和sync的不同之地在于，
  //- sync是为你生成一个setter函数,方便让你直接绑定在dom事件处理函数上
  //- set是直接调用就修改状态了
  set: (keyPath:string, value:any, delay?:number, identity?:string)=>void,

  //对目标keyPath的值自动取反
  setBool: (keyPath:string, delay?:number, identity?:string)=>void,

  //如果此组件是挂载在Router里的组件,
  //在组件存在期，刷新此组件对应的路由，默认是不会刷新此组件的
  //接入react-router-concent后，但路由有push，pop, replace操作时，
  //都会尝试调用onUrlChanged函数
  onUrlChanged: (fn:Function)=>void;

  emit:(eventName:string, ...args:any[])=>void,
  emitIdentity:(eventName:string, identity:string, ...args:any[])=>void,

  on:(eventName:string, handler:(..args:any[])=>void),
  onIdentity:(eventName:string, identity:string, handler:(..args:any[])=>void),

  dispatch: (typeDesc:string, payload?:any, delay?:number, identity?:string)=>Promise<any>,
  lazyDispatch: (typeDesc:string, payload?:any, delay?:number, identity?:string)=>Promise<any>,

  invoke: (
    fn: (payload:any, moduleState:object, ctx:HandlerCtx)=>object | undefined, 
    payload?:object, 
    delay?:number, 
    identity?:string
  )=>Promise<any>,
  lazyInvoke: (
    fn: (payload:any, moduleState:object, ctx:HandlerCtx)=>object | undefined, 
    payload?:object, 
    delay?:number, 
    identity?:string
  )=>Promise<any>,

  setModuleState: (moduleName:string, state:object, delay?:number, identity?:string)=>void;
  //默认修改自己所属模块的state
  //区别于setState, setModuleState不能够提交私有状态
  setModuleState: (state:object, delay?:number, identity?:string)=>void;

  setState: (state:object, reactCallback:Function, delay?:number, identity?:string)=>void;

  forceUpdate: (reactCallback:Function, delay?:number, identity?:string)=>void;
 }
 ```
