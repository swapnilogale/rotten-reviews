const { parse } = require('url')
const { searchByQuery, scrapeReviews } = require('rotten-reviews')

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
module.exports = async (req, res) => {
  const { query } = parse(req.url, true)
  const { s = null, c = 10, q = null } = query

  if (s && c) {
    const results = await scrapeReviews(s, c)
    res.end(JSON.stringify(results, null, 2))
    return
  }

  if (q) {
    const results = await searchByQuery(q)
    res.end(JSON.stringify(results, null, 2))
    return
  }

  res.writeHead(301, {
    Location: 'https://github.com/ninetwenty-one/rotten-reviews',
  })
  res.end()
}
