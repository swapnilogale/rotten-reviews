import * as cheerio from 'cheerio'
import fetch from 'isomorphic-fetch'
import encode from 'strict-uri-encode'

export interface SearchResult {
  title: string
  year: number
  type: string
  slug: string
}

interface SearchMovieResult {
  name: string
  year: number
  url: string
}

interface SearchTvResult {
  title: string
  startYear: number
  url: string
}

export interface ScrapeResult {
  reviewer: String
  date: String
  stars: Number
  review: String
}

const BASE_URL: string = 'https://www.rottentomatoes.com'
const MAX_REVIEWS_PER_PAGE: number = 20
const MAX_VISITABLE_PAGE: number = 51
const MAX_TOTAL_REVIEWS: number = MAX_VISITABLE_PAGE * MAX_REVIEWS_PER_PAGE

/**
 * @param {string} query
 * @returns {string}
 */
const createSearchUrl = (query: string): string =>
  `${BASE_URL}/api/private/v2.0/search?q=${encode(query)}`

/**
 * @typedef {{title: string, year: number, type: string, slug: string}} SearchResult
 * @typedef {{name: string, year: number, url: string}} SearchMovieResult
 * @typedef {{title: string, startYear: number, url: string}} SearchTvResult
 * @param {string} query
 * @returns {Promise<SearchResult[]>}
 */
export const searchByQuery = async (query: string): Promise<SearchResult[]> => {
  const res = await fetch(createSearchUrl(query))

  const {
    movies,
    tvSeries,
  }: {
    movies: SearchMovieResult[]
    tvSeries: SearchTvResult[]
  } = await res.json()

  /**
   * @param {SearchResult} a
   * @param {SearchResult} b
   * @returns {number}
   */
  const sortByYear = (a: SearchResult, b: SearchResult): number => {
    if (a.year > b.year) {
      return -1
    }
    if (a.year < b.year) {
      return 1
    }
    return 0
  }

  const movieResults: SearchResult[] = movies.map(
    ({ name, year, url }): SearchResult => ({
      title: name,
      year,
      type: url.split('/')[1],
      slug: url.substring(1),
    })
  )

  const tvResults: SearchResult[] = tvSeries.map(
    ({ title, startYear, url }): SearchResult => ({
      title,
      year: startYear,
      type: url.split('/')[1],
      slug: url.substring(1),
    })
  )

  return movieResults.concat(tvResults).sort(sortByYear)
}

/**
 * @param {string} slug
 * @param {number} [pageNumber=1]
 * @returns {string}
 */
export const createUrlFromSlug = (
  slug: string,
  pageNumber: number = 1
): string => {
  const page = Math.min(Math.max(1, pageNumber), MAX_VISITABLE_PAGE)

  return `${BASE_URL}/${slug}/reviews/?page=${page}&type=user&sort=`
}

/**
 * @typedef {{reviewer: String, date: String, stars: Number, review: String}} ScrapeResult
 * @param {string} url
 * @returns {Promise<ScrapeResult[]>}
 */
export const scrapeFromPageUrl = async (
  url: string
): Promise<ScrapeResult[]> => {
  const reviews: ScrapeResult[] = []

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

/**
 * @param {string} slug
 * @param {number} [reviewCount=MAX_REVIEWS_PER_PAGE]
 * @returns {Promise<ScrapeResult[]>}
 */
export const scrapeReviews = async (
  slug: string,
  reviewCount: number = MAX_REVIEWS_PER_PAGE
): Promise<ScrapeResult[]> => {
  const desiredReviewCount = Math.max(
    MAX_REVIEWS_PER_PAGE,
    Math.min(reviewCount, MAX_TOTAL_REVIEWS)
  )
  const pageCount = Math.ceil(desiredReviewCount / MAX_REVIEWS_PER_PAGE)

  const pagesReviews: ScrapeResult[][] = await Promise.all(
    Array.from(Array(pageCount), (x, i) => {
      const url = createUrlFromSlug(slug, i)
      return scrapeFromPageUrl(url)
    })
  )

  return pagesReviews.reduce((a, b) => a.concat(b)).slice(0, reviewCount)
}
