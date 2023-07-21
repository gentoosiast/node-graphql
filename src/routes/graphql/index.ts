import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import DataLoader from 'dataloader';
import { schema } from './graphql-schema.js';
import {
  batchLoadMemberTypes,
  batchLoadPosts,
  batchLoadProfiles,
  batchLoadSubscribers,
  batchLoadSubscriptions,
} from './loaders.js';
import { MemberTypeType, Post, Profile, User } from './ts-types.js';

const GRAPHQL_QUERIES_DEPTH_LIMIT = 5;

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma, httpErrors } = fastify;

  const memberTypeLoader = new DataLoader<string, MemberTypeType>(async (memberTypeIds) =>
    batchLoadMemberTypes([...memberTypeIds], prisma),
  );

  const postLoader = new DataLoader<string, Post[]>(async (authorIds) =>
    batchLoadPosts([...authorIds], prisma),
  );

  const profileLoader = new DataLoader<string, Profile>(async (userIds) =>
    batchLoadProfiles([...userIds], prisma),
  );

  const subscribersLoader = new DataLoader<string, User[]>(async (userIds) =>
    batchLoadSubscribers([...userIds], prisma),
  );

  const subscriptionsLoader = new DataLoader<string, User[]>(async (userIds) =>
    batchLoadSubscriptions([...userIds], prisma),
  );

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
          memberTypeLoader,
          postLoader,
          profileLoader,
          subscribersLoader,
          subscriptionsLoader,
        },
        source: query,
        variableValues: variables,
      });

      return result;
    },
  });
};

export default plugin;
