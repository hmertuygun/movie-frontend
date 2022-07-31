import { getMovieDetails, searchKeyword } from "../../services/movies";
import searchSlice from "./searchSlice";

const { setKeyword, setResults, setMovieDetails, setError } =
  searchSlice.actions;

const updateKeyword = (value) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setKeyword(value));
  if (value.length > 0) {
    const results = await searchKeyword(value);
    dispatch(updateResults(results));
  } else {
    dispatch(updateResults([]));
  }
};

const updateResults = (value) => async (dispatch) => {
  dispatch(setError(null));
  const results = value.filter((item) => item.Poster !== "N/A");
  dispatch(setResults(results));
};

const updateMovieDetails = (value) => async (dispatch) => {
  dispatch(setError(null));
  const results = await getMovieDetails(value);
  if (results) {
    dispatch(setMovieDetails(results));
  } else dispatch(setError("Movie not found"));
};

export { updateKeyword, updateResults, updateMovieDetails };
