import { searchKeyword } from "../../services/movies";
import searchSlice from "./searchSlice";

const { setKeyword, setResults } = searchSlice.actions;

const updateKeyword = (value) => async (dispatch) => {
  dispatch(setKeyword(value));
  const results = await searchKeyword(value);
  dispatch(updateResults(results));
};

const updateResults = (value) => async (dispatch) => {
  dispatch(setResults(value));
};

export { updateKeyword, updateResults };
