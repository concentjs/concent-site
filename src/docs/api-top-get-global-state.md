---
id: api-top-get-global-state
title: 获取store里的全局模块的状态
sidebar_label: getGlobalState
---
___
获取store里的全部模块的数据
> 全局模块`$$global`是`concent`的内置模块

## 函数签名
```
getGlobalState: ()=>object
```

## 如果使用
```
import { getGlobalState } from 'concent';
// import cc from 'concent'; cc.getGlobalState

getGlobalState();
```
等同于写为
```
import { getState } from 'concent';
getState('$$global');
```

## console里使用
打开浏览器console窗口，输入cc.getGlobalState即可以console里使用该接口
