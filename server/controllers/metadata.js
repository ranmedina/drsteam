const { buildResponse } = require('../utils/buildResponse');
const { connection } = require('../config/connection');
const { STATUS_OK, STATUS_BADREQUEST, STATUS_INTERNALERROR } = require('../utils/responseCodes');
const logger = new (require('dr-logger'))({
  fileName: 'item.log',
});

const pages = {
  inventory: true,
  floater: true,
  steamid: true,
  steamvalue: true,
};

exports.getAppData = (_req, res) => {
  connection.query('SELECT * FROM appdata', (err, result) => {
    if (err) {
      res.status(STATUS_INTERNALERROR.status).send(buildResponse(STATUS_INTERNALERROR, 'Could not get metadata', {}, Error().stack));
      return;
    }
    res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, null, result[0], null));
  });
};

exports.getPagesStatus = (_req, res) => {
  res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, null, pages, null));
};

exports.setPageStatus = (req, res) => {
  const { pageName, status } = req.body;
  if (Object.keys(pages).includes(pageName)) {
    pages[pageName] = status;
    return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, 'Page status changed', pages, null));
  }

  return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Could not find page name', {}, null));
};

exports.updateContent = (req, res) => {
  const { title, ribbon, content } = req.body;
  if (!title || !ribbon || !content) {
    return res.status(STATUS_BADREQUEST.status).send(buildResponse(STATUS_BADREQUEST, 'Missing parameters', {}, null));
  }

  connection.query(
    `UPDATE appdata SET content_title=?, content_ribbon=?, content_content=?`,
    [title, ribbon, content],
    (err, result) => {
      if (err) {
        throw err;
      }

      logger.log(
        `[METADATA] App data updated. (title: ${title}, ribbon: ${ribbon}, content: ${content.slice(0, Math.min(content.length, 10))})`
      );
      return res.status(STATUS_OK.status).send(buildResponse(STATUS_OK, 'Content updated', {}, null));
    }
  );
};
