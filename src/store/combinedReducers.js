import { combineReducers } from "redux";
import { users, search } from "./reducers";

const reducers = combineReducers({
  users,
  search,
});

export default reducers;
