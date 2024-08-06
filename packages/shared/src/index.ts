export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]'
}

export function isFunction(value) {
  return Object.prototype.toString.call(value) === '[object Function]'
}

export function isSet(val) {
  return val instanceof Set
}
export function isMap(val) {
  return val instanceof Map
}
export function isPlainObject(val) {
  return val !== null && typeof val === 'object' && Object.getPrototypeOf(val) === Object.prototype
}
