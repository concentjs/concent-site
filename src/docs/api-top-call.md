---
id: api-top-call
title: 直接调用cc类的方法
sidebar_label: call
---
___
因为concent自己维护的上下文里持有所有实例的引用，所以允许用户触发实例里的方法

## 函数签名
```
call: (keyDescStr:string, method:string, ...args:any[])=>any
```
- keyDescStr 定位到实例的key字符串描述
> {ccClassKey} | {ccClassKey}/{ccKey}
- method 方法名
- args 不定长参数列表

## 如何使用
假设我们有如下一个类
```
@register('Foo', 'foo')
class Foo extends Component{
  changeInfo(name, age){
    this.setState({name, age});
  }
}
```
在某处被实例化
```
<Foo />
```
则可以通过call来触发`changeInfo`
```
import { call } from 'concent';

call('Foo', 'changeInfo', 'newName', 'newAge');
```
如果我们实例化了多个
```
<div>
  <Foo />
  <Foo />
  <Foo />
</div>
```
则call调用会随机挑选一个来触发器`changeInfo`方法，想要精确的触发某一个指定实例的`changeInfo`方法则需要在实例化时为其指定`ccKey`
```
<div>
  <Foo />
  <Foo ccKey="foo2" />
  <Foo />
</div>
```
此时就可以通过设定`keyDescStr`为`{ccClassKey}/{ccKey}`的模式，来触发目标实例的`changeInfo`方法了
```
call('Foo/foo2', 'changeInfo', 'newName', 'newAge');
```

>注意，没有指定ccKey的实例，concent都会为其随机生成一个唯一key，可以在console里输入`ccc.refs`回车查看到

## 何时使用
当你需要在console里快速验证和检测一些实例方法的效果或者影响结果时
> 不推荐业务逻辑代码里使用此函数来组织代码，此函数严重依赖于实例存不存在，我们应该回归react数据驱动视图的中心思想来书写我们的应用。

## console里使用
打开浏览器console窗口，输入`cc.call`即可以console里使用该接口