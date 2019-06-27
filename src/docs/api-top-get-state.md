---
id: api-top-get-state
title: 从store里获取指定模块的状态
sidebar_label: getState
---
___
获取store里的数据

## 函数签名
```
getState: ( module?:string)=>object
```

## 参数解释
* `module` 模块<br/>
不指定模块时，返回的是整个`store`，指定了模块值，返回的是该模块下的状态

## 如果使用
```
import { getState } from 'concent';
// import cc from 'concent'; cc.getState

getState();
getState('foo');
```

## console里使用
打开浏览器console窗口，输入cc.getState即可以console里使用该接口
> `concent`启动完毕后，会将整个`store`挂载在`window.sss`下，所以你也可以在console里输入`sss`然后回车，可以查看整个`store`