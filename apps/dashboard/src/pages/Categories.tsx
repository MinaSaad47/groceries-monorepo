import { useQuery } from "@apollo/client";
import CategoryCard from "../components/CategoryCard";
import CreateCategoryModel from "../components/CreateCategoryModel";
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
        <CreateCategoryModel />
      </div>
      <div className="row">
        {data.categories.map((category: any) => {
          return (
            <div className="col col-md-6 p-3">
              <CategoryCard key={category.id} category={category} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Categories;
