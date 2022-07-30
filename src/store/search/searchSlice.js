import { createSlice } from "@reduxjs/toolkit";

let initialState = {
  results: [],
  keyword: "",
  movieDetails: {},
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setKeyword: (state, action) => {
      state.keyword = action.payload;
    },
    setMovieDetails: (state, action) => {
      state.movieDetails = action.payload;
    },
  },
});

export default searchSlice;
