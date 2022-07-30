import usersSlice from "./usersSlice";

const { addUser, setToken, setFavorites, deleteFavorite } = usersSlice.actions;

const registerUser = (value) => async (dispatch) => {
  dispatch(addUser(value));
};

const loginUser = (value) => async (dispatch) => {
  dispatch(setToken(value));
};

const addFavorites = (value) => async (dispatch) => {
  dispatch(setFavorites(value));
};

const removeFavorite = (value) => async (dispatch) => {
  console.log(value);
  dispatch(deleteFavorite(value));
};

export { registerUser, loginUser, addFavorites, removeFavorite };
