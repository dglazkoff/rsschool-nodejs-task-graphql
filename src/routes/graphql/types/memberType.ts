import {GraphQLFloat, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import {memberTypeId} from "./common.js";

export const memberType = new GraphQLObjectType({
    name: "Member_Type",
    fields: {
        id: { type: new GraphQLNonNull(memberTypeId) },
        discount: { type: new GraphQLNonNull(GraphQLFloat) },
        postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
    },
})