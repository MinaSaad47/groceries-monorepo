import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

const Layout = () => {
  return (
    <>
      <Header />
      <div
        className="container"
        style={{ marginTop: "100px", marginBottom: "100px" }}>
        <Outlet />
      </div>
      <Footer />
    </>
  );
};

export default Layout;
