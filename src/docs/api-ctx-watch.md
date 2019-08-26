---
id: api-ctx-watch
title: 为实例定义观察属性
sidebar_label: ctx.watch
---
___
实例上下文对象提供的`watch`函数允许用户按需要自定义计算属性，当相关依赖`stateKey`发生变化时，才会重触发观察回调。
>该函数属于实例级别的观察函数，即定义完毕后每一个实例都可能触发自己的观察函数，如果观察的key是模块级的key且观察回调逻辑对于所有实例来说都一样时，建议将watch定义到模块里，以便减少不必要的函数调用。   
>调用的时候一定要在`setup`里调用，在组件初次渲染之前就静态的定义好相关观察属性。

## 函数签名定义
```javascript
type WatchFn = (newVal:any, oldVal:any, fnCtx:FnCtx, refCtx:RefCtx)=> boolean | undefined;
type WatchDescriptor = {
  fn: WatchFn,
  depKeys?: string[] | '*' | null,
  compare?: boolean,
  immediate?: boolean,
}

type WatchDescriptorConfig = {
  [resultKey:string]: WatchDescriptor
};

watch: (
  resultKey: string,
  fn: WatchFn,
  depKeys?: string[] | '*' | null,
  compare?: boolean,
  immediate?: boolean,
)=> void;

watch: (
  resultKey:string,
  watchDescriptor: WatchDescriptor
)=> void;

watch: (
  watchDescriptorConfig: WatchDescriptorConfig
)=> void;

watch: (
  cb: (refCtx:RefCtx) => WatchDescriptorConfig
)=> void;
```
从签名定义上看起来和`computed`很像，但是`watch`不要求返回具体点的值，通常用于做一些异步的任务处理。
> watch的检查触发时机和computed一样都是处于`render`之前，但watch处于computed之后

## 参数解释
* ***resultKey***<br/>
观察key,如果和`stateKey`同名时，如果用户不显示的定义`depKeys`的话，默认的`depKeys`就是只包含了此`stateKey`的数组
* ***fn***<br/>
观察回调函数,stateKey依赖列表里任何一个key的值发生变化时，将触发其回调函数
* ***depKeys***<br/>
`dependencyStateKeys`的缩写,依赖的stateKey列表，列表中任意一项key的值发生变化时，触发观察回调函数
>当`resultKey`为`stateKey`时，如果用户不显示的定义`depKeys`的话，默认的`depKeys`就是只包含了此`stateKey`的数组，即只有该`stateKey`变化时，才触发回调
* ***compare***<br/>
触发策略，默认是true，表示只有stateKey的值发生变化时才触发回调函数，如果改为false，只要用户设置了stateKey的值就会触发回调函数。
> 在concent启动时，配置`watchCompare`为false，则所有`watch`调用不显式的设置`compare`时，默认为false。
* ***immediate***<br/>
触发策略，默认是false，观察函数在组件初次渲染前默认是不执行，如果设置immediate为true，则在组件初次渲染前一定会触发回调函数指定，此时的触发原因和`depKeys`没关系
> 在concent启动时，配置`watchImmediate`为true，则所有`watch`调用不显式的设置`immediate`时，默认为true。

## 定义stateKey做观察
假设有如下模块定义
```javascript
run({
  foo:{
    state:{
      selectedCity:'',
      cities:['bj', 'sh'],
      streets:[],
    }
  }
});
```

### 观察key为普通的stateKey
selectedCity发生变化时是从后端获取对应的街道
```javascript
@register('foo')
class Foo extends React.Component{
  $$setup(ctx){
    //此时retKey 'selectedCity'等于stateKey,所以可以不用指定depKeys
    //等同于写为 ctx.watch('selectedCity', ()=>{...}, ['selectedCity'])

    ctx.watch('selectedCity', (newVal)=>{

      // 如果定义了相关reducer，也可以走dispatch
      // or ctx.dispatch('fetchStreets', newVal);

      api.fetchStreets(`/street/${newVal}`, (streets)=>{
        //设置streets，触发新的渲染
        ctx.setState({streets});
      });
    });
    
  }
  render(){
    // 将触发两次render，一次是'selectedCity'改变触发render，
    // 一次是'selectedCity'的watch回调里触发的render

    return (
      <div>
        {/** 这里使用了sync语法糖，onChange修改的值直通同步给'selectedCity'触发组件渲染 */}
        <select onChange={this.ctx.sync('selectedCity')}>
          {/** options 略 */}
        </select>
      </div>
    );
  }
}
```

- 采用`WatchDescriptor`方式定义
```javascript
@register('foo')
class Foo extends React.Component{
  $$setup(ctx){
    ctx.watch('selectedCity', {
      fn: (newVal)=>{
        // ... code here
      },
      immediate: true,
      compare: true,
    });
    
  }
}
```

### 观察key为带模块前缀的stateKey
一个连接了其他模块的实例，要依赖其对应模块的`stateKey`触发观察回调时，可以在`retKey`前加模块名前缀并用斜杠分隔
```javascript
@register({module:'foo', connect:['bar']})
class Foo extends React.Component{
  $$setup(ctx){
    //当bar模块的selectedCity发生变化时，触发回调
    ctx.watch('bar/selectedCity', (newVal)=>{
      // your code here
    });

    //等同于写为
    ctx.watch('bar/selectedCity', (newVal)=>{}, ['selectedCity']);
  }
}
```

## 定义非stateKey做观察
### 观察key为普通的非stateKey
当用户定义的`retKey`不是`stateKey`时，需要用户显式的指定`depKeys`，以便让`concent`知道在`depKeys`列表里任意一个key发生变化时，触发调用其`retKey`对应的回调函数
```javascript
@register('foo')
class Foo extends React.Component{
  $$setup(ctx){
    //此时retKey 'onCityOrStreetChanged'是一个自定义的观察key，
    //其回调触发是当depKeys里['selectedCity', 'selectedStreet']任意一个key的值发生变化的时候
    ctx.watch('cityOrStreetChanged', (newState, oldState, fnCtx)=>{
      // your code here
      console.log(fnCtx.changed);//打印发生变化的key有哪些
    }, ['selectedCity', 'selectedStreet']);
    
  }
}
```
### 观察key为带模块前缀的非stateKey
当需要观察其他模块的stateKey触发其定义的回调时
```javascript
@register({module:'foo', connect:['bar']})
class Foo extends React.Component{
  $$setup(ctx){
    //确保bar模块下有stateKey 'selectedCity', 'selectedStreet'，否则会报错
    ctx.watch('bar/cityOrStreetChanged', (newState, oldState, fnCtx)=>{
      // your code here
    }, ['selectedCity', 'selectedStreet']);
    
  }
}
```
