import { SERVER_HOST } from './index';
const axios = require('axios');

const ItemApi = {
  getFloat: (inspect) => axios.get(`${SERVER_HOST}/item/getFloat?inspect=${inspect}`),
};

export default ItemApi;
