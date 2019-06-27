---
id: api-top-get-computed
title: 获取缓存计算值
sidebar_label: getComputed
---
___
获取指定模块的缓存计算值

## 函数签名
```
getComputed: (module:string)=>object
```

## 如果使用
```
import { getComputed } from 'concent';
// import cc from 'concent'; cc.getComputed

getComputed('foo');
```

## 何时使用
在cc类、reducer方法外部时想要拿到某个模块的计算值
> 在cc类实例里的可以通过`this.$$refComputed`、`this.$$moduleComputed`、`this.$$connectedComputed`、`this.$$globalComputed`拿到实例计算值，模块计算值，全局计算值

## console里使用
打开浏览器console窗口，输入cc.getComputed即可以console里使用该接口