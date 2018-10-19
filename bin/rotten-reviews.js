#!/usr/bin/env node

const Commander = require('commander')
const RottenReviews = require('..')

const description = `Scrapes audience movie or tv show reviews from rotten tomatoes

Examples:
  rotten-reviews venom_2018 100
  rotten-reviews doctor_who/s11 10 --tv   (include the season # for tv shows)`

Commander.description(description)
  .option('--tv', 'search as a tv show (defaults to movie)')
  .arguments('<title> <count>')
  .action((title, count) => {
    RottenReviews.getAudienceReviews(title, count, Commander.tv)
      .then(reviews => {
        console.log(JSON.stringify(reviews, null, 2))
      })
      .catch(error => {
        console.error(error.message)
      })
  })
  .parse(process.argv)

if (!(Commander.args.length > 0)) Commander.help()
