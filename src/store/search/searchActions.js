import { getMovieDetails, searchKeyword } from "../../services/movies";
import searchSlice from "./searchSlice";

const { setKeyword, setResults, setMovieDetails } = searchSlice.actions;

const updateKeyword = (value) => async (dispatch) => {
  dispatch(setKeyword(value));
  const results = await searchKeyword(value);
  dispatch(updateResults(results));
};

const updateResults = (value) => async (dispatch) => {
  dispatch(setResults(value));
};

const updateMovieDetails = (value) => async (dispatch) => {
  const results = await getMovieDetails(value);
  dispatch(setMovieDetails(results));
};

export { updateKeyword, updateResults, updateMovieDetails };