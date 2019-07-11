---
id: api-top-set-state
title: 更新状态
sidebar_label: setState
---
___
更新指定模块的状态

## 函数签名
```
setState: (module:string, state:object)=>void
```

## 如果使用
```
import { setState } from 'concent';
// import cc from 'concent'; cc.setState

setState('foo', {name:'newValue'});
```

## 何时使用
在cc类、reducer方法外部时想要设置某个模块的状态
> 在cc类实例里的可以通过`this.setState`来修改状态，大多数时候推荐用实例来触发修改状态调用，因为实例调用时，上下文信息里携带者源头调用者信息，同时实例里的`this.setState`允许提交一些非模块的转态，这些状态即是实例的私有状态。  
此外，实例的`this.setState`不需要指定模块名，默认就是修改当前实例的类的所属模块的状态，这一点有别于`api.setState`，如果需要在实例里需要显式的修改某个模块的数据的话，使用`this.setModuleState`

## console里使用
打开浏览器console窗口，输入`cc.setState`即可以console里使用该接口