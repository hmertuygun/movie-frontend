import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  users: [],
  favorites: [],
  token: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addUser: (state, action) => {
      state.users = [...state.users, action.payload];
    },
    setFavorites: (state, action) => {
      console.log(action);
      state.favorites = [...state.favorites, action.payload];
    },
    deleteFavorite: (state, action) => {
      let newFavorites = state.favorites.filter(
        (element) => element.imdbID !== action.payload,
      );
      state.favorites = newFavorites;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setDetails: (state, action) => {
      let currentUser = state.users.find(
        (user) => user.email === action.payload.token,
      );
      let allUsers = state.users.filter(
        (element) => element.email !== action.payload.token,
      );
      state.users = [
        ...allUsers,
        { ...currentUser, details: action.payload.allItems },
      ];
    },
  },
});

export default usersSlice;
