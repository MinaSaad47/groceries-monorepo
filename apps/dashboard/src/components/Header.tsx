import { Link, useLocation } from "react-router-dom";

import { FaSignOutAlt } from "react-icons/fa";
import { SiJsonwebtokens, SiSwagger } from "react-icons/si";

import { toast } from "react-toastify";
import logo from "../assets/logo.svg";

const Header = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("credentials");
    window.location.reload();
  };

  const handleCopyToken = () => {
    const { token } = JSON.parse(localStorage.getItem("credentials") || "{}");
    window.navigator.clipboard.writeText(token);
    toast.info("copied jwt token to clipboard");
  };

  const handleGoToDocs = () => {
    window.open("/api/v1/docs", "_blank");
  };

  return (
    <nav className="navbar fixed-top navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand btn" to={"/"}>
          <img src={logo} alt="logo" className="me-2" />
          Groceries Dashboard
        </Link>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === "/" && "active"}`}
                to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/users" && "active"
                }`}
                to="/users">
                Users
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/items" && "active"
                }`}
                to="/items">
                Items
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/categories" && "active"
                }`}
                to="/categories">
                Categories
              </Link>
            </li>
          </ul>
        </div>
        <button
          className="btn btn-primary btn-sm ms-auto me-2"
          onClick={handleCopyToken}>
          <SiJsonwebtokens size={30} />
        </button>
        <button
          className="btn btn-success btn-sm ms-auto me-2"
          onClick={handleGoToDocs}>
          <SiSwagger size={30} />
        </button>
        <button
          className="btn btn-danger btn-sm ms-auto"
          onClick={handleLogout}>
          <FaSignOutAlt size={30} />
        </button>
        <button
          className="ms-2 navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>
    </nav>
  );
};

export default Header;
