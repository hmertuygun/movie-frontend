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
  },
});

export default usersSlice;
