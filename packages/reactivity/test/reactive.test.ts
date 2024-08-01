import { describe, expect, it } from 'vitest'
import { isReactive, reactive } from '../src'

describe('reactivity/reactive', () => {
  it('reactive 应该被定义且是函数', () => {
    expect(reactive).toBeDefined()
    expect(reactive).toBeTypeOf('function')
  })

  it('应该是一个 reactive 代理对象', () => {
    const obj = reactive({
      name: 'zhangsan',
      age: 18,
    })

    expect(obj).toBeInstanceOf(Object)
    expect(isReactive(obj)).toBeTruthy()
  })

  it('代理过的对象不应该被重复代理', () => {
    const obj1 = reactive({
      name: 'zhangsan',
      age: 18,
    })

    const obj2 = reactive(obj1)
    expect(obj1).toBe(obj2)
  })
})
