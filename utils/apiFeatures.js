class APIFeatures {
    // theQuery variable is coming from the request object
    // the query variable corresponding t Model.find() where Model can be any model
    constructor(query, reqQuery) {
        this.query = query;
        this.reqQuery = reqQuery;
    }

    // Advanced Filtering => filtering data based the parameters specified on the url
    // Example : www.natours.com/api/tours?price[lte]=250&rating[gte]=4.3 <==>( price<=250and rating =>4.5)
    // <==> {price:{lte:250},rating:{gte:4.3}}

    filter() {
        const queryObj = { ...this.reqQuery };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((field) => delete queryObj[field]);
        let queryString = JSON.stringify(queryObj);
        // refactoring the string to match mongoDB query object
        queryString = queryString.replace(
            /\b(lt|lte|gte|gt)\b/g,
            (match) => `$${match}`
        );
        this.query = this.query.find(JSON.parse(queryString));
        return this;
    }

    // Sorting the result query
    // Example URL/tours?sort=price,-rating
    sort() {
        if (this.reqQuery.sort) {
            const sortBy = this.reqQuery.sort.split(',').join(' ');
            // - before the field =>  asceinding order
            this.query = this.query.sort(sortBy);
            // sort by multiple fields
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }

    // specifying the fields that we want from the query
    // Example ; URL/tours?fields:name,price
    // - means the select of the field except that one (-name)
    limitFields() {
        if (this.reqQuery.fields) {
            const fields = this.reqQuery.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            // excluding a field => -fieldName
            this.query = this.query.select('-__v');
        }
        return this;
    }

    // construct pages from the result of the api
    // Example : URL/tours?page=2&limit=15
    paginate() {
        const page = this.reqQuery.page * 1 || 1;
        const limit = this.reqQuery.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}

module.exports = APIFeatures;
