import { gql } from "@apollo/client";

export abstract class UsersQueries {
  static GET_ALL_USERS = gql`
    query getAllUsers {
      users {
        id
        firstName
        lastName
        email
        profilePicture
        role
      }
    }
  `;
  static GET_ONE_USER = gql`
    query getOneUser($id: String!) {
      user(id: $id) {
        id
        firstName
        lastName
        email
        profilePicture
        phoneNumber
        role
        addresses {
          id
          buildingNumber
          apartmentNumber
          floorNumber
          lat
          lng
          isDefault
        }
      }
    }
  `;
}
