import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import {
  graphql,
  GraphQLSchema,
  validate, parse
} from 'graphql';
import depthLimit from 'graphql-depth-limit'
import {mutationType} from "./mutation.js";
import {queryType} from "./query.js";

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
          dataloaders: new Map(),
        }
      });
      // console.log(response);
      return response;
    },
  });
};

export default plugin;
