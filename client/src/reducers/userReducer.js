import { SET_USER } from '../actions/userActions';

const initialState = {
  username: null,
  steamid: null,
  avatar: null,
  admin: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        ...action.payload
      };
    default: 
      return state;
  }
};

export default userReducer;