---
id: api-top-emit-with
title: 带配置的发射
sidebar_label: emitWith
---
___
`emitWith`支持定制一些参数来发射事件，比起`emit`方法，支持你挑选更细的维度去发射事件

## 函数签名定义
```
emitWith: (
  eventName:string, 
  option:{
    module?:string, 
    ccClassKey?:string, 
    identity?:string
  }, 
  args?:any[]
)
```
事件的监听是在类里完成的，当你定义好监听函数的时候，这个函数还会带有两个属性：`module`、`ccClassKey`,表示这个事件的监听函数所属的cc类以及模块
> 通常都是在`componentDidMount`里定义事件监听函数，在同一个类里，`concent`只允许对同一个事件名定义一个监听函数，如果你重复定义，
后一个将覆盖掉前一个，
```
componentDidMount(){
  this.$$on('bomb', ()=>{
    console.log('bomb1');
  });

  //这一次定义的监听函数将覆盖掉上面定义的监听函数
  this.$$on('bomb', ()=>{
    console.log('bomb2');
  })
}
```
`concent`允许同一个事件名在不同的类里再次定义监听函数，所以事实上，你调用`emit`函数会命中多个监听函数，如果你只想挑选某些模块或者某些类的监听函数来触发执行

## 如何使用
```
import cc from 'concent';

//触发foo模块下所有cc类实例里的'bomb'事件监听函数
cc.emitWith('bomb', {module:'foo'});

//触发foo模块下cc类里所有Foo类实例里的'bomb'事件函数
cc.emitWith('bomb', {module:'foo', ccClassKey:'Foo'});

//触发cc类里所有Foo类实例里的'bomb'事件函数
cc.emitWith('bomb', {ccClassKey:'Foo'});

//触发cc类实例里带identity签名为'xxx'的'bomb'事件函数
cc.emitWith('bomb', {identity:'xxx'});
```

