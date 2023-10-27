import { useQuery } from "@apollo/client";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import AddressesTable from "../components/AddressesTable";
import Spinner from "../components/Spinner";
import UserInfo from "../components/UserInfo";
import { UsersQueries } from "../graphql/queries";

const User = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(UsersQueries.GET_ONE_USER, {
    variables: {
      id,
    },
  });

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log(data);

  const user = data.user;

  return (
    <div className="my-4 container accordion" id="userAccordion">
      <button
        className="btn btn-outline-primary m-3 fixed-bottom"
        onClick={() => navigate(-1)}>
        <FaArrowLeft /> Return to all users
      </button>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseOne"
            aria-expanded="true"
            aria-controls="panelsStayOpen-collapseOne">
            User Info
          </button>
        </h2>
      </div>

      <div
        id="panelsStayOpen-collapseOne"
        className="accordion-collapse collapse show">
        <div className="accordion-body">
          <UserInfo user={user} />
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseTwo"
            aria-expanded="true"
            aria-controls="panelsStayOpen-collapseTwo">
            Addresses
          </button>
        </h2>
      </div>

      <div
        id="panelsStayOpen-collapseTwo"
        className="accordion-collapse collapse show">
        <div className="accordion-body">
          <AddressesTable addresses={user.addresses} />
        </div>
      </div>
    </div>
  );
};

export default User;
