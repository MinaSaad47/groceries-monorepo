import { useMutation, useQuery } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaShoppingBasket, FaTrashAlt } from "react-icons/fa";
import { z } from "zod";
import { ItemsMutations } from "../graphql/mutations";
import { CategoriesQueries } from "../graphql/queries";
import Spinner from "./Spinner";

const InputSchema = z
  .object({
    details: z
      .array(
        z.object({
          name: z.string().min(1),
          lang: z.string().min(1).max(3),
          description: z.string().min(1),
        })
      )
      .nonempty()
      .superRefine((args, ctx) => {
        if (
          args.length > 0 &&
          args.findIndex(({ lang }) => lang === "en") < 0
        ) {
          ctx.addIssue({
            code: "custom",
            message: "At least one language must be English",
          });
        }
      }),
    price: z.number({ coerce: true }).min(1),
    offerPrice: z.number({ coerce: true }).min(0).optional(),
    qty: z.number({ coerce: true }).min(1),
    qtyType: z.string().min(1),
    categoryId: z
      .string()
      .uuid()
      .or(z.literal("").transform((_) => undefined)),
  })
  .partial();

type Input = z.infer<typeof InputSchema>;

const AddOrUpdateItemModal = ({ item }: any) => {
  const values = {
    ...item,
    categoryId: item?.category?.id ?? undefined,
  };
  const form = useForm<Input>({
    resolver: zodResolver(InputSchema),
    values,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const [updateItem, { loading }] = useMutation(
    ItemsMutations.ADD_OR_UPDATE_ITEM,
    {
      refetchQueries: "active",
    }
  );
  const { data, loading: categoryLoading } = useQuery(
    CategoriesQueries.GET_ALL_CATEGORIES
  );

  const onSubmit = async (data: Input) => {
    console.log(data);
    await updateItem({ variables: { id: item?.id, ...data } });
  };

  const renderFields = fields.map((field, index) => (
    <div
      className="position-relative mb-3 border d-flex flex-column gap-1 rounded p-2"
      key={field.id}>
      <div className="d-flex gap-3 ">
        <div className="w-25">
          <label htmlFor={`details.${index}.lang`} className="form-label">
            Lang
          </label>
          <input
            type="text"
            className="form-control"
            id={`details.${index}.lang`}
            {...form.register(`details.${index}.lang`)}
          />
          {form.formState.errors.details?.[index]?.lang?.message && (
            <div className="text-danger">
              {form.formState.errors.details?.[index]?.lang?.message}
            </div>
          )}
        </div>
        <div className="w-75">
          <label htmlFor={`details.${index}.name`} className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id={`details.${index}.name`}
            {...form.register(`details.${index}.name`)}
          />
          {form.formState.errors.details?.[index]?.name?.message && (
            <div className="text-danger">
              {form.formState.errors.details?.[index]?.name?.message}{" "}
            </div>
          )}
        </div>
      </div>
      <div>
        <label htmlFor={`details.${index}.description`} className="form-label">
          Description
        </label>
        <textarea
          className="form-control"
          id={`details.${index}.description`}
          {...form.register(`details.${index}.description`)}
        />
        {form.formState.errors.details?.[index]?.description?.message && (
          <div className="text-danger">
            {" "}
            {form.formState.errors.details?.[index]?.description?.message}{" "}
          </div>
        )}
      </div>
      <button
        type="button"
        className="position-absolute top-0 end-0  btn btn-danger"
        onClick={() => remove(index)}>
        <FaTrashAlt />{" "}
      </button>
    </div>
  ));

  const fieldsError = form.formState.errors.details?.root
    ? form.formState.errors.details.root.message
    : form.formState.errors.details?.message;

  return (
    <>
      <button
        type="button"
        className={`btn ${item?.id ? "btn-secondary" : "btn-primary btn-lg"} `}
        data-bs-toggle="modal"
        data-bs-target="#staticBackdrop">
        <div className="d-flex align-items-center justify-content-between gap-3">
          {item?.id ? (
            <>
              <FaEdit /> Edit Item
            </>
          ) : (
            <>
              <FaPlus className="me-3" /> Create Item
            </>
          )}
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
                  <div className="d-flex flex-column">
                    {fieldsError && (
                      <div className="text-danger">{fieldsError}</div>
                    )}
                    {renderFields}
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        append({ description: "", lang: "", name: "" })
                      }>
                      Add Translation
                    </button>
                  </div>
                  <hr className="border-secondary my-3" />
                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                    <select
                      className="form-select"
                      id="category"
                      {...form.register("categoryId")}>
                      <option value="">Select Category</option>
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

export default AddOrUpdateItemModal;
