import {GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import {UUIDType} from "./uuid.js";
import {Context, memberTypeId} from "./common.js";
import {memberType} from "./memberType.js";

export const profile = new GraphQLObjectType<{ memberTypeId: string }, Context>({
    name: "Profile",
    fields: {
        id: { type: new GraphQLNonNull(UUIDType) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
        memberType: {
            type: memberType,
            resolve: async (profile, args, context) => {
                return context.db.memberType.findUnique({
                    where: {
                        id: profile.memberTypeId,
                    },
                });
            }
        },
    },
})

export const CreateProfileInput = new GraphQLInputObjectType({
    name: "CreateProfileInput",
    fields: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
        isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
        yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    }
})

export const ChangeProfileInput = new GraphQLInputObjectType({
    name: "ChangeProfileInput",
    fields: {
        memberTypeId: { type: memberTypeId },
        isMale: { type: GraphQLBoolean },
        yearOfBirth: { type: GraphQLInt },
    }
})