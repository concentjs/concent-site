---
id: api-top-set-global-state
title: 更新全局模块的状态
sidebar_label: setGlobalState
---
___
更新concent内置模块`$$global`的状态

## 函数签名
```
setGlobalState: (state:object)=>void
```

## 如果使用
```
import { setGlobalState } from 'concent';
// import cc from 'concent'; cc.setGlobalState

setGlobalState({themeColor:'red'});
```

## 何时使用
在cc类外部、reducer方法外部时想要设置全局模块的状态
> 等同于调用`setState('$$global', {themeColor:'red'})`

## console里使用
打开浏览器console窗口，输入`cc.setGlobalState`即可以console里使用该接口