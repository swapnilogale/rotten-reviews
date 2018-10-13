const nock = require('nock')
const RottenReviews = require('.')

const nockRequest =
  nock('https://www.rottentomatoes.com')
    .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
    .get(`/m/1198124-shutter_island/reviews/?page=1&type=user&sort=`)

const sampleReviewData = {
  reviewer: 'Daniel M',
  date: 'October 12, 2018',
  review: 'Very cool plot twist at the end, enjoyable movie.'
}

describe('[RottenReviews]',  () => {
  describe('Get audiences reviews',  () => {

    it('should exists the method "getAudienceReviews"',  () => {
      expect(typeof RottenReviews.getAudienceReviews).toBe('function')
    })

    it('should return the reviews when I try to get audiences reviews of a existing movie', () => {
      const want = {
        ...sampleReviewData,
        stars: 5
      }
      expect.assertions(1)

      nockRequest.reply(200,
        `<html>
          <div class="review_table_row">
            <a class="bold unstyled articleLink"">${sampleReviewData.reviewer}</a>
            <span class="fr small subtle">${sampleReviewData.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review">${sampleReviewData.review}</div>
          <div>
        </html>`)

      return RottenReviews.getAudienceReviews('1198124-shutter_island', 1)
        .then(reviews => {
          const got = reviews[0]
          expect(got).toEqual(want)
        })
    })

    it('should recognize half stars rating', () => {
      const want = {
        ...sampleReviewData,
        stars: 3.5
      }
      expect.assertions(1)

      nockRequest.reply(200,
        `<html>
          <div class="review_table_row">
            <a class="bold unstyled articleLink"">${sampleReviewData.reviewer}</a>
            <span class="fr small subtle">${sampleReviewData.date}</span>
            <span>
              <span class="glyphicon glyphicon-star"></span>
              <span class="glyphicon glyphicon-star"></span>
              <span class="glyphicon glyphicon-star"></span>
              ½
            </span>
            <div class="user_review">${sampleReviewData.review}</div>
          <div>
        </html>`)

      return RottenReviews.getAudienceReviews('1198124-shutter_island', 1)
        .then(reviews => {
          const got = reviews[0]
          expect(got).toEqual(want)
        })
    })

  })
})
