import { gql } from "@apollo/client";

export abstract class CategoriesMutations {
  static ADD_OR_UPDATE_CATEGORY = gql`
    mutation addOrUpdateCategory(
      $id: String
      $details: [CategoryTransInputType]!
    ) {
      addOrUpdateCategory(id: $id, details: $details) {
        id
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
