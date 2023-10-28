import { useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { FaEdit, FaPlus, FaShoppingBasket, FaTrashAlt } from "react-icons/fa";
import { z } from "zod";
import { CategoriesMutations } from "../graphql/mutations/categories.mutations";
import Spinner from "./Spinner";

const InputSchema = z.object({
  details: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        lang: z.string().trim().min(1).max(3),
      })
    )
    .nonempty()
    .superRefine((args, ctx) => {
      if (args.length > 0 && args.findIndex(({ lang }) => lang === "en") < 0) {
        ctx.addIssue({
          code: "custom",
          message: "At least one language must be English",
        });
      }
    }),
});

type Input = z.infer<typeof InputSchema>;

const AddOrUpdateCategoryModel = ({ category }: any) => {
  const form = useForm<Input>({
    resolver: zodResolver(InputSchema),
    values: category,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const [addCategory, { loading }] = useMutation(
    CategoriesMutations.ADD_OR_UPDATE_CATEGORY,
    {
      refetchQueries: "active",
    }
  );

  const onSubmit = async (data: Input) => {
    console.log("stuf");
    await addCategory({ variables: { id: category?.id, ...data } });
  };

  const fieldsError = form.formState.errors.details?.root
    ? form.formState.errors.details.root.message
    : form.formState.errors.details?.message;

  const renderFields = fields.map((field, index) => (
    <div className="mb-3 d-flex gap-3" key={field.id}>
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
            {form.formState.errors.details?.[index]?.name?.message}
          </div>
        )}
      </div>
      <button
        type="button"
        className="btn btn-danger"
        onClick={() => remove(index)}>
        <FaTrashAlt />
      </button>
    </div>
  ));

  const modalId =
    (category?.id && `editCategoryModal${category.id}`) || "addCategoryModal";

  return (
    <>
      <button
        type="button"
        className={`btn ${
          category?.id ? "btn-secondary" : "btn-primary btn-lg"
        } d-inline-block fit-content`}
        data-bs-toggle="modal"
        data-bs-target={`#${modalId}`}>
        <div className="d-flex align-items-center justify-content-center gap-3">
          {category?.id ? <FaEdit /> : <FaPlus />}
          <div>{category?.id ? "Edit" : "Add"} Category</div>
        </div>
      </button>

      <div
        className="modal fade"
        id={modalId}
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        aria-labelledby={modalId}
        aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title fs-5" id={modalId}>
                <FaShoppingBasket className="me-3" size={30} />
                Category Form
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="d-flex flex-column">
                {fieldsError && (
                  <div className="text-danger">{fieldsError}</div>
                )}
                {renderFields}
                <button
                  type="button"
                  onClick={() => append({ lang: " ", name: " " })}
                  className="btn btn-primary">
                  Add Translation
                </button>
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

export default AddOrUpdateCategoryModel;
