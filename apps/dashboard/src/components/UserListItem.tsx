import { useNavigate } from "react-router-dom";

const UserListItem = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/users/${user.id}`);
  };

  // const handleDelete = () => {
  //   if (confirm("Are you sure you want to delete this user?")) {
  //     navigate(`/users/${user.id}`);
  //   }
  // };

  return (
    <div className="d-flex align-items-center gap-4 border rounded py-1 px-2">
      <img
        src={user.profilePicture ?? "https://via.placeholder.com/100"}
        alt="user thumbnail"
        className="rounded-circle"
        width="60"
        height="auto"
      />
      <div className="d-flex flex-column justify-content-center gap-2">
        <div className="lead">{user.email}</div>
        <div className="text-secondary">{user.id}</div>
      </div>
      <div className="ms-auto d-flex flex-column justify-content-center gap-1">
        <button className="btn btn-secondary" onClick={handleView}>
          View
        </button>
      </div>
    </div>
  );
};

export default UserListItem;
