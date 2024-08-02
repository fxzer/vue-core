import { createDep } from './dep'
import { activeEffect } from './effect'
/*
被代理对象-->键--> 副作用函数Map
targetMap = {
  target:{
    key:depsMap
  }
}

 对应结构：{
  {
   name:'zhangsan',
   age:18,
  }
    :
  {
   name: {
      effect1:0,
      effect2:0
    }
   },
    age: {
      effect1:0,
      effect3:0,
      effect4:0
    }
   }
}
*/
// 收集依赖，构建依赖对象属性与 effect 副作用函数对应关系 ，好让依赖更新时，能找到对应的 effect 函数
const targetMap = new WeakMap()
export function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)

    if (!depsMap) {
      targetMap.set(target, depsMap = new Map())
    }

    let dep = depsMap.get(key)
    if (!dep) {
      // 传入 key 对应的副作用清理函数，优于把 depsMap、key传入再创建清理函数形式
      depsMap.set(key, dep = createDep(() => depsMap.delete(key), key))
    }

    // 将当前的依赖收集到 dep 中，便于更新时触发
    trackEffect(activeEffect, dep)
  }
}
// 触发依赖更新
export function trigger(target, key, newValue, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) { // 找不到对象
    return
  }
  const dep = depsMap.get(key) // 更改的属性不存在副作用函数
  if (dep) {
    triggerEffect(dep)
  }
}

