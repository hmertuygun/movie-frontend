import usersSlice from "./usersSlice";

const {
  addUser,
  setToken,
  setFavorites,
  deleteFavorite,
  setDetails,
  addGenre,
} = usersSlice.actions;

const registerUser = (value) => async (dispatch) => {
  dispatch(addUser(value));
};

const loginUser = (value) => async (dispatch) => {
  dispatch(setToken(value));
};

const addFavorites = (value) => async (dispatch) => {
  dispatch(addGenre({ genre: value.genre, token: value.email }));
  dispatch(setFavorites(value));
};

const removeFavorite = (value) => async (dispatch) => {
  dispatch(deleteFavorite(value));
};

const updateUserDetails = (value) => async (dispatch) => {
  dispatch(setDetails(value));
};

const LogOut = () => async (dispatch) => {
  dispatch(setToken(null));
};

export {
  registerUser,
  loginUser,
  addFavorites,
  removeFavorite,
  updateUserDetails,
  LogOut,
};
