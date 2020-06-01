const express = require('express');
const router = express.Router();
const games = require('../config/gamelist');
const metadataController = require('../controllers/metadata');
const responseCodes = require('../utils/responseCodes');

router.get('/getAppData', metadataController.getAppData);
router.get('/getGameList', (req, res) => res.status(responseCodes.STATUS_OK.status).send(games));
router.get('/getPagesStatus', metadataController.getPagesStatus);
router.post('/setPageStatus', metadataController.setPageStatus);
router.post('/updateContent', metadataController.updateContent);

module.exports = router;
