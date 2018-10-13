const { expect } = require('chai')
const nock = require('nock')
const { getAudienceReviews, scrapePage } = require('../index')

describe('[RottenReviews]', () => {
  describe('#getAudienceReviews()', () => {
    context('When unknown error occurs', () => {
      let error

      before(async () => {
        nock('https://www.rottentomatoes.com')
          .get(`/m/carnage_2018/reviews/?page=1&type=user&sort=`)
          .reply(500)
        
        try {
          await getAudienceReviews('carnage_2018', 1)
        } catch (err) {
          error = { ...err }
        }
      })

      it('Should return error', () => {
        expect(error).to.not.be.null
        expect(error).to.be.an('Object')
      })

      it('Error should have property message', () => {
        expect(error).to.have.property('message')
      })

      it('Error should have a message informing that an error occured', () => {
        expect(error.message).to.be.eql('⚠️  An error occured, please try again.')
      })
      
    })

    context('When movie doesn\'t exist', () => {
      let error

      before(async () => {
        nock('https://www.rottentomatoes.com')
          .get(`/m/carnage_2018/reviews/?page=1&type=user&sort=`)
          .reply(404)

        try {
          await getAudienceReviews('carnage_2018', 1)
        } catch (err) {
          error = { ...err }
        }
      })

      it('Should return error', () => {
        expect(error).to.not.be.null
        expect(error).to.be.an('Object')
      })

      it('Error should have properties status and message', () => {
        expect(error).to.have.property('status')
        expect(error).to.have.property('message')
      })

      it('Error should have status 404', () => {
        expect(error.status).to.be.eql(404)
      })

      it('Error should have a message informing that movie hasn\'t found', () => {
        expect(error.message).to.be.eql(`⚠️  Page not found for 'carnage_2018'. You can check the page manually by opening this link:
https://www.rottentomatoes.com/carnage_2018/1/reviews/?page=undefined&type=user&sort=`
        )
      })
    })

    context('When movie exists', () => {
      context('When param "TV" is false', () => {
        let reviews
  
        const attrs = {
          reviewer: 'igor costa',
          date: 'October 12, 2018',
          review: 'Great Movie !!!! So much action with just the right amount of comedy.'
        }
  
        const response = 
        `<html>
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
        
        before(async () => {
          nock('https://www.rottentomatoes.com')
            .get(`/m/venom_2018/reviews/?page=1&type=user&sort=`)
            .reply(200, response)
            
          reviews = await getAudienceReviews('venom_2018', 1)
        })
  
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

      context('When param "TV" is true', () => {
        let reviews
  
        const attrs = {
          reviewer: 'anna leszkiewicz',
          date: 'October 10, 2018',
          review: 'It\'s a visually compelling, often funny show that is sharp on a number of contemporary themes.'
        }
  
        const response = 
        `<html>
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
        
        before(async () => {
          nock('https://www.rottentomatoes.com')
            .get(`/tv/maniac/reviews/?page=1&type=user&sort=`)
            .reply(200, response)
            
          reviews = await getAudienceReviews('maniac', 1, true)
        })
  
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
    
    context('When content data doen\'t have any element with class review_table_row', () => {
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

      before(() => {
        reviews = scrapePage(data)
      })

      it('Should return reviews as an empty array', () => {
        expect(reviews).to.be.an('Array').and.be.empty
      })
    })

    context('When content data have element with class "review_table_row"', () => {
      context('When content data have only one review', () => {
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

        before(() => {
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
      context('When content data have more than one reviews', () => {
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

        before(() => {
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
