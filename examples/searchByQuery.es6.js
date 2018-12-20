import { searchByQuery } from '../src'

searchByQuery('venom').then(results => {
  console.log(JSON.stringify(results, null, 2))
})
