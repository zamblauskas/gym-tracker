/**
 * Deep equality comparison for objects
 * Properly handles Date objects, arrays, and nested objects
 * Replaces inefficient JSON.stringify comparison
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  // Handle primitive types and null/undefined
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false

  // Handle Date objects
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime()
  }
  if (obj1 instanceof Date || obj2 instanceof Date) return false

  // Handle arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    return obj1.every((item, index) => deepEqual(item, obj2[index]))
  }
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false

  // Handle plain objects
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  return keys1.every(key =>
    Object.prototype.hasOwnProperty.call(obj2, key) &&
    deepEqual(obj1[key], obj2[key])
  )
}
