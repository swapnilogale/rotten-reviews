const {
  MAX_REVIEWS_PER_PAGE,
  MAX_TOTAL_REVIEWS,
  MAX_VISITABLE_PAGE,
} = require('./defaults')

const createUrlFromSlug = (slug, pageNumber = 1) => {
  const baseUrl = 'https://www.rottentomatoes.com'
  const page = Math.min(Math.max(1, pageNumber), MAX_VISITABLE_PAGE)

  return `${baseUrl}/${slug}/reviews/?page=${page}&type=user&sort=`
}

const scrapeFromPageUrl = async url => {
  /** @type {{reviewer: String, date: String, stars: Number, review: String}[]} */
  const reviews = []

  const res = await require('isomorphic-fetch')(url)
  const $ = require('cheerio').load(await res.text())

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

module.exports = {
  createUrlFromSlug,
  scrapeFromPageUrl,
  scrapeReviews,
}
