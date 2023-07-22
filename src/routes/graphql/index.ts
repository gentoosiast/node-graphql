import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './graphql-schema.js';
import {
  createMemberTypeLoader,
  createPostLoader,
  createProfileLoader,
  createUserLoader,
} from './loaders.js';

const GRAPHQL_QUERIES_DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

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
      const { query, variables } = req.body;
      const documentNode = parse(query);
      const validationErrors = validate(schema, documentNode, [
        depthLimit(GRAPHQL_QUERIES_DEPTH_LIMIT),
      ]);

      if (validationErrors.length > 0) {
        return { data: null, errors: validationErrors };
      }

      const result = await graphql({
        schema,
        contextValue: {
          prisma,
          httpErrors,
          memberTypeLoader: createMemberTypeLoader(prisma),
          postLoader: createPostLoader(prisma),
          profileLoader: createProfileLoader(prisma),
          userLoader: createUserLoader(prisma),
        },
        source: query,
        variableValues: variables,
      });

      return result;
    },
  });
};

export default plugin;
