const axios = require('axios');
const responseCodes = require('../utils/responseCodes');
const { buildResponse } = require('../utils/buildResponse');
const logger = new (require('dr-logger'))({
  fileName: 'item.log',
});

exports.getFloat = async (req, res) => {
  const { inspect } = req.query;
  if (!inspect) {
    res
      .status(responseCodes.STATUS_BADREQUEST.status)
      .send(buildResponse(responseCodes.STATUS_BADREQUEST, 'Missing parameter: inspect', {}, null));
    return;
  }

  try {
    // Currently leaning on csgofloat.com's public API, should manually run a bot if heavily used
    const { data } = await axios.get(`https://api.csgofloat.com/?url=${inspect}`);
    logger.log(`[FLOATER] ${req.ip || req.ips} checked his item float. ${inspect}`);
    res.status(200).send(data);
  } catch (error) {
    console.log(`[getFloat] ERROR: ${JSON.stringify(error.response.data)}`);
    const errorCode = error.response.data.code;
    switch (errorCode) {
      case 1: // Improper Parameter Structure
      case 2: // Invalid Inspect Link Structure
        return res
          .status(responseCodes.STATUS_BADREQUEST.status)
          .send(buildResponse(responseCodes.STATUS_BADREQUEST, 'Inspect link is wrong', {}, null));
      case 3: // You may only have X pending request(s) at a time
        return res
          .status(responseCodes.STATUS_INTERNALERROR.status)
          .send(
            buildResponse(responseCodes.STATUS_INTERNALERROR, 'Something went wrong... please try again in a few moments', {}, null)
          );
      case 4: // Valve's servers didn't reply in time
      case 5: // Valve's servers appear to be offline, please try again later!
        return res
          .status(responseCodes.STATUS_INTERNALERROR.status)
          .send(
            buildResponse(responseCodes.STATUS_INTERNALERROR, "Valve's servers seems to be offline, please try again later", {}, null)
          );
      default:
        return res
          .status(responseCodes.STATUS_INTERNALERROR.status)
          .send(buildResponse(responseCodes.STATUS_INTERNALERROR, 'Internal Server Error', {}, Error().stack));
    }
    return;
  }
};
