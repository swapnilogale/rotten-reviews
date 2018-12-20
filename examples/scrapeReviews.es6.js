import { scrapeReviews } from '../dist/index.esm'

scrapeReviews('m/venom_2018').then(results => {
  console.log(JSON.stringify(results, null, 2))
})
