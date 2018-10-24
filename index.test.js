const nock = require('nock')
const { expect } = require('chai')
const RottenReviews = require('.')
const { getAudienceReviews, scrapePage } = RottenReviews

const baseURL = 'https://www.rottentomatoes.com'

describe('[RottenReviews]',  () => {
  describe('Get audiences reviews',  () => {

    it('should exists the method "getAudienceReviews"',  () => {
      expect(typeof RottenReviews.getAudienceReviews).toBe('function')
    })

    it('should return the reviews when I try to get audiences reviews of a existing movie', () => {
      const want = {
        "date": "October 12, 2018",
        "review": "Very cool plot twist at the end, enjoyable movie.",
        "reviewer": "Daniel M",
        "stars": 4
      }
      expect.assertions(1)

      return RottenReviews.getAudienceReviews('venom_2018', 21)
        .then(reviews => expect(reviews[0]).toEqual(want))
    })

    it('should recognize half stars rating', () => {
      const want = {
        "date": "October 1, 2018",
        "review": "Uncomfortable length and unrewarding end.",
        "reviewer": "Ines P",
        "stars": 2.5
      }
      expect.assertions(1)

      return RottenReviews.getAudienceReviews('venom_2018', 2)
        .then(reviews => expect(reviews[1]).toEqual(want))
    })

    it('should return the reviews when I try to get audiences reviews of a existing tv show', () => {
      const want = {
        "date": "October 12, 2018",
        "review": "Very cool plot twist at the end, enjoyable movie.",
        "reviewer": "Daniel M",
        "stars": 4
      }
      expect.assertions(1)

      return RottenReviews.getAudienceReviews('doctor_who/s11', 1, true)
        .then(reviews => expect(reviews[0]).toEqual(want))
    })

    it('should throw an error if there is no movie', () => {
      const want = 'Request failed with status code 404'
      expect.assertions(1)

      return RottenReviews.getAudienceReviews('non_existent_movie', 1)
        .catch(error => expect(error.message).toEqual(want))
    })

  })
})
describe('[RottenReviews]', () => {
  describe('#getAudienceReviews()', () => {
    describe('When unknown error occurs', () => {
      let error

      beforeEach(async () => {
        nock('https://www.rottentomatoes.com')
          .get(`/m/carnage_2018/reviews/?page=1&type=user`)
          .reply(500)
        
        try {
          await getAudienceReviews('carnage_2018', 1)
        } catch (err) {
          error = { ...err }
        }
      })

      it('Should return error', () => {
        expect(error).to.not.be.null
      })
    })

    describe('When movie doesn\'t exist', () => {
      let error
      let scope

      beforeEach(async () => {
        scope = nock('https://www.rottentomatoes.com')
          .get(`/m/carnage_2018/reviews/?page=1&type=user`)
          .reply(404)

        try {
          await getAudienceReviews('carnage_2018', 1)
        } catch (err) {
          error = { ...err }
        }
      })

      afterEach(() => scope.done());

      it('Should return error', () => {
        expect(error).to.not.be.null
        expect(error).to.be.an('Object')
      })

    })

    describe('When movie exists', () => {
      describe('When param "TV" is false', () => {
        let reviews
        let scope
  
        const attrs = {
          reviewer: 'igor costa',
          date: 'October 12, 2018',
          review: 'Great Movie !!!! So much action with just the right amount of comedy.'
        }
  
        const response = 
        `<html>
          <span class="pageInfo">Page 1 of 1</span>
          <div class="review_table_row">
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
          <div>
        </html>`
        
        beforeAll(async (done) => {
          scope = nock('https://www.rottentomatoes.com')
            .persist()
            .get(`/m/venom_2018/reviews/?page=1&type=user`)
            .reply(200, response)
            
          reviews = await getAudienceReviews('venom_2018', 1)
          done();
        });

        // afterEach(() => scope.done());
  
        it('Should return an array of reviews',() => {
          expect(reviews).to.be.an('Array')
          expect(reviews.length).to.be.eql(1)
        })
        
        it('Should return the reviewer', () => {
          expect(reviews[0].reviewer).to.be.eql('igor costa')
        })
  
        it('Should return the date of review', () => {
          expect(reviews[0].date).to.be.eql('October 12, 2018')
        })
  
        it('Should return the stars rate of review', () => {
          expect(reviews[0].stars).to.be.eql(3)
        })

        it('Should return the text review', () => {
          expect(reviews[0].review).to.be.eql('Great Movie !!!! So much action with just the right amount of comedy.')
        })
      })

      describe('When param "TV" is true', () => {
        let reviews
  
        const attrs = {
          reviewer: 'anna leszkiewicz',
          date: 'October 10, 2018',
          review: 'It\'s a visually compelling, often funny show that is sharp on a number of contemporary themes.'
        }
  
        const response = 
        `<html>
          <span class="pageInfo">Page 1 of 1</span>
          <div class="review_table_row">
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star">½</span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
          <div>
        </html>`
        
        beforeAll(async (done) => {
          scope = nock('https://www.rottentomatoes.com')
            .persist()
            .get(`/tv/maniac/s01/reviews/?page=1&type=user`)
            .reply(200, response)
            
          reviews = await getAudienceReviews('maniac/s01', 1, true)
          done();
        })

        // afterEach(() => scope.done());
  
        it('Should return an array of reviews',() => {
          expect(reviews).to.be.an('Array')
          expect(reviews.length).to.be.eql(1)
        })
        
        it('Should return the reviewer', () => {
          expect(reviews[0].reviewer).to.be.eql('anna leszkiewicz')
        })
  
        it('Should return the date of review', () => {
          expect(reviews[0].date).to.be.eql('October 10, 2018')
        })
  
        it('Should return the stars rate of review', () => {
          expect(reviews[0].stars).to.be.eql(3.5)
        })

        it('Should return the text of review', () => {
          expect(reviews[0].review).to.be.eql('It\'s a visually compelling, often funny show that is sharp on a number of contemporary themes.')
        })
      })
    }) 
  })

  describe('#scrapePage()', () => {
    const attrs = {
      reviewer: 'julia d',
      date: 'October 12, 2018',
      review: 'One of the best romcoms I\'ve ever watched.'
    }
    
    describe('When content data doen\'t have any element with class review_table_row', () => {
      let reviews

      const data = 
        `<html>
          <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
            <a class="bold unstyled articleLink" href="/user/id/785903811/">
              <span style="word-wrap:break-word">${attrs.reviewer}</span> 
            </a>
          </div>
          <span class="fr small subtle">${attrs.date}</span>
          <span class="glyphicon glyphicon-star"></span>
          <div class="user_review" style="display:inline-block; width:100%"> 
            <div class="scoreWrapper">
              <span class="wts"></span>
            </div> 
            ${attrs.review}
          </div>
        </html>`

      beforeEach(() => {
        reviews = scrapePage(data)
      })

      it('Should return reviews as an empty array', () => {
        expect(reviews).to.be.an('Array').and.be.empty
      })
    })

    describe('When content data have element with class "review_table_row"', () => {
      describe('When content data have only one review', () => {
        let reviews
        const data = 
        `<html>
          <div class="review_table_row">
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
          <div>
        </html>`

        beforeEach(() => {
          reviews = scrapePage(data)
        })
  
        it('Should return review as an array', () => {
          expect(reviews).to.be.an('Array')
          expect(reviews.length).to.be.eql(1)
        })

        it('Should return the reviewer', () => {
          expect(reviews[0].reviewer).to.be.eql('julia d')
        })
  
        it('Should return the date of review', () => {
          expect(reviews[0].date).to.be.eql('October 12, 2018')
        })
  
        it('Should return the stars rate of review', () => {
          expect(reviews[0].stars).to.be.eql(1)
        })

        it('Should return the text of review', () => {
          expect(reviews[0].review).to.be.eql('One of the best romcoms I\'ve ever watched.')
        })
      })
      describe('When content data have more than one reviews', () => {
        let reviews
        const data = 
        `<html>
          <div class="review_table_row">
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
          </div>
          <div class="review_table_row">
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
           </div>
           <div class="review_table_row"> 
            <div class="col-sm-11 col-xs-24 col-sm-pull-4"> 
              <a class="bold unstyled articleLink" href="/user/id/785903811/">
                <span style="word-wrap:break-word">${attrs.reviewer}</span> 
              </a>
            </div>
            <span class="fr small subtle">${attrs.date}</span>
            <span class="glyphicon glyphicon-star"></span>
            <div class="user_review" style="display:inline-block; width:100%"> 
              <div class="scoreWrapper">
                <span class="wts"></span>
              </div> 
              ${attrs.review}
            </div>
          <div>
        </html>`

        beforeEach(() => {
          reviews = scrapePage(data)
        })
  
        it('Should return all reviews on content data', () => {
          expect(reviews).to.be.an('Array')
          expect(reviews.length).to.be.eql(3)
        })
      })
    })
  })
})

