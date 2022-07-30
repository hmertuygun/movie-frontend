import usersSlice from "./UsersSlice";

const { addUser } = usersSlice.actions;

const registerUser = (value) => async (dispatch) => {
  dispatch(addUser(value));
};

export { registerUser };
