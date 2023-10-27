import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./contexts/AuthContext";
import Categories from "./pages/Categories";
import Home from "./pages/Home";
import Item from "./pages/Item";
import Items from "./pages/Items";
import Login from "./pages/Login";
import User from "./pages/User";
import Users from "./pages/Users";

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/users/:id" element={<User />} />
        <Route path="/items/:id" element={<Item />} />
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <Users />
              </RequireAuth>
            }
          />
          <Route
            path="/items"
            element={
              <RequireAuth>
                <Items />
              </RequireAuth>
            }
          />
          <Route
            path="/categories"
            element={
              <RequireAuth>
                <Categories />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
