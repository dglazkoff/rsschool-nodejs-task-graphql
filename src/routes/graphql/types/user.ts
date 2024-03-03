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
import DataLoader from "dataloader";

export const user: GraphQLObjectType = new GraphQLObjectType<{ id: string }, Context>({
    name: "User",
    fields: () => ({
        id: { type: new GraphQLNonNull(UUIDType) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        balance: { type: new GraphQLNonNull(GraphQLFloat) },
        profile: {
            type: profile,
            resolve: async (user, args, context) => {
                const { dataloaders } = context;
                let dl = dataloaders.get(`profiles`);

                if (!dl) {
                    dl = new DataLoader(async (userIds: readonly string[]  ) => {
                        const profiles = await context.db.profile.findMany({
                            where: {
                                userId: {
                                    in: [...userIds],
                                },
                            }
                        });

                        return userIds.map(id => profiles.find(x => x.userId === id));
                    });

                    dataloaders.set(`profiles`, dl);
                }

                return dl.load(user.id);
            },
        },
        posts: {
            type: new GraphQLList(post),
            resolve: async (user, args, context) => {
                const { dataloaders } = context;

                let dl = dataloaders.get(`posts`);

                if (!dl) {
                    dl = new DataLoader(async (userIds: readonly string[]  ) => {
                        const posts = await context.db.post.findMany({
                            where: {
                                authorId: {
                                    in: [...userIds],
                                },
                            }
                        });

                        return userIds.map(id => posts.filter(x => x.authorId === id));
                    });

                    dataloaders.set(`posts`, dl);
                }

                return dl.load(user.id);
            }},
        subscribedToUser: {
            type: new GraphQLList(user),
            resolve: async (user, args, context) => {
                const { dataloaders } = context;
                let dl = dataloaders.get(`subscribedToUser`);

                if (!dl) {
                    dl = new DataLoader(async (userIds: readonly string[]  ) => {
                        const users = await context.db.user.findMany({
                            where: {
                                userSubscribedTo: {
                                    some: {
                                        authorId: {
                                            in: [...userIds],
                                        },
                                    },
                                },
                            },
                            include: {
                                userSubscribedTo: true,
                            }
                        });

                        return userIds.map(id => users.filter(user => user.userSubscribedTo.some(({ authorId }) => authorId === id)));
                    });
                    dataloaders.set(`subscribedToUser`, dl);
                }

                return dl.load(user.id);
            }
        },
        userSubscribedTo: {
            type: new GraphQLList(user),
            resolve: async (user, args, context) => {
                const { dataloaders } = context;
                let dl = dataloaders.get(`userSubscribedTo`);

                if (!dl) {
                    dl = new DataLoader(async (userIds: readonly string[]  ) => {
                        const users = await context.db.user.findMany({
                            where: {
                                subscribedToUser: {
                                    some: {
                                        subscriberId: {
                                            in: [...userIds],
                                        },
                                    },
                                },
                            },
                            include: {
                                subscribedToUser: true,
                            }
                        });

                        return userIds.map(id => users.filter(user => user.subscribedToUser.some(({ subscriberId }) => subscriberId === id)));
                    });

                    dataloaders.set(`userSubscribedTo`, dl);
                }


                return dl.load(user.id);
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