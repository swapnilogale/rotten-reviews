#!/usr/bin/env node

const columnify = require('columnify')

const Commander = require('commander')
const RottenReviews = require('..')

const description = `Scrapes audience movie or tv show reviews from rotten tomatoes

Examples:
  rotten-reviews venom_2018 100
  rotten-reviews doctor_who/s11 10 --tv   (include the season # for tv shows)`

Commander.description(description)
  .option('--json', 'exports to json')
  .option('--tv', 'search as a tv show (defaults to movie)')
  .arguments('<title> <count>')
  .action((title, count) => {
    RottenReviews.getAudienceReviews(title, count, Commander.tv)
      .then(reviews => {
        if (Commander.csv) {
          return console.log(Csv.parse(reviews));
        }
        if (Commander.json) {
          return console.log(JSON.stringify(reviews, null, 2));
        }
        reviews = reviews.map(review => {
          return {
            name: `${review.reviewer}\n${review.stars} stars.\n${review.date}`,
            review: `\n${review.review}\n\n\n\r-`
          };
        });
        const columns = columnify(reviews, {
          showHeaders: false,
          preserveNewLines: true,
          minWidth: 20,
          config: {
            review: {
              maxWidth: 80
            }
          }
        });
        console.log(columns);
      })
      .catch(error => {
        console.error(error.message)
        process.exit(1);
      })
  })
  .parse(process.argv)

if (!(Commander.args.length > 0)) Commander.help()
