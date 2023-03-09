const { LinksValidationSchema, DeleteValidationSchema, RequestValidationSchema, validQueries, checkerValidationSchema } = require('./schemes/links.validation.schema');
const ValidatorUtil = require('./util/validator.util');

class LinksValidation {
    static async validateLinksArgs(req, res, next) {
        const keys = Object.keys(req.body);
        if (keys.length > 1) {
            for (let i = 0; i < keys.length; i++) {
                const url = Object.keys(req.body)[i];
                const data = Object.values(req.body)[i];
                const allData = { allData: { url, data } };
                if (allData) {
                    const result = await ValidatorUtil.validateArgs(allData, LinksValidationSchema.LinksSchema, next);
                    return result;
                }

            }

        } else {
            const url = Object.keys(req.body)[0];
            const data = Object.values(req.body)[0];
            const allData = { allData: { url, data } };
            ValidatorUtil.validateArgs(allData, LinksValidationSchema.LinksSchema, next);

        }
            

    }

    static validateId(req, res, next) {
        ValidatorUtil.validateArgs(req, DeleteValidationSchema.DeleteSchema, next);
    }

    static validateRequest(req, res, next) {
        ValidatorUtil.validateArgs(req, RequestValidationSchema.RequestSchema, next);
    }

    static validateQueries(req, res, next) {
        ValidatorUtil.validateArgs(req, validQueries.getQueries, next);
    }

    
    static validateChecker(req, res, next) {
        const url = Object.keys(req.body)[0];
        const data = Object.values(req.body).flat();
        const fullData = {allData: {url, data}}
        console.log(fullData);
        ValidatorUtil.validateArgs(fullData, checkerValidationSchema.checkerSchema, next);
    }
}

module.exports = LinksValidation;
