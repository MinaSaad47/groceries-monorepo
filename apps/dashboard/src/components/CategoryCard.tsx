import { useMutation } from "@apollo/client";
import { FaEdit, FaShoppingBasket, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Constants } from "../constants";
import { CategoriesMutations } from "../graphql/mutations/categories.mutations";
import { CategoriesQueries } from "../graphql/queries";

const CategoryCard = ({ category }: { category: any }) => {
  const navigate = useNavigate();
  const [deleteCategory] = useMutation(CategoriesMutations.DELETE_CATEGORY, {
    update: (cache) => {
      const { categories } = cache.readQuery({
        query: CategoriesQueries.GET_ALL_CATEGORIES,
      }) as any;
      cache.writeQuery({
        query: CategoriesQueries.GET_ALL_CATEGORIES,
        data: {
          categories: categories.filter((c: any) => c.id !== category.id),
        },
      });
    },
  });

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteCategory({ variables: { id: category.id } });
    }
  };

  return (
    <div className="card mb-3">
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={category.image ?? Constants.fallbackImage}
            className="img-fluid rounded-start"
            alt="category image"
          />
        </div>
        <div className="col-md-8 d-flex flex-column">
          <div className="card-body">
            <h5 className="card-title">{category.name}</h5>
          </div>
          <div className="card-footer  d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate(`/categories/${category.id}`)}>
              <FaShoppingBasket size={40} /> <div>View Items</div>
            </button>
            <div className="d-flex flex-column gap-2">
              <button type="button" className="btn btn-secondary">
                <FaEdit /> Edit
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}>
                <FaTrashAlt /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
