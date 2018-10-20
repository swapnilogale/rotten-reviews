const { setWorldConstructor } = require('cucumber')

const RottenReviews = require('../..')

class CustomWorld {
  constructor() {
    this.RottenReviews = RottenReviews
    this.result = {}
  }
}

setWorldConstructor(CustomWorld)
