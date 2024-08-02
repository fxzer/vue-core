import type { ReactiveEffect } from './effect'

export type Dep = Map<ReactiveEffect, number> & {
  name: string
  cleanup: () => void
}

export function createDep(cleanup: () => void, key) {
  const dep = new Map() as Dep
  dep.cleanup = cleanup
  dep.name = key
  return dep
}
