import { gql } from "@apollo/client";

export abstract class UsersMutations {
    static DELETE_USER = gql`
        mutation deleteUser($id: String!) {
            deleteUser(id: $id) {
                id
            }
        }`;
}
