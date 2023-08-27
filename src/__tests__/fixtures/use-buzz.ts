// import { test } from 'vitest'

// import useDomain from '@/factories/use.ts'
// import Domain from '@/domain.ts'

// let Buzz: Domain

// interface MyFixtures {
//   Buzz: Domain
// }

// const useBuzzTest: typeof test & MyFixtures = test.extend<MyFixtures>({
//   Buzz: async ({ task }, use) => {
//     // setup the fixture before each test function
//     Buzz = await useDomain('buzz')

//     // use the fixture value
//     await use(Buzz)

//     // cleanup the fixture after each test function
//     Buzz = undefined
//   },
// })

// export default useBuzzTest
