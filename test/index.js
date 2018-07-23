import './index.css'
import { add } from './add'
import { square } from './square'

console.log(square(add(1, 2)))
console.log(process.env.TEST_ENV)
// export function jsx (h) {
//   return <div>{22}</div>
// }