/* Nock config */
nock(baseURL)
  .persist()
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
  .get(`/m/venom_2018/reviews/`)
  .query({
    page: 1,
    type: 'user'
  })
  .reply(200,
    `<html>
      <span class="pageInfo">Page 1 of 2</span>

      <div class="review_table">
        <div class="row review_table_row">
          <a class="bold unstyled articleLink">Daniel M</a>
          <span class="fr small subtle">October 12, 2018</span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <div class="user_review">Very cool plot twist at the end, enjoyable movie.</div>
        </div>

        <div class="row review_table_row">
          <a class="bold unstyled articleLink">Ines P</a>
          <span class="fr small subtle">October 1, 2018</span>
          <span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            ½
          </span>
          <div class="user_review">Uncomfortable length and unrewarding end.</div>
        </div>
      </div>
    </html>`)

nock(baseURL)
  .persist()
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
  .get('/m/venom_2018/reviews/')
  .query({
    page: 2,
    type: 'user'
  })
  .reply(200,
    `<html>
      <span class="pageInfo">Page 2 of 2</span>
    </html>`)

nock(baseURL)
  .persist()
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
  .get(`/tv/doctor_who/s11/reviews/`)
  .query({
    page: 1,
    type: 'user'
  })
  .reply(200,
    `<html>
      <span class="pageInfo">Page 1 of 1</span>

      <div class="review_table">
        <div class="row review_table_row">
          <a class="bold unstyled articleLink">Daniel M</a>
          <span class="fr small subtle">October 12, 2018</span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <span class="glyphicon glyphicon-star"></span>
          <div class="user_review">Very cool plot twist at the end, enjoyable movie.</div>
        </div>

        <div class="row review_table_row">
          <a class="bold unstyled articleLink">Ines P</a>
          <span class="fr small subtle">October 1, 2018</span>
          <span>
            <span class="glyphicon glyphicon-star"></span>
            <span class="glyphicon glyphicon-star"></span>
            ½
          </span>
          <div class="user_review">Uncomfortable length and unrewarding end.</div>
        </div>
      </div>
    </html>`)

nock(baseURL)
  .persist()
  .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
  .get(`/m/non_existent_movie/reviews/`)
  .query({
    page: 1,
    type: 'user'
  })
  .reply(404, {
    status: 404
  })
