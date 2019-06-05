---
id: api-top-clone-module
title: 模块克隆
sidebar_label: cloneModule
---

___
你可以用此函数对已配置好的模块克隆出一个新的模块，新的模块和源模块在运行时是完全隔离和独立的

## 函数签名定义
```
cloneModule(
  newModule:string,
  existingModule:string,
  option?:{
    state:object,
    reducer:Reducer,
    computed:Computed,
    watch:Watch,
    init:Init
  }
)
```
> reducer、watch、computed、init类型定义参见`run`的解释
* newModule 新的模块名
* existingModule 已存在的模块名
* option 可以定义自己的个性化配置重新源模块的配置
> 自定义配置会被采取合并策略来合成新的模块配置

## 如何使用
假设已存在一个模块定义如下`foo`
```
const foo = {
  state:{
    f1:1,
    f2:2,
  },
  reducer:{
    updateF1:()=>{},
    uploadF1:()=>{},
  }
}
```
对它克隆，并重写`updateF1`函数，并新增一个`updateF2`函数
```
const bar = cloneModule('foo', foo, {
  reducer:{
    updateF1:()=>{console.log('overwrite f1')},
    updateF2:()=>{}
  }
});

run({ foo, bar});//启动时传入这两个模块
```
最后新的模块的reducer会是
```
{
  state:{
    f1:1,
    f2:2,
  },
  reducer:{
    updateF1:()=>{console.log('overwrite f1')},
    uploadF1:()=>{},
    updateF2:()=>{},
  }
}
```

## 何时使用
当你的新组建想复用你已有的模块的全部定义，但是期望他们的状态是相互隔离的时候，使用`cloneModule`可以不用让你copy一遍已有模块的全部代码，但是只是为了复用所有逻辑
> 除了`state`是真正被克隆了，其他的配置在内存里其实还是同一个引用指向的对象，只不过是可以被不同模块的实例调用而已，不用担心这种克隆会造成性能负担