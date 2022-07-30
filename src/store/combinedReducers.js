import { combineReducers } from "redux";
import { users } from "./reducers";

const reducers = combineReducers({
  users,
});

export default reducers;
