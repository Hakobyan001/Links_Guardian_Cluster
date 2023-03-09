const express = require("express")

const {  test,addLinks,deleteUrls ,checker, getLiveUrls,getCrawled, addChange, fullOnlyStatus,getFailed, getCrawledById, getCrawledLinksCountById, getChangesById,getChangeData,getLinks,getFailedLinks} = require('../controllers/urls.controller');
const LinksValidation = require("../validation/links.validation");
const router = express.Router();

router.post('/urls/test', LinksValidation.validateRequest, test); 
router.post('/urls/checker', LinksValidation.validateChecker, checker);
router.post('/urls/freeRequest', LinksValidation.validateRequest, fullOnlyStatus);
router.post('/urls/links',LinksValidation.validateLinksArgs, addLinks);
router.delete('/urls', LinksValidation.validateId, deleteUrls);
router.get('/urls/getFailed', getFailed);
router.get('/urls/live',getLiveUrls)
router.get('/urls/changes', getChangesById);
router.get('/urls/crawled',getCrawledById);
router.get('/urls/crawled/all',getCrawled);
router.get('/urls/crawled/count/links',getCrawledLinksCountById);
router.post('/urls/change', addChange);
router.get('/urls/changes/all',getChangeData);
router.post('/urls/getLinks',getLinks);
router.post('/urls/getFailedLinks', LinksValidation.validateQueries, getFailedLinks);

module.exports = router;