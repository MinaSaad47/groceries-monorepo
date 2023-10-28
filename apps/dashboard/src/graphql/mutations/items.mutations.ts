import { gql } from "@apollo/client";

export abstract class ItemsMutations {
  static ADD_OR_UPDATE_ITEM = gql`
    mutation addOrUpdateItem(
      $id: String
      $details: [ItemTransInputType]!
      $price: Float!
      $offerPrice: Float
      $qty: Int!
      $qtyType: String!
      $categoryId: String
    ) {
      addOrUpdateItem(
        id: $id
        details: $details
        price: $price
        offerPrice: $offerPrice
        qty: $qty
        qtyType: $qtyType
        categoryId: $categoryId
      ) {
        id
      }
    }
  `;

  static UPDATE_ITEM = gql`
    mutation updateItem(
      $id: String!
      $name: String!
      $description: String!
      $price: Float!
      $offerPrice: Float!
      $qty: Int!
      $qtyType: String!
      $categoryId: String!
    ) {
      updateItem(
        id: $id
        name: $name
        description: $description
        price: $price
        offerPrice: $offerPrice
        qty: $qty
        qtyType: $qtyType
        categoryId: $categoryId
      ) {
        id
        details {
          name
          description
          lang
        }
        name
        description
        price
        offerPrice
        qty
        qtyType
        images
        thumbnail
        category {
          id
          name
          image
        }
      }
    }
  `;

  static DELETE_ITEM = gql`
    mutation deleteItem($id: String!) {
      deleteItem(id: $id) {
        id
      }
    }
  `;
}
