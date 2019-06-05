---
id: api-top-connect
title: 连接
sidebar_label: connect
---
___
`connect`和`register`功能一样，都是将你的react累组注册为cc类，不同点在于，`connect`注册的类不属于任意你定义的业务模块，而属于默认内置的`$$default`模块。

## 函数签名定义
```
connect(
  ccClassKey:string,
  connectSpec?:{
    [module:string]?:'*' | string[],
  }
)
```

## 如何使用
```
import { connect } from 'concent';

@connect('Foo', {foo:'*', bar:'*'})
class Foo extends Component{
  render(){
    // 打印：{for:{...}, bar:{...}}
    console.log(this.$$connectedState);
  }
}
```

## 何时使用
* 当你的类业务上不属于任何模块，只是想同时消费多个模块的数据时
* 当你不希望你的类的state被`concent`注入数据时

## 在线示例
### [示例1](https://stackblitz.com/edit/ccapi-top-connect-1?file=index.js)
