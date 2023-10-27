import { useApolloClient, useQuery } from "@apollo/client";
import axios from "axios";
import { useState } from "react";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import ItemImages from "../components/ItemImages";
import ItemInfo from "../components/ItemInfo";
import Spinner from "../components/Spinner";
import { ItemsQueries } from "../graphql/queries/items.queries";

const Item = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = useApolloClient();
  const [imageUploading, setImageUploading] = useState(false);

  const { data, loading, error } = useQuery(ItemsQueries.GET_ONE_ITEM, {
    variables: {
      id,
    },
  });

  const handleImageUpload = async (e: any) => {
    const image = e.target.files[0];
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);
    setImageUploading(true);
    const response = await axios.post(
      `/api/v1/items/${item.id}/image`,
      formData
    );
    if (response.data.code === 201) {
      await client.refetchQueries({ include: "active" });
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
          <Spinner />
    );
  } else if (error) {
    return <div>Error: {error.message}</div>;
  }

  const item = data.item;

  return (
    <div className="my-4 container accordion" id="itemAccordion">
      <button
        className="btn btn-outline-primary m-3 fixed-bottom"
        onClick={() => navigate(-1)}>
        <FaArrowLeft /> Return to all items
      </button>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseOne"
            aria-expanded="true"
            aria-controls="panelsStayOpen-collapseOne">
            Item Info
          </button>
        </h2>
      </div>

      <div
        id="panelsStayOpen-collapseOne"
        className="accordion-collapse collapse show">
        <div className="accordion-body">
          <ItemInfo item={item} />
        </div>
      </div>

      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#panelsStayOpen-collapseTwo"
            aria-expanded="true"
            aria-controls="panelsStayOpen-collapseTwo">
            Images
          </button>
        </h2>
      </div>

      <div
        id="panelsStayOpen-collapseTwo"
        className="accordion-collapse collapse show">
        <div className="accordion-body">
          {imageUploading ? (
            <Spinner />
          ) : (
            <>
              <div className=" d-flex flex-column align-items-center justify-content-center">
                <label
                  htmlFor="add-image"
                  className="btn btn-outline-secondary">
                  <FaUpload /> Add Image
                </label>
              </div>
              <input
                type="file"
                id="add-image"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </>
          )}
          <ItemImages item={item} />
        </div>
      </div>
    </div>
  );
};

export default Item;
