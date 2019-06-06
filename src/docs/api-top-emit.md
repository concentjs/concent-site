---
id: api-top-emit
title: 发射
sidebar_label: emit
---
___
`emit`支持你发射事件以及欲传递的参数，任何监听了该事件的实例都将被触发执行其监听的回调函数

## 函数签名定义
```
emit: (eventName , args?:any[])
```

## 如何使用
假设已有一个cc类`Foo`在`componentDidMount`里监听了事件`boom`
```
class Foo extends Component{
  componentDidMount(){
    this.$$on('boom', this.handleBoom);
  }
  handleBoom = (param1, param2, param3)=>{
    console.log(param1, param2, param3);
  }
}
```
现在你可以在任意地方发射`boom`事件
```
/**
* 或者写为
* import cc from 'concent'; 
* 然后调用cc.emit
*/
import {emit} from 'concent';

emit('boom', 11, 22, 33)
```
然后所有的`Foo实例`都将触发其`handleBoom`函数调用
```
  handleBoom = (param1, param2, param3)=>{
    // 将打印 11,22,33
    console.log(param1, param2, param3);
  }
```