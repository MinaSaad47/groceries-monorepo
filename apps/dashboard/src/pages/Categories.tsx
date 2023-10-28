import { useQuery } from "@apollo/client";
import AddOrUpdateCategoryModel from "../components/AddUpdateCategoryModal";
import CategoryCard from "../components/CategoryCard";
import Spinner from "../components/Spinner";
import { CategoriesQueries } from "../graphql/queries";

const Categories = () => {
  const { data, loading, error } = useQuery(
    CategoriesQueries.GET_ALL_CATEGORIES
  );

  if (loading) {
    return <Spinner />;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex justify-content-center">
        <AddOrUpdateCategoryModel />
      </div>
      <div className="row">
        {data.categories.map((category: any) => {
          return (
            <div key={category.id} className="col col-md-6 p-3">
              <CategoryCard category={category} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
