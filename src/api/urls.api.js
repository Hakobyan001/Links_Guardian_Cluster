const express = require("express")

const {  test,addLinks,deleteUrls ,getLiveUrls,getCrawled, addChange, fullOnlyStatus,getFailed, getCrawledById, getCrawledLinksCountById, getChangesById,getChangeData,getLinks,getFailedLinks} = require('../controllers/urls.controller');
const LinksValidation = require("../validation/links.validation");
const router = express.Router();

router.get('/urls/live',getLiveUrls)
router.post('/urls/links',LinksValidation.validateLinksArgs, addLinks);
router.post('/urls/test', LinksValidation.validateRequest, test); // validation here
router.delete('/urls', LinksValidation.validateId, deleteUrls);
router.get('/urls/crawled/all',getCrawled);
router.get('/urls/crawled',getCrawledById);
router.get('/urls/crawled/count/links',getCrawledLinksCountById);
router.get('/urls/getFailed', getFailed);
router.get('/urls/changes', getChangesById);///----
router.post('/urls/freeRequest', LinksValidation.validateRequest, fullOnlyStatus);
router.post('/urls/change', addChange);// validation
router.get('/urls/getChangeData',getChangeData);
router.post('/urls/getLinks',getLinks );//validate
router.post('/urls/getFailedLinks',getFailedLinks);//---validate


module.exports = router;