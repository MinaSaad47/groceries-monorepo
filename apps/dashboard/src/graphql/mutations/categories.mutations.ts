import { gql } from "@apollo/client";

export abstract class CategoriesMutations {
  static ADD_CATEGORY = gql`
    mutation addCategory($name: String!) {
      addCategory(name: $name) {
        id
        details {
          name
          lang
        }
        image
      }
    }
  `;

  static DELETE_CATEGORY = gql`
    mutation deleteCategory($id: String!) {
      deleteCategory(id: $id) {
        id
      }
    }
  `;
}
