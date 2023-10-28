import { useApolloClient, useMutation } from "@apollo/client";
import axios from "axios";
import { useState } from "react";
import {
  FaBalanceScale,
  FaMoneyBill,
  FaShoppingBasket,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Constants } from "../constants";
import { ItemsMutations } from "../graphql/mutations";
import { ItemsQueries } from "../graphql/queries";
import ImageChooser from "./ImageChooser";
import Spinner from "./Spinner";
import AddOrUpdateItemModal from "./ِAddOrUpdateItemModal";

const ItemInfo = ({ item }: { item: any }) => {
  const navigate = useNavigate();
  const [deleteItem] = useMutation(ItemsMutations.DELETE_ITEM, {
    refetchQueries: [ItemsQueries.GET_ALL_ITEMS],
  });
  const client = useApolloClient();
  const [uploaddingThumbnail, setUploaddingThumbnail] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem({ variables: { id: item.id } });
      navigate(-1);
    }
  };

  const handleImageUpload = async (image: File) => {
    const formData = new FormData();
    formData.append("thumbnail", image);
    setUploaddingThumbnail(true);
    const response = await axios.post(
      `/api/v1/items/${item.id}/thumbnail`,
      formData
    );
    if (response.data.code === 200) {
      await client.refetchQueries({ include: "active" });
      setUploaddingThumbnail(false);
    }
  };

  return (
    <div className="card p-0">
      <div className="row g-0">
        <div className="col-md-4 d-flex flex-column justify-content-center">
          {uploaddingThumbnail ? (
            <Spinner />
          ) : (
            <ImageChooser
              src={item.thumbnail ?? Constants.fallbackImage}
              alt={"user thumbnail"}
              onChange={handleImageUpload}
            />
          )}
        </div>
        <div className="col-md-8 d-flex flex-column">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div className="d-flex flex-column">
              <h3 className="m-0">{item.name}</h3>
              <small className="text-secondary">{item.id}</small>
            </div>
            <div className="d-flex flex-column gap-2">
              <AddOrUpdateItemModal item={item} />
              <button className="btn btn-danger btn" onClick={handleDelete}>
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <FaTrash /> Delete
                </div>
              </button>
            </div>
          </div>
          <div className="card-body d-flex flex-column gap-4">
            <ul className="list-group">
              <li className="list-group-item d-flex align-items-center gap-3">
                <FaMoneyBill />{" "}
                <span
                  className={
                    item.offerPrice > 0
                      ? "text-decoration-line-through text-secondary"
                      : ""
                  }>
                  {item.price} EG
                </span>
                {item.offerPrice > 0 && <span>{item.offerPrice} EG</span>}
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <FaShoppingBasket /> {item.qty}{" "}
                <span className="text-secondary">In Stock</span>
              </li>
              <li className="list-group-item d-flex align-items-center gap-3">
                <FaBalanceScale /> {item.qtyType}
              </li>
            </ul>
            {item.category?.name && (
              <div className="d-flex rounded border-end border-start p-2 my-3 w-50 mx-auto  justify-content-center align-items-baseline gap-2">
                <div className="text-primary-emphasis">Category</div>
                <strong className="text-secondary-emphasis">Of</strong>
                <div className="text-primary-emphasis">
                  {item.category?.name}
                </div>
              </div>
            )}
            <div className="border-top border-bottom rounded p-2">
              {item.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemInfo;
