import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLList,
  GraphQLInputObjectType,
} from 'graphql';
import DataLoader from 'dataloader';
import { ResolverContext } from '../ts-types.js';
import { UUIDType } from './uuid.js';
import { ProfileType } from './profiles.js';
import { PostType } from './posts.js';
import { PrismaClient } from '@prisma/client';

interface SourceProps {
  id: string;
}

type Post = {
  id: string;
  title: string;
  content: string;
};

type Profile = {
  id: string;
  isMale: boolean;
  yearOfBirth: number;
};

type User = {
  id: string;
  name: string;
  balance: number;
};

async function batchLoadPosts(
  authorIds: string[],
  prisma: PrismaClient,
): Promise<Post[][]> {
  const posts = await prisma.post.findMany({ where: { authorId: { in: authorIds } } });

  const postsByAuthorMap: { [authorId: string]: Post[] } = {};

  posts.forEach((post) => {
    if (!postsByAuthorMap[post.authorId]) {
      postsByAuthorMap[post.authorId] = [];
    }
    postsByAuthorMap[post.authorId].push(post);
  });

  return authorIds.map((authorId) => postsByAuthorMap[authorId] || []);
}

let postLoader: DataLoader<string, Post[]>;

async function batchLoadProfiles(
  userIds: string[],
  prisma: PrismaClient,
): Promise<Profile[]> {
  const profiles = await prisma.profile.findMany({
    where: { userId: { in: userIds } },
  });

  const profilesMap: { [id: string]: Profile } = {};
  profiles.forEach((profile) => {
    profilesMap[profile.userId] = profile;
  });

  return userIds.map((id) => profilesMap[id]);
}

let profileLoader: DataLoader<string, Profile>;

async function batchLoadSubscribers(
  authorIds: string[],
  prisma: PrismaClient,
): Promise<User[][]> {
  const users = await prisma.user.findMany({
    where: { userSubscribedTo: { some: { authorId: { in: authorIds } } } },
    include: { userSubscribedTo: true },
  });

  const usersMap: { [id: string]: User[] } = {};

  users.forEach((user) => {
    user.userSubscribedTo.forEach((userSubscribedTo) => {
      if (!usersMap[userSubscribedTo.authorId]) {
        usersMap[userSubscribedTo.authorId] = [];
      }
      usersMap[userSubscribedTo.authorId].push(user);
    });
  });

  return authorIds.map((authorId) => usersMap[authorId] ?? []);
}

let subscribersLoader: DataLoader<string, User[]>;

async function batchLoadSubscriptions(
  subscriberIds: string[],
  prisma: PrismaClient,
): Promise<User[][]> {
  const users = await prisma.user.findMany({
    where: { subscribedToUser: { some: { subscriberId: { in: subscriberIds } } } },
    include: { subscribedToUser: true },
  });

  const usersMap: { [id: string]: User[] } = {};

  users.forEach((user) => {
    user.subscribedToUser.forEach((subscribedToUser) => {
      if (!usersMap[subscribedToUser.subscriberId]) {
        usersMap[subscribedToUser.subscriberId] = [];
      }
      usersMap[subscribedToUser.subscriberId].push(user);
    });
  });

  return subscriberIds.map((subscriberId) => usersMap[subscriberId] ?? []);
}

let subscriptionsLoader: DataLoader<string, User[]>;

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: UUIDType },
    balance: { type: GraphQLFloat },
  }),
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        if (!profileLoader) {
          profileLoader = new DataLoader<string, Profile>(async (userIds) =>
            batchLoadProfiles([...userIds], prisma),
          );
        }

        return profileLoader.load(source.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        if (!postLoader) {
          postLoader = new DataLoader<string, Post[]>(async (authorIds) =>
            batchLoadPosts([...authorIds], prisma),
          );
        }

        return postLoader.load(source.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        if (!subscribersLoader) {
          subscribersLoader = new DataLoader<string, User[]>(async (userIds) =>
            batchLoadSubscribers([...userIds], prisma),
          );
        }

        return subscribersLoader.load(source.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: (source: SourceProps, _args, { prisma }: ResolverContext) => {
        if (!subscriptionsLoader) {
          subscriptionsLoader = new DataLoader<string, User[]>(async (userIds) =>
            batchLoadSubscriptions([...userIds], prisma),
          );
        }

        return subscriptionsLoader.load(source.id);
      },
    },
  }),
});
