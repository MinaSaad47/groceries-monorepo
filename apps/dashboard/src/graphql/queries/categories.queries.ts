import { gql } from "@apollo/client";

export abstract class CategoriesQueries {
  static GET_ALL_CATEGORIES = gql`
    query {
      categories {
        id
        name
        details {
          name
          lang
        }
        image
      }
    }
  `;
}
