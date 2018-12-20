const { searchByQuery } = require('../dist/index.cjs')

searchByQuery('venom').then(results => {
  console.log(JSON.stringify(results, null, 2))
})
