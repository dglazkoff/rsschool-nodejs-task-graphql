import {
    GraphQLFloat,
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} from "graphql/index.js";
import {UUIDType} from "./uuid.js";
import {post} from "./post.js";
import {Context} from "./common.js";
import {profile} from "./profile.js";

export const user: GraphQLObjectType = new GraphQLObjectType<{ id: string }, Context>({
    name: "User",
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: {
            type: profile,
            resolve: async (user, args, context) => {
                return context.db.profile.findUnique({
                    where: {
                        userId: user.id,
                    },
                })
            },
        },
        posts: {
            type: new GraphQLList(post),
            resolve: async (user, args, context) => {
                return context.db.post.findMany({
                    where: {
                        authorId: user.id,
                    },
                });
            }},
        userSubscribedTo: {
            type: new GraphQLList(user),
            resolve: async (user, args, context) => {
                return context.db.user.findMany({
                    where: {
                        subscribedToUser: {
                            some: {
                                subscriberId: user.id,
                            },
                        },
                    },
                });
            }
        },
        subscribedToUser: {
            type: new GraphQLList(user),
            resolve: async (user, args, context) => {
                return context.db.user.findMany({
                    where: {
                        userSubscribedTo: {
                            some: {
                                authorId: user.id,
                            },
                        },
                    },
                });
            }
        }
    })
})

export const CreateUserInput = new GraphQLInputObjectType({
    name: "CreateUserInput",
    fields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
    }
})

export const ChangeUserInput = new GraphQLInputObjectType({
    name: "ChangeUserInput",
    fields: {
        name: { type: GraphQLString },
        balance: { type: GraphQLFloat },
    }
})