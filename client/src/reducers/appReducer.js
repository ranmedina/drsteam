import { SET_LOADING, SET_GAME_LIST, SET_APP_DATA, SET_ADMIN_MODE, SET_PAGES_STATUS } from '../actions/appActions';

const initialState = {
  loading: false,
  gameList: [],
  adminMode: false,
  app_data: {
    site_status: 1,
    inventory_calculations: 0,
    inventory_totalvalue: 0,
    inventory_average: 0,
  },
  pages: {
    inventory: true,
    floater: true,
    steamid: true,
    steamvalue: true,
  },
};

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case SET_GAME_LIST:
      return {
        ...state,
        gameList: action.payload,
      };
    case SET_APP_DATA:
      return {
        ...state,
        app_data: action.payload,
      };
    case SET_ADMIN_MODE:
      return {
        ...state,
        adminMode: action.payload,
      };
    case SET_PAGES_STATUS:
      return {
        ...state,
        pages: action.payload,
      };
    default:
      return state;
  }
};

export default appReducer;
