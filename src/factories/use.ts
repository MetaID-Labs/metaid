import Domain from '../domain.ts'

export default async function use(
  domainSymbol: string,
  options?: { credential?: { metaid?: string; address?: string } },
) {
  const domainSchema = await import(`../schemas/${domainSymbol}.json`).then((module) => module.default)

  const domain = new Domain(domainSchema.name)

  if (options?.credential) {
    domain.login(options.credential)
  }

  return domain
}
