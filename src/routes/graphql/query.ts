import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import {Context, memberTypeId} from "./types/common.js";
import {memberType} from "./types/memberType.js";
import {post} from "./types/post.js";
import {UUIDType} from "./types/uuid.js";
import {user} from "./types/user.js";
import {profile} from "./types/profile.js";

export const queryType = new GraphQLObjectType<unknown, Context>({
    name: "Query",
    fields: {
        memberTypes: {
            type: new GraphQLList(memberType),
            resolve: async (source, args, context) => {
                return context.db.memberType.findMany();
            }
        },
        memberType: {
            type: memberType,
            args: {
                id: { type: new GraphQLNonNull(memberTypeId) }
            },
            resolve: async (source, args: { id: string }, context) => {
                return context.db.memberType.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        posts: {
            type: new GraphQLList(post),
            resolve: async (source, args, context) => {
                return context.db.post.findMany();
            }
        },
        post: {
            type: post,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) }
            },
            resolve: async (source, args: { id: string }, context) => {
                return context.db.post.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        users: {
            type: new GraphQLList(user),
            resolve: async (source, args, context) => {
                return context.db.user.findMany();
            }
        },
        user: {
            type: user,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) }
            },
            resolve: async (source, args: { id: string }, context) => {
                return context.db.user.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
        profiles: {
            type: new GraphQLList(profile),
            resolve: async (source, args, context: Context) => {
                return context.db.profile.findMany();
            }
        },
        profile: {
            type: profile,
            args: {
                id: { type: new GraphQLNonNull(UUIDType) }
            },
            resolve: async (source, args: { id: string }, context: Context) => {
                return context.db.profile.findUnique({
                    where: {
                        id: args.id,
                    },
                });
            }
        },
    },
})