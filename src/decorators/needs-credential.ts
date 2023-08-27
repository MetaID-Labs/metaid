import errors from '@/data/errors.ts'

export default function needsCredential(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    if (!this.credential) {
      throw new Error(errors.NOT_LOGINED)
    }

    return originalMethod.apply(this, args)
  }

  return descriptor
}
