export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function isArray(value) {
  return Object.prototype.toString.call(value) === '[object Array]'
}

export function isFunction(value) {
  return Object.prototype.toString.call(value) === '[object Function]'
}
