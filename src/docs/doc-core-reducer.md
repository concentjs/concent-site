---
id: doc-core-reducer
title: reducer
sidebar_label: reducer
---
___
## reducer是什么
我们先复习一下`concent`的状态广播流程

![触发流程](/concent-site/img/cc-core.png)

从上可以看出，reducer的定位就是用于返回一个新的片段状态，通常我们写reducer的目的就是要把处理数据的业务逻辑和更新视图的渲染逻辑彻底分来开来，达到ui与业务的彻底解耦。<br/>
<p>
当我们的工程越来越大的时候，这样关注点分离的组织代码方式有利于后期的维护、迭代甚至重构和升级。<br/>
业务逻辑会越来越厚但是越来越下沉和稳定，ui逻辑会越变越频繁，
</p>

当我们的工程越来越大的时候，这样关注点分离的组织代码方式有利于后期的维护、迭代甚至重构和升级。<br/>
业务逻辑会越来越厚但是越来越下沉和稳定，ui逻辑会越变越频繁，
reducer函数用于书写用户的业务逻辑并返回一个新的片段状态，由`dispatch`句柄调用并触发，`concent`会把reducer函数返回的片段状态视为一个新提交的状态去处理，从用户触发reducer函数到视图被更新会经历以下流程<br />
1 用户调用`dispatch`函数去触发`concent`调用`reducer`函数<br />
2 `concent`找到对应的`reducer`函数并触发其执行，并收到`reducer`函数提交的新的片段状态<br />
3 `concent`分析`reducer`提交的新的片段状态，存储到`store`<br />
4 找到关心这份片段状态的其他`cc实例`，并将其分发到这些实例上触发它们的渲染<br />


从上面的流程图里，我们可以针对`dispatch`函数总结为如下流程
```
dispatch 
    |
    |---trigger---> reducer
                        |
                        |---commit new partialState ---> cc core
                                                            |
                                                            |---save to store---> finder
                                                                                      |
                                                                                      |
                                                    ins1,ins2... <--- broadcast to ---|


```


定义上来说，`concent`里的`reducer`函数和`redux`里的`reducer`函数的区别很大，使用体验也会比`redux`要好很多

## 相同点
我们先列出以下几个主要的相同点
* 都需要`dispatch`来触发
* 都会返回一个新的状态来触发渲染

## 差异点
差异点如下：
* `redux`的reducer函数是纯函数，`concent`的reducer函数是纯函数可以是任意的函数
```
// code in foo/reducer.js

export function updateF1(){
}

export async function uploadF1(){
}

export function* trackF1(){  
}

```
- `redux`的需要借助`saga`等辅助模块来写副作用，`concent`的reducer函数更符合编程体验，对比`redux`的`reducer`或者其他`redux wrapper`（dva, rematch...）的`reducer`，`concent`提供以下巨大的差异性体验
> 1 书写一个function 就是纯函数<br/>
> 2 书写一个async function 或者 generator 就是副作用函数<br/>
> 3 任何类型的函数返回状态就会触发视图更新<br/>
> 4 函数之间可以相互组合调用，并且直接基于函数签名调用（注意避免死循环）<br/>
> 5 链式调用的reducer可以合并为一次状态更新操作提交给`concent`<br/>
```
// 推荐把reducer独立的放置在一个文件中，这样reducer函数件可以直接基于函数签名调用
export function updateF1(f1){
  return {f1}
}

export async function handleF1Change(payload, moduleState, ctx){
  await api.uploadF1();

  return {f1:payload};
  // or ctx.dispatch(updateF1, payload);
}

export async function f2(payload, moduleState, ctx){
  //code here
  await ctx.dispatch(handleF1Change, payload);

  // or await ctx.dispatch('handleF1Change', payload)
  //code here

  return {f2:'to be committed'}
}

export async function f3(payload, moduleState, ctx){
  await api.domeSomething();
  await ctx.dispatch(f2);
  return {f3:'f3 to be committed'};
}

```
> 关于链式调用的性能优化
```
class Foo extends Component{
  changeF1 = ()=>{
    this.$$dispatch('f3');
    // 调用f3 --> 调用f2 --> 调用handleF1Change
    //handleF1Change 返回 {f1:payload} 触发更新
    //f2 返回 {f2:'to be committed'} 触发更新
    //f3 返回 {f3:'f3 to be committed'} 触发更新

    this.$$lazyDispatch('f3');
    //lazyDispatch会将调用链上属于同一个模块的所有状态暂存起来
    //直到根函数调用结束(这里即是f3)
    //一次性合并为  {f1:payload, f2:'to be committed', f3:'f3 to be committed'}
    //再提交给concent，触发一次更新!
  }
}
```
> 大多数时候，基于dispatch调用触发实时更新是没有问题的，但是提供的`lazyDispatch`特性，能够让用户既能够保持`reducer`拥有最小的业务逻辑单元和更新粒度，又能够对性能有极度追求时避免不必要的多次更新