import { useMutation } from "@apollo/client";
import {
  FaBirthdayCake,
  FaEnvelope,
  FaPhone,
  FaUserCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Constants } from "../constants";
import { UsersMutations } from "../graphql/mutations";
import { UsersQueries } from "../graphql/queries";

const UserInfo = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [deleteUser] = useMutation(UsersMutations.DELETE_USER, {
    refetchQueries: [UsersQueries.GET_ALL_USERS],
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUser({ variables: { id: user.id } });
      navigate(-1);
    }
  };

  return (
    <div className="card p-0">
      <div className="row g-0">
        <div className="col-md-3">
          <img
            src={user.profilePicture ?? Constants.fallbackImage}
            className="img-fluid rounded-start w-100 h-100"
            alt={"user thumbnail"}
          />
        </div>
        <div className="col-md-9 d-flex flex-column">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <h3 className="m-0">
                {user.firstName} {user.lastName}
              </h3>
              <small className="text-secondary">{user.id}</small>
            </div>
            <div className="d-flex flex-column gap-2">
              <button className="btn btn-secondary btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
          <div className="card-body">
            <ul className="list-group">
              <li className="list-group-item">
                <FaEnvelope className="me-2" /> {user.email}
              </li>
              <li className="list-group-item">
                <FaPhone className="me-2" /> {user.phoneNumber}
              </li>
              {user.dayOfBirth && (
                <li className="list-group-item">
                  <FaBirthdayCake /> {user.dayOfBirth}
                </li>
              )}
              <li className="list-group-item">
                <FaUserCheck className="me-2" /> {user.role}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
