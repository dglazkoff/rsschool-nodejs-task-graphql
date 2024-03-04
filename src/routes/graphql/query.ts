import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from "graphql/index.js";
import {Context, memberTypeId} from "./types/common.js";
import {memberType} from "./types/memberType.js";
import {post} from "./types/post.js";
import {UUIDType} from "./types/uuid.js";
import {user} from "./types/user.js";
import {profile} from "./types/profile.js";
import DataLoader from "dataloader";
import {parseResolveInfo} from "graphql-parse-resolve-info";

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
            resolve: async (source, args, context, info) => {
                const withUserSubscribedTo: boolean = 'userSubscribedTo' in (parseResolveInfo(info)?.fieldsByTypeName.User ?? {});
                const withSubscribedToUser: boolean = 'subscribedToUser' in (parseResolveInfo(info)?.fieldsByTypeName.User ?? {});
                const { dataloaders } = context;
                let dlSubscribedToUser = dataloaders.get(`subscribedToUser`);
                let dlUserSubscribedTo = dataloaders.get(`userSubscribedTo`);

                const users = await context.db.user.findMany({
                    include: {
                        userSubscribedTo: withUserSubscribedTo,
                        subscribedToUser: withSubscribedToUser,
                    }
                });

                if (!dlSubscribedToUser) {
                    dlSubscribedToUser = new DataLoader(async (userIds: readonly string[]  ) => {
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
                    dataloaders.set(`subscribedToUser`, dlSubscribedToUser);
                }

                if (withSubscribedToUser) {
                    users.forEach(user => {
                        dlSubscribedToUser!.prime(
                            user.id,
                            users.filter((item) => user.subscribedToUser.find(({ subscriberId }) => subscriberId === item.id)
                        ));
                    });
                }

                if (!dlUserSubscribedTo) {
                    dlUserSubscribedTo = new DataLoader(async (userIds: readonly string[]) => {
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

                        return userIds.map(id => users.filter(user => user.subscribedToUser.some(({subscriberId}) => subscriberId === id)));
                    });
                    dataloaders.set(`userSubscribedTo`, dlUserSubscribedTo);
                }

                if (withUserSubscribedTo) {
                    users.forEach(user => {
                        dlUserSubscribedTo!.prime(
                            user.id,
                            users.filter((item) => user.userSubscribedTo.find(({authorId}) => authorId === item.id)
                        ));
                    });
                }

                return users
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