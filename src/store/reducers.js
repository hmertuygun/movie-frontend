import usersSlice from "./users/usersSlice";
import searchSlice from "./search/searchSlice";

const users = usersSlice.reducer;
const search = searchSlice.reducer;

export { users, search };
