import { useEffect } from "react";
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loading, login, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 min-vw-100">
      {loading ? (
        <Spinner />
      ) : (
        <button className="btn btn-primary m-auto" onClick={login}>
          <FaGoogle className="me-2" /> Login
        </button>
      )}
    </div>
  );
};

export default Login;
