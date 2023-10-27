import { useQuery } from "@apollo/client";
import CreateItemModal from "../components/CreateItemModal";
import ItemCard from "../components/ItemCard";
import Spinner from "../components/Spinner";
import { ItemsQueries } from "../graphql/queries/items.queries";

const Items = () => {
  const { data, loading, error } = useQuery(ItemsQueries.GET_ALL_ITEMS);

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex justify-content-center">
        <CreateItemModal />
      </div>
      <div className="row">
        {data.items.map((item: any) => {
          return (
            <div key={item.id} className="col col-md-3 col-sm-6 p-3">
              <ItemCard key={item.id} item={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Items;
