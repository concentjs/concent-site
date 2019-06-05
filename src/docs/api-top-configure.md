---
id: api-top-configure
title: 配置
sidebar_label: configure
---

___
`configure`函数用于向`concent`配置一个模块，包括其`state`、`reducer`、`watch`、`computed`和`init`定义。
> 注意，该函数必需在`concent`启动之后才能调用，所以除了`run`函数可以配置模块，`configure`也可以完成此项工作，唯一不同的是：`run`负责启动`concent`并一次性配置多个模块，`configure`一次只能配置一个模块，具体使用场景参考下面的何时使用

## 函数签名定义
```
configure(
  module:string,
  config:{
    state:object,
    reducer:Reducer,
    watch:Watch,
    computed:Computed,
    init:Init
  }
)
```
> reducer、watch、computed、init类型定义参见`run`的解释

## 如何使用
```
import {configure} from 'concent';
import fooModule from './model';

configure('foo', fooModule);
```

## 何时使用
* 当你的模块和组件有着密不可分的关系的时候
* 当你的组件期望独立打包发到`npm`的时候，期望模块定义和组件一起打包发布<br/>
> 此时，别人引用你的组件的同时就完成了模块的配置
```
|_cc-components
  |_PlatformTable
  | |_index.js
  | |_TableHeader.js
  | |_TableFooter.js
  | |_TableSearch.js
  | |_model
  | | |_index.js
  | | |_state.js
  | | |_reducer.js
  | | |_...
  |
  |_...
```
```
//code in PlatformTable/index.js
import {register} from 'concent';
import './model';

@register('PlatFormTable', {module:'platformTable', sharedStateKeys:'*'})
export default class extends Components{

}
```