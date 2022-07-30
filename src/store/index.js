import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import thunk from "redux-thunk";
import logger from "redux-logger";
import reducers from "./combinedReducers";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);
let middleware = [thunk];
middleware = [...middleware, logger];

const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [...middleware],
});

export default store;
