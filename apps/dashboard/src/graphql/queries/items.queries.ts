import { gql } from "@apollo/client";

export abstract class ItemsQueries {
  static GET_ALL_ITEMS = gql`
    query getAllItems {
      items {
        id
        name
        description
        details {
          name
          description
          lang
        }
        price
        offerPrice
        images
        thumbnail
        qty
        qtyType
      }
    }
  `;

  static GET_ONE_ITEM = gql`
    query getOneItem($id: String!) {
      item(id: $id) {
        id
        details {
          name
          description
          lang
        }
        category {
          id
          name
          image
        }
        name
        description
        price
        offerPrice
        images
        thumbnail
        qty
        qtyType
      }
    }
  `;
}
