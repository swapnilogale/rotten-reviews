import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

export default [
  {
    input: 'src/index.ts',
    external: ['cheerio', 'isomorphic-fetch', 'strict-uri-encode'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    plugins: [
      typescript({
        clean: true,
      }),
    ],
  },
]
