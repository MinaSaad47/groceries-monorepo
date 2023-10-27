import UserListItem from "./UserListItem";

const UsersList = ({ users }: { users: any[] }) => {
  return (
    <div className="d-flex flex-column gap-1">
      {users.map((user) => (
        <UserListItem key={user.id} user={user} />
      ))}
    </div>
  );
};

export default UsersList;
