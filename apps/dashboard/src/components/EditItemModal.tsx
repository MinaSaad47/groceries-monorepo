import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaEdit, FaShoppingBasket } from "react-icons/fa";
import { z } from "zod";
import { ItemsMutations } from "../graphql/mutations";
import { CategoriesQueries, ItemsQueries } from "../graphql/queries";
import Spinner from "./Spinner";

const InputSchema = z
  .object({
    name: z.string().trim().min(1),
    description: z.string().trim().min(1),
    price: z.number({ coerce: true }).min(1),
    offerPrice: z.number({ coerce: true }).min(0).optional(),
    qty: z.number({ coerce: true }).min(1),
    qtyType: z.string().min(1),
    categoryId: z.string().uuid().optional(),
  })
  .partial();

type Input = z.infer<typeof InputSchema>;

const EditItemModal = ({ item }: { item: any }) => {
  const values = {
    ...item,
    categoryId: item.category?.id ?? undefined,
  };
  const form = useForm<Input>({
    resolver: zodResolver(InputSchema),
    values,
  });
  const [updateItem, { loading }] = useMutation(ItemsMutations.UPDATE_ITEM, {
    refetchQueries: [ItemsQueries.GET_ALL_ITEMS],
    update: (cache, { data }) => {
      console.log(data);
      cache.writeQuery({
        query: ItemsQueries.GET_ONE_ITEM,
        variables: {
          id: data.updateItem.id
        },
        data: {
          item: data.updateItem,
        },
      });
    },
  });
  const { data, loading: categoryLoading } = useQuery(
    CategoriesQueries.GET_ALL_CATEGORIES
  );

  const onSubmit = async (data: Input) => {
    console.log(data);
    await updateItem({ variables: { id: item.id, ...data } });
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#staticBackdrop">
        <div className="d-flex align-items-center justify-content-between gap-3">
          <FaEdit /> Edit Item
        </div>
      </button>

      {!categoryLoading && (
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
                  Create Item Form
                </div>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <form onSubmit={form.handleSubmit(onSubmit)} className="row">
                  <div className="col-6 mb-3">
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
                  <div className="mb-3 col-6">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      {...form.register("categoryId")}>
                      {data?.categories?.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.categoryId && (
                      <p className="text-danger">
                        {form.formState.errors.categoryId.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows={3}
                      {...form.register("description")}
                    />
                    {form.formState.errors.description && (
                      <p className="text-danger">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-3 col-6">
                    <label htmlFor="price" className="form-label">
                      Price
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="price"
                      {...form.register("price")}
                    />
                    {form.formState.errors.price && (
                      <p className="text-danger">
                        {form.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-3 col-6">
                    <label htmlFor="offerPrice" className="form-label">
                      Offer Price
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="offerPrice"
                      {...form.register("offerPrice")}
                    />
                    {form.formState.errors.offerPrice && (
                      <p className="text-danger">
                        {form.formState.errors.offerPrice.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-3 col-6">
                    <label htmlFor="quantity" className="form-label">
                      Quantity
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="quantity"
                      {...form.register("qty")}
                    />
                    {form.formState.errors.qty && (
                      <p className="text-danger">
                        {form.formState.errors.qty.message}
                      </p>
                    )}
                  </div>

                  <div className="mb-3 col-6">
                    <label htmlFor="quantityType" className="form-label">
                      Quantity Type
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="quantityType"
                      {...form.register("qtyType")}
                    />
                    {form.formState.errors.qtyType && (
                      <p className="text-danger">
                        {form.formState.errors.qtyType.message}
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
      )}
    </>
  );
};

export default EditItemModal;
