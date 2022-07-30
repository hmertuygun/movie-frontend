import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  users: [],
  token: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users = [...state.users, action.payload];
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export default usersSlice;
