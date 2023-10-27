import { useQuery } from "@apollo/client";
import Spinner from "../components/Spinner";
import UsersList from "../components/UsersList";
import { UsersQueries } from "../graphql/queries";

const Users = () => {
  const { data, loading, error } = useQuery(UsersQueries.GET_ALL_USERS);

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <UsersList users={data.users} />;
};

export default Users;
