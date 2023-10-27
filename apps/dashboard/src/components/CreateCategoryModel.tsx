import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaPlusSquare, FaShoppingBasket } from "react-icons/fa";
import { z } from "zod";
import { CategoriesMutations } from "../graphql/mutations/categories.mutations";
import { CategoriesQueries } from "../graphql/queries";
import Spinner from "./Spinner";

const InputSchema = z.object({
  name: z.string().trim().min(1),
});
type Input = z.infer<typeof InputSchema>;

const CreateCategoryModel = () => {
  const form = useForm<Input>({ resolver: zodResolver(InputSchema) });

  const [addCategory, { loading }] = useMutation(
    CategoriesMutations.ADD_CATEGORY,
    {
      update: (cache, { data }) => {
        if (data?.addCategory) {
          const { categories }: any = cache.readQuery({
            query: CategoriesQueries.GET_ALL_CATEGORIES,
          });
          cache.writeQuery({
            query: CategoriesQueries.GET_ALL_CATEGORIES,
            data: {
              categories: [...categories, data.addCategory],
            },
          });
        }
      },
    }
  );

  const onSubmit = async (data: Input) => {
    await addCategory({ variables: data });
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary d-inline-block fit-content"
        data-bs-toggle="modal"
        data-bs-target="#staticBackdrop">
        <div className="d-flex align-items-center justify-content-center gap-3">
          <FaPlusSquare size={30} /> Create Item
        </div>
      </button>

      <div
        className="modal fade"
        id="staticBackdrop"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        aria-labelledby="staticBackdropLabel"
        aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title fs-5" id="staticBackdropLabel">
                <FaShoppingBasket className="me-3" size={30} />
                Create Category Form
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && (
                    <p className="text-danger">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal">
                    Close
                  </button>
                  {loading ? (
                    <Spinner />
                  ) : (
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCategoryModel;
