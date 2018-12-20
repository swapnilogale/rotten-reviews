import pkg from './package.json'

export default [
  {
    input: 'src/index.js',
    external: ['cheerio', 'isomorphic-fetch', 'strict-uri-encode'],
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
    ],
  },
]
