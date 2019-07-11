---
id: doc-core-component
title: 组件
sidebar_label: 组件
---
___
## 类组件
普通的`react类组件`通过`register`或者`connect`函数包裹后便成为了`cc类组件`，`concent`允许用户按需实现以下类方法
```javascript
@register('Demo', {module:'foo'})
class Demo extends Component{

  //定义实例级别的watch，区别于模块里的定义，
  //当你需要为实例个性化定制一些watch函数时，可以在此定义，
  //否则推荐使用模块里的watch，以达到代码复用的目的
  $$watch(){

  }

  //同watch，推荐使用模块里的computed，以达到代码复用的目的
  $$computed(){

  }

  //缓存结果，组件初次渲染前，被调用一次，结果收集在this.$$rerCache里
  //适合放置一些实例级别的静态数据
  $$cache(){

  }

  //配合react-router-concent使用的钩子函数
  //对于react-router-dom的Route组件，点击同一个链接时，是不会触发其Component再次挂载的
  //所以当你需要点击同一个链接时也让组件被刷新，
  //可以接入react-router-concent，然后此方法就会被触发
  $$onUrlChanged(){
  
  }

  render(){
    const {
      //props
      state,
      $$moduleState,
      $$globalState,
      $$connectedState,
      $$refComputed,
      $$refConnectedComputed,
      $$moduleComputed,
      $$globalComputed,
      $$refCache,

      //methods
      setState,
      forceUpdate,
      setModuleState,
      setGlobalState,
      $$dispatch,
      $$invoke,
      $$sync,
      $$syncBool,
      $$syncInt,
      $$set,
      $$setBool,
    } = this;
  }
}

```

## 函数组件
### CcFragment
`CcFragment`是concent对class做的精心包装，让用户不需要再感知到class的存在，不需要和this打交道，也能够完美的和`store`互动。    
当你需要临时的在视图里插入一个视图片段，连接上store，消费关心的数据时，`CcFragment`可以让你轻松达成目标。
```javascript
render(){
  return (
    <div>
      <h1>title</h1>
      {/** 此片段属于foo模块，同时也连接bar、bar两个模块 */}
      <CcFragment module="foo" 
        connect={{bar:'*', baz:'*'}} 
        setup={ctx=>{
          const changeFooName = e =>{
            return ctx.dispatch('changeName', e.currentTarget.value);
          }
          return {changeFooName}
        }}
        render={(ctx)=>{
        const {
          //props
          state,
          moduleState,
          globalState,
          connectedState,
          refComputed,
          refConnectedComputed,
          moduleComputed,
          globalComputed,

          //methods
          setState,
          forceUpdate,
          setModuleState,
          setGlobalState,
          dispatch,
          invoke,
          sync,
          syncBool,
          syncInt,
          set,
          setBool,

          //result of setup: {changeFooName}
          settings,
        } = ctx;

        return <h2>your view</h2>
      }}/>
    </div>
  );
}

```

### connectDumb
`connectDumb`是对`CcFragment`的进一步抽象，让已有的纯函数组件更优雅的接入concent所有能力

考虑以下一个很传统的函数组件
```javascript
const OneDumb = ({onItemClick, label, list})=>{
  return (
    <Card onClick={onItemClick}>
      <label>{label}</label>
      {list.map(v=> <ListItem key={v.id} value={v.value} />)}
    </Card>
  );
}
```
我们只需要定义`setup`，用于初始化一些启动配置，然后定义`mapProps`，用于构造符合函数组件props描述的对象传递给函数组件，即可让函数组件像类组件一样工作起来
```javascript
const setup = ctx=>{
  const handleGoodsClick = goodsId=> ctx.dispatch('handleGoodsClick', goodsId);
  return {handleGoodsClick};
}

const mapProps = ctx=>{
  const {label, list} = ctx.state;
  const onItemClick = ctx.settings.handleGoodsClick;
  return {onItemClick, label, list};
}
```
连接函数组件, 然后就可以提供给上传业务使用了
```javascript
const GoodsList = connectDumb({
  module:'goods', setup, mapProps
})(OneDumb);

export default GoodsList;
```

## 更多精彩
更多精彩示例请参考[这里](https://stackblitz.com/@fantasticsoul)。   
详细使用方法参考API文档。
