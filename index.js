const Axios = require('axios').default
const Cheerio = require('cheerio')

/**
 * Returns the movie URL for the given parameters
 *
 * @param {String} slug Identifier for the movie ot TV show
 * @param {Number} page Number or page(s) to be retrieved
 * @param {Boolean} isTV State whether given slug is a TV show or not
 */
const movieUrl = (slug, page, isTV = false) => {
  const showType = isTV ? 'tv' : 'm'
  return `https://www.rottentomatoes.com/${showType}/${slug}/reviews/?page=${page}&type=user`
}

/**
 * Returns the search URL for the given parameters
 *
 * @param {String} query Search query
 */
const searchUrl = query =>
  `https://www.rottentomatoes.com/api/private/v2.0/search?q=${query}`

/**
 * Fetches the review page for the given parameters
 *
 * @param {String} slug Identifier for the movie ot TV show
 * @param {Number} page Number or page(s) to be retrieved
 * @param {Boolean} isTV State whether given slug is a TV show or not
 */
const getPage = (slug, page, isTV) => Axios.get(movieUrl(slug, page, isTV))

/**
 * Fetches the search results for the given parameters
 *
 * @param {String} query Search query
 */
const getSearchResults = query => Axios.get(searchUrl(query))

/**
 * Scrapes audience reviews (reviewer name, date, stars, and review excerpt)
 *
 * @param {String} data HTML data fetched from getPage method
 */
const scrapePage = data => {
  const $ = Cheerio.load(data)
  const reviews = []

  $('.review_table_row').each((i, element) => {
    const stars = $(element).find('.glyphicon.glyphicon-star').length
    const hasHalf = $(element).find('span:contains("½")').length ? 0.5 : 0

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
      reviewer: reviewer,
      date: date,
      stars: stars + hasHalf,
      review: review,
    })
  })

  return reviews
}

/**
 * Fetches audience reviews for the given parameters
 *
 * @param {String} slug Identifier for the movie or TV show
 * @param {Number} reviewCount Number of requested reviews to be given
 * @param {Boolean} isTV State whether given slug is a TV show or not
 */
const getAudienceReviews = async (slug, reviewCount, isTV = false) => {
  let wantedAmountOfReviews = reviewCount
  let maxPage = 1
  let countLastPageReviews = 0

  /**
   * Retrieves the first page to check the total number of pages
   */
  await getPage(slug, maxPage, isTV).then(response => {
    const $ = Cheerio.load(response.data)
    const paginatorText = $('.pageInfo').html()
    maxPage = paginatorText.slice(
      paginatorText.indexOf('of') + 3,
      paginatorText.length
    )
  })

  /**
   * Retrieves the number of reviews on the last page
   */
  await getPage(slug, maxPage, isTV).then(response => {
    const $ = Cheerio.load(response.data)
    countLastPageReviews = $('.review_table_row').length
  })

  const REVIEWS_PER_PAGE = 20
  const countReviews = (maxPage - 1) * REVIEWS_PER_PAGE + countLastPageReviews

  /**
   * Sets the number of reviews to the total of reviews available
   */
  if (wantedAmountOfReviews > countReviews) {
    wantedAmountOfReviews = countReviews
  }

  return new Promise(resolve => {
    const pageRequests = []

    for (let i = 1; i <= maxPage; i++) {
      pageRequests.push(getPage(slug, i, isTV))
    }

    resolve(pageRequests)
  })
    .then(pageRequests => Axios.all(pageRequests))
    .catch(error => {
      if (error.response.status == 404)
        throw {
          status: 404,
          message:
            `⚠️  Page not found for '${slug}'. You can check the page manually by opening this link:\n` +
            movieUrl(slug, page, isTV),
        }
      throw {
        message: `⚠️  An error occured, please try again.`,
      }
    })
    .then(
      Axios.spread((...requests) => {
        const reviews = []
        requests.forEach(request => {
          reviews.push.apply(reviews, scrapePage(request.data))
        })
        return reviews.slice(0, wantedAmountOfReviews)
      })
    )
}

/**
 * Fetches movie search results for the given parameters
 *
 * @param {String} query Used to return a list of movies of the query
 */
const getMovieResults = async (query) => {
  try {
    const request = await getSearchResults(query)
    const response = request.data;

    if (response.movieCount === 0) {
      throw {
        message: `⚠️  No movies found, please try again.`,
      }
    }

    return new Promise(resolve => {
      const sortedMovies = response.movies.sort((a, b) => a.year - b.year).reverse()

      resolve(sortedMovies)
    })
  } catch (err) {
    throw {
      message: `⚠️  An error occured, please try again.`,
    }
  }
}

module.exports = { getAudienceReviews, getMovieResults }
