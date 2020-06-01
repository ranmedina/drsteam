exports.buildResponse = (responseCode, description, body, stackTrace) => {
  const { status, statusCode, statusText } = responseCode;
  if (!status) {
    console.log('[buildResponse]: Could not find error code', responseCode);
    return;
  }

  let data = {
    ...body,
  };

  if (status >= 400) {
    data.stackTrace = stackTrace;
  }

  return {
    status,
    statusCode,
    statusText,
    description,
    data,
  };
};