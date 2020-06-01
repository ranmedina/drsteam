import { SERVER_HOST } from './index';
const axios = require('axios');

const MetadataApi = {
  getAppData: () => axios.get(`${SERVER_HOST}/metadata/getAppData`),
  getGameList: () => axios.get(`${SERVER_HOST}/metadata/getGameList`),
  getPagesStatus: () => axios.get(`${SERVER_HOST}/metadata/getPagesStatus`),
  setPageStatus: (page, status) =>
    axios.post(`${SERVER_HOST}/metadata/setPageStatus`, {
      pageName: page,
      status,
    }),
  updateContent: (title, ribbon, content) =>
    axios.post(`${SERVER_HOST}/metadata/updateContent`, {
      title,
      ribbon,
      content,
    }),
};

export default MetadataApi;
