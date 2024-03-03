import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLString, GraphQLBoolean, GraphQLFloat, GraphQLInputObjectType, validate, parse
} from 'graphql';
import {UUIDType} from "./types/uuid.js";
import {PrismaClient} from "@prisma/client";
import {GraphQLEnumType} from "graphql/type/index.js";
import {MemberTypeId} from "../member-types/schemas.js";
import {changePostByIdSchema, createPostSchema} from "../posts/schemas.js";
import {changeUserByIdSchema, createUserSchema} from "../users/schemas.js";
import {changeProfileByIdSchema, createProfileSchema} from "../profiles/schemas.js";
import { Static } from '@fastify/type-provider-typebox';
import depthLimit from 'graphql-depth-limit'

type Context = {
  db: PrismaClient;
}

const memberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    [MemberTypeId.BASIC]: {
      value: MemberTypeId.BASIC,
    },
    [MemberTypeId.BUSINESS]: {
      value: MemberTypeId.BUSINESS,
    },
  },
});

const memberType = new GraphQLObjectType({
  name: "Member_Type",
  fields: {
    id: { type: new GraphQLNonNull(memberTypeId) },
    discount: { type: new GraphQLNonNull(GraphQLFloat) },
    postsLimitPerMonth: { type: new GraphQLNonNull(GraphQLInt) },
  },
})

const post = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  },
})

const profile = new GraphQLObjectType<{ memberTypeId: string }, Context>({
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

const user: GraphQLObjectType = new GraphQLObjectType<{ id: string }, Context>({
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

const queryType = new GraphQLObjectType<unknown, Context>({
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

const CreatePostInput = new GraphQLInputObjectType({
  name: "CreatePostInput",
  fields: {
    authorId: { type: new GraphQLNonNull(UUIDType) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }
})

const ChangePostInput = new GraphQLInputObjectType({
  name: "ChangePostInput",
  fields: {
    title: { type: GraphQLString },
    content: { type: GraphQLString },
  }
})

const CreateUserInput = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }
})

const ChangeUserInput = new GraphQLInputObjectType({
  name: "ChangeUserInput",
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }
})

const CreateProfileInput = new GraphQLInputObjectType({
  name: "CreateProfileInput",
  fields: {
    userId: { type: new GraphQLNonNull(UUIDType) },
    memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  }
})

const ChangeProfileInput = new GraphQLInputObjectType({
  name: "ChangeProfileInput",
  fields: {
    memberTypeId: { type: memberTypeId },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  }
})

const mutationType = new GraphQLObjectType<unknown, Context>({
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

const schema = new GraphQLSchema({ query: queryType, mutation: mutationType })

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);

      if (errors.length > 0) {
        return {
          errors: errors.map((error) => ({
            message: error.message,
          })),
        };
      }

      const response = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: {
          db: prisma,
        }
      });
      // console.log(response);
      return response;
    },
  });
};

export default plugin;
