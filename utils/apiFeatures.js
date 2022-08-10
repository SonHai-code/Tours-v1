// query=Tour.find()    queryString=req.query
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'limit', 'sort', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]); // Remove some excludedFields from queryObj

    // 2) Advanced Filtering
    let queryStr = JSON.stringify(queryObj); // object --> string
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // regular expressions

    // const query = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
    this.query.find(JSON.parse(queryStr)); // Tour.find will return a query

    return this;
  }

  sort() {
    // 3) Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // 4) Fields limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' '); // fields is a string
      this.query = this.query.select(fields); // this.query is Doc.find(); this.queryString is req.query
    } else {
      this.query = this.query.select('-__v'); 
    }
    return this;
  }

  paginate() {
    // 5) Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 10;
    const skip = (page - 1) * limit;

    // limit = 10 => Page 1: 1-10 ; Page 2: 11 - 20; Page 3: 21 - 30
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
