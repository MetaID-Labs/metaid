import Domain from '../domain.ts'

export default async function use(
  domainSymbol: string,
  options?: { credential?: { metaid?: string; address?: string } },
) {
  const domainSchema = await import(`../schemas/${domainSymbol}.schema.ts`).then((module) => module.default)

  const domain = new Domain(domainSchema.name, domainSchema)

  if (options?.credential) {
    domain.login(options.credential)
  }

  return domain
}
