---
id: doc-core-component
title: 组件
sidebar_label: 组件
---
___
普通的`react类组件`通过`register`或者`connect`函数包裹后便成为了`cc类组件`，`concent`允许用户按需实现以下类方法
```
@register('Demo', {module:'foo'})
class Demo extends Component{

  $$beforeSetState(){

  }

  $$beforeBroadcastState(){

  }

  $$watch(){

  }

  $$computed(){

  }

  $$cache(){

  }

  $$onUrlChanged(){
  
  }
}

```
