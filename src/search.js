const createSearchUrl = query => {
  const { BASE_URL } = require('./defaults')
  const encode = require('strict-uri-encode')

  return `${BASE_URL}/api/private/v2.0/search?q=${encode(query)}`
}

const searchByQuery = async query => {
  const fetch = require('isomorphic-fetch')
  const res = await fetch(createSearchUrl(query))

  /** @type {{movies: Object[], tvSeries: Object[]}} */
  const { movies, tvSeries } = await res.json()

  /**
   * @param {{year: Number}} a
   * @param {{year: Number}} b
   */
  const sortByYear = (a, b) => {
    if (a.year > b.year) {
      return -1
    }
    if (a.year < b.year) {
      return 1
    }
    return 0
  }

  /** @type {{title: String, year: Number, type: String, slug: String}[]} */
  const movieResults = movies.map(({ name, year, url }) => ({
    title: name,
    year,
    type: url.split('/')[1],
    slug: url.substring(1),
  }))

  /** @type {{title: String, year: Number, type: String, slug: String}[]} */
  const tvResults = tvSeries.map(({ title, startYear, url }) => ({
    title,
    year: startYear,
    type: url.split('/')[1],
    slug: url.substring(1),
  }))

  return movieResults.concat(tvResults).sort(sortByYear)
}

module.exports = {
  createSearchUrl,
  searchByQuery,
}
