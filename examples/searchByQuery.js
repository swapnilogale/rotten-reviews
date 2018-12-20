const { searchByQuery } = require('..')

searchByQuery('venom').then(results => {
  console.log(JSON.stringify(results, null, 2))
})
