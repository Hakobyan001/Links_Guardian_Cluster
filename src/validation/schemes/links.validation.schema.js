// NPM modules
const Joi = require('joi');

        const LinksValidationSchema = {
            LinksSchema: {
                allData: Joi.object({
                    url: Joi.string().uri({ scheme: ['http', 'https'] }).required(),
                        data: Joi.object({
                        title: Joi.string().required(),
                        robot_tag: Joi.string().valid('indexable', 'noindexable').required(),
                        favicon: Joi.any().allow(null).required(),
                        status: Joi.number().required(),
                        details:Joi.object({
                            new_price: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            client_price: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            platform: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            link_type: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            seller_name: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            screenshots:Joi.array().items(Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              )),
                            comment: Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                            provider_email:Joi.alternatives().try(
                                Joi.string().valid(null),
                                Joi.allow(null),
                                Joi.string()
                              ),
                        }).required(),                       
                        externalInfo: Joi.array().items(Joi.object({
                            url: Joi.string().required(),
                            rel: Joi.string().valid('dofollow', 'nofollow').required(),
                            keyword: Joi.string().required(),
                            robot_tag: Joi.string().valid('indexable', 'noindexable').required(),
                            status: Joi.number().required()
                        })).required(),
                        redirected_chains: Joi.array().items(Joi.object({
                            urls: Joi.string().required(),
                            status: Joi.number().required()
                        })).required(),
                        campaign_id: Joi.number().required(),
                        user_id: Joi.number().required()
                    }).required()
                })
            }
        }          
        const positiveNumber = Joi.number().min(1);
        const ID = positiveNumber.integer();

        const DeleteValidationSchema = {
            DeleteSchema: {
                body: Joi.object({
                    id: Joi.array().items(ID).required()
                })
            }
        }

        const RequestValidationSchema = {
            RequestSchema: {
                body: Joi.array().items(Joi.string().uri({ scheme: ['http', 'https'] }).required())
            }
        }
        const queriesNumbers = positiveNumber.integer();
        const validQueries = {
            getQueries: {
                query: Joi.object({
                    userId: queriesNumbers.required(),
                    page: queriesNumbers.required(),
                    limit: queriesNumbers.required()
                })
            },
        }

        const checkerValidationSchema = {
            checkerSchema: {
                allData: Joi.object({
                    url:Joi.string().uri({ scheme: ['http', 'https'] }).required() ,
                    data: Joi.array().items(Joi.string().uri({ scheme: ['http', 'https'] }).required())
                })
            }
        }



module.exports = { LinksValidationSchema, DeleteValidationSchema, RequestValidationSchema, validQueries, checkerValidationSchema };