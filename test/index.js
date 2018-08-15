import { add } from './add'
import { square } from './square'
import vue from './test.vue'
console.log(vue)
console.log(square(add(1, 2)))
console.log(process.env.TEST_ENV)
export function jsx (h) {
  const { alert, ...rest } = this
  console.log(rest)
  return <div onClick={alert}>{22}</div>
}
