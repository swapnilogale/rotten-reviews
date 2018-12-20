import { searchByQuery } from '../dist/index.esm'

searchByQuery('venom').then(results => {
  console.log(JSON.stringify(results, null, 2))
})
