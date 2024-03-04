import {
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLObjectType,
} from "graphql/index.js";
import {Static} from "@fastify/type-provider-typebox";
import {changePostByIdSchema, createPostSchema} from "../posts/schemas.js";
import {UUIDType} from "./types/uuid.js";
import {changeUserByIdSchema, createUserSchema} from "../users/schemas.js";
import {changeProfileByIdSchema, createProfileSchema} from "../profiles/schemas.js";
import {Context} from "./types/common.js";
import {ChangePostInput, CreatePostInput, post} from "./types/post.js";
import {ChangeUserInput, CreateUserInput, user} from "./types/user.js";
import {ChangeProfileInput, CreateProfileInput, profile} from "./types/profile.js";

export const mutationType = new GraphQLObjectType<unknown, Context>({
    name: "Mutation",
    fields: {
        createPost: {
            type: post,
            args: {
                dto: {type: new GraphQLNonNull(CreatePostInput)}
            },
            resolve: async (source, args: { dto: Static<(typeof createPostSchema)['body']> }, context) => {
                return context.db.post.create({
                    data: args.dto,
                });
            }
        },
        changePost: {
            type: post,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)},
                dto: {type: new GraphQLNonNull(ChangePostInput)}
            },
            resolve: async (source, args: { id: string, dto: Static<(typeof changePostByIdSchema)['body']> }, context) => {
                return context.db.post.update({
                    where: {id: args.id},
                    data: args.dto,
                });
            }
        },
        deletePost: {
            type: GraphQLBoolean,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (source, args: { id: string }, context) => {
                await context.db.post.delete({
                    where: {
                        id: args.id,
                    },
                });

                return true;
            },
        },
        createUser: {
            type: user,
            args: {
                dto: {type: new GraphQLNonNull(CreateUserInput)}
            },
            resolve: async (source, args: { dto: Static<(typeof createUserSchema)['body']> }, context) => {
                return context.db.user.create({
                    data: args.dto,
                });
            }
        },
        changeUser: {
            type: user,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)},
                dto: {type: new GraphQLNonNull(ChangeUserInput)}
            },
            resolve: async (source, args: { id: string, dto: Static<(typeof changeUserByIdSchema)['body']> }, context) => {
                return context.db.user.update({
                    where: {id: args.id},
                    data: args.dto,
                });
            }
        },
        deleteUser: {
            type: GraphQLBoolean,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (source, args: { id: string }, context) => {
                await context.db.user.delete({
                    where: {
                        id: args.id,
                    },
                });

                return true;
            },
        },
        createProfile: {
            type: profile,
            args: {
                dto: {type: new GraphQLNonNull(CreateProfileInput)}
            },
            resolve: async (source, args: { dto: Static<(typeof createProfileSchema)['body']> }, context) => {
                return context.db.profile.create({
                    data: args.dto,
                });
            }
        },
        changeProfile: {
            type: profile,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)},
                dto: {type: new GraphQLNonNull(ChangeProfileInput)}
            },
            resolve: async (source, args: { id: string, dto: Static<(typeof changeProfileByIdSchema)['body']> }, context) => {
                return context.db.profile.update({
                    where: {id: args.id},
                    data: args.dto,
                });
            }
        },
        deleteProfile: {
            type: GraphQLBoolean,
            args: {
                id: {type: new GraphQLNonNull(UUIDType)}
            },
            resolve: async (source, args: { id: string }, context) => {
                await context.db.profile.delete({
                    where: {
                        id: args.id,
                    },
                });

                return true;
            },
        },
        subscribeTo: {
            type: user,
            args: {
                userId: {type: new GraphQLNonNull(UUIDType)},
                authorId: {type: new GraphQLNonNull(UUIDType)},
            },
            resolve: async (source, args: { userId: string, authorId: string }, context) => {
                return context.db.user.update({
                    where: {
                        id: args.userId,
                    },
                    data: {
                        userSubscribedTo: {
                            create: {
                                authorId: args.authorId,
                            },
                        },
                    },
                });
            }
        },
        unsubscribeFrom: {
            type: GraphQLBoolean,
            args: {
                userId: {type: new GraphQLNonNull(UUIDType)},
                authorId: {type: new GraphQLNonNull(UUIDType)},
            },
            resolve: async (source, args: { userId: string, authorId: string }, context) => {
                await context.db.subscribersOnAuthors.delete({
                    where: {
                        subscriberId_authorId: {
                            subscriberId: args.userId,
                            authorId: args.authorId,
                        },
                    },
                });

                return true;
            }
        }
    }
});