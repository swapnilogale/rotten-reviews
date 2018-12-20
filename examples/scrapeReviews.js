const { scrapeReviews } = require('..')
const slug = 'm/venom_2018'

scrapeReviews(slug).then(results => {
  console.log(JSON.stringify(results, null, 2))
})
