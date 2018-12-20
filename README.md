<div align='center'>

# rotten-reviews

Scrape audience reviews from [Rotten Tomatoes][rotten-tomatoes] 🍅

[![NPM version](https://img.shields.io/npm/v/rotten-reviews.svg)](https://www.npmjs.com/package/rotten-reviews)
[![NPM download count](https://img.shields.io/npm/dt/rotten-reviews.svg)](https://www.npmjs.com/package/rotten-reviews)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)][spectrum]

[![Rotten GIF](https://media.giphy.com/media/101t9QwTM6y5oc/giphy.gif)][spectrum]

</div>

## Description

This Node.js package fetches [Rotten Tomatoes][rotten-tomatoes] audience reviews (movies and TV shows) by scraping pages using [`cheerio`][cheerio] and [`isomorphic-fetch`][isomorphic-fetch]. Notable features such as:

- Search movie or TV show titles
- Fetch whole audience reviews or by defined value

Note that this package doesn't use official packages or API endpoints provided by RT.

## Usage

### Search titles using `searchByQuery`

- Script

  ```js
  // using require (commonjs)
  const { searchByQuery } = require('rotten-reviews')

  // using import (es module)
  import { searchByQuery } from 'rotten-reviews'

  searchByQuery('venom').then(results => {
    console.log(JSON.stringify(results, null, 2))
  })
  ```

- Output (truncated, fetched on December 20, 2018)

  ```json
  [
    {
      "title": "Venom",
      "year": 2018,
      "type": "m",
      "slug": "m/venom_2018"
    },
    {
      "title": "Venom",
      "year": 2016,
      "type": "m",
      "slug": "m/venom"
    },
    ...
  ]
  ```

### Fetch reviews using `scrapeReviews`

- Script

  ```js
  // using require (commonjs)
  const { scrapeReviews } = require('rotten-reviews')

  // using import (es module)
  import { scrapeReviews } from 'rotten-reviews'

  scrapeReviews('m/venom_2018').then(results => {
    console.log(JSON.stringify(results, null, 2))
  })
  ```

- Output (truncated, fetched on December 20, 2018)

  ```json
  [
    {
      "reviewer": "Cory L",
      "date": "December 19, 2018",
      "stars": 4,
      "review": "After watching the movie I gotta say it was good. It doesn't need spider Man though I would love to see that interaction. I am looking forward to seeing a sequel."
    },
    {
      "reviewer": "Shawn R",
      "date": "December 19, 2018",
      "stars": 4,
      "review": "Critics be damned, I liked it. Lots of action, and it doesn't take itself too seriously. Venom was given a bit of personality rather than being a glorified sticky suit."
    },
    ...
  ]
  ```

### CLI usage

Starting from version 2, `rotten-reviews` does not include any runnables. Instead, we made [`rotten-reviews-cli`][rotten-reviews-cli] which is a CLI wrapper for `rotten-reviews`.

## API

Haven't done this part. Do [submit a pull request](https://github.com/ninetwenty-one/rotten-reviews/compare) if you want to contribute.

## Credits

- [`cheeriojs/cheerio`][cheerio]
- [`kevva/strict-uri-encode`][strict-uri-encode]
- [`matthew-andrews/isomorphic-fetch`][isomorphic-fetch]
- [`prettier/prettier`][prettier]
- [`rollup/rollup`][rollup]

## License

MIT

[cheerio]: https://github.com/cheeriojs/cheerio
[isomorphic-fetch]: https://github.com/matthew-andrews/isomorphic-fetch
[prettier]: https://github.com/prettier/prettier
[rollup]: https://github.com/rollup/rollup
[rotten-reviews-cli]: https://github.com/ninetwenty-one/rotten-reviews-cli
[rotten-tomatoes]: https://www.rottentomatoes.com
[spectrum]: https://spectrum.chat/ninetwenty-one/rotten-reviews
[strict-uri-encode]: https://github.com/kevva/strict-uri-encode
