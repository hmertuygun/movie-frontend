import { Routes, Route } from "react-router-dom";

import LogIn from "./pages/LogIn";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Home from "./pages/Home";
import RequireAuth from "./components/routes/RequireAuth";
import { useSelector } from "react-redux";
import NavBar from "./components/public/NavBar";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";

function App() {
  const { token } = useSelector((state) => state.users);

  return (
    <div className="App">
      {token && <NavBar />}
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/discover"
          element={
            <RequireAuth>
              <Discover />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route path="register" element={<Register />} />
        <Route path="login" element={<LogIn />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
