import { SERVER_HOST } from './index';
const axios = require('axios');

const UserApi = {
  getSummary: () => axios.get(`${SERVER_HOST}/user/getSummary`, { withCredentials: true }),
  getInventory: (steamid, appid) => axios.get(`${SERVER_HOST}/user/getInventory?steamid=${steamid}&appid=${appid}`),
  getSteamId: (steamid) => axios.get(`${SERVER_HOST}/user/getSteamId?steamid=${steamid}`, { withCredentials: true }),
  getAllUsers: () => axios.get(`${SERVER_HOST}/user/getAll`),
  getGamesWorth: (steamid) => axios.get(`${SERVER_HOST}/user/getGamesWorth?steamid=${steamid}`),
  banUser: (steamid, value) => axios.post(`${SERVER_HOST}/user/ban`, { steamid, value }, { withCredentials: true }),
  setAdmin: (steamid, value) => axios.post(`${SERVER_HOST}/user/setAdmin`, { steamid, value }, { withCredentials: true }),
};

export default UserApi;
