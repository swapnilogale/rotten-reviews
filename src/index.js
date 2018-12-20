import cheerio from 'cheerio'
import fetch from 'isomorphic-fetch'
import encode from 'strict-uri-encode'

const BASE_URL = 'https://www.rottentomatoes.com'
const MAX_REVIEWS_PER_PAGE = 20
const MAX_VISITABLE_PAGE = 51
const MAX_TOTAL_REVIEWS = MAX_VISITABLE_PAGE * MAX_REVIEWS_PER_PAGE

const createSearchUrl = query =>
  `${BASE_URL}/api/private/v2.0/search?q=${encode(query)}`

const searchByQuery = async query => {
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

const createUrlFromSlug = (slug, pageNumber = 1) => {
  const page = Math.min(Math.max(1, pageNumber), MAX_VISITABLE_PAGE)

  return `${BASE_URL}/${slug}/reviews/?page=${page}&type=user&sort=`
}

const scrapeFromPageUrl = async url => {
  /** @type {{reviewer: String, date: String, stars: Number, review: String}[]} */
  const reviews = []

  const res = await fetch(url)
  const $ = cheerio.load(await res.text())

  $('.review_table_row').each((i, element) => {
    const stars = $(element).find('.glyphicon.glyphicon-star').length
    const hasHalfStar = $(element).find('span:contains("½")').length ? 0.5 : 0

    const [reviewer, date, review] = [
      '.bold.unstyled.articleLink',
      '.fr.small.subtle',
      '.user_review',
    ].map(classes =>
      $(element)
        .find(classes)
        .text()
        .trim()
    )

    reviews.push({
      reviewer,
      date,
      stars: stars + hasHalfStar,
      review,
    })
  })

  return reviews
}

const scrapeReviews = async (slug, reviewCount = MAX_REVIEWS_PER_PAGE) => {
  const desiredReviewCount = Math.max(
    MAX_REVIEWS_PER_PAGE,
    Math.min(reviewCount, MAX_TOTAL_REVIEWS)
  )
  const pageCount = Math.ceil(desiredReviewCount / MAX_REVIEWS_PER_PAGE)

  const pagesReviews = await Promise.all(
    Array.from(Array(pageCount), (x, i) => {
      const url = createUrlFromSlug(slug, i)
      return scrapeFromPageUrl(url)
    })
  )

  return pagesReviews.reduce((a, b) => a.concat(b)).slice(0, reviewCount)
}

export { searchByQuery, createUrlFromSlug, scrapeFromPageUrl, scrapeReviews }
