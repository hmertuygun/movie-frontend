import usersSlice from "./usersSlice";

const { addUser, setToken } = usersSlice.actions;

const registerUser = (value) => async (dispatch) => {
  dispatch(addUser(value));
};

const loginUser = (value) => async (dispatch) => {
  dispatch(setToken(value));
};

export { registerUser, loginUser };
