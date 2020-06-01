import { combineReducers } from 'redux';
import userReducer from './userReducer';
import authReducer from './authReducer';
import appReducer from './appReducer';

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  user: userReducer
});

export default rootReducer;
