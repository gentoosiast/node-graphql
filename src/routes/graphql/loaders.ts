import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';
import { MemberTypeType, Post, Profile, User } from './ts-types.js';

async function batchLoadMemberTypes(
  memberTypeIds: string[],
  prisma: PrismaClient,
): Promise<MemberTypeType[]> {
  const memberTypes = await prisma.memberType.findMany({
    where: { id: { in: memberTypeIds } },
  });

  const memberTypeMap: { [id: string]: MemberTypeType } = {};
  memberTypes.forEach((memberType) => {
    memberTypeMap[memberType.id] = memberType;
  });

  return memberTypeIds.map((id) => memberTypeMap[id]);
}

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
export const createMemberTypeLoader = (prisma: PrismaClient) =>
  new DataLoader<string, MemberTypeType>(async (memberTypeIds) =>
    batchLoadMemberTypes([...memberTypeIds], prisma),
  );

export const createPostLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Post[]>(async (authorIds) =>
    batchLoadPosts([...authorIds], prisma),
  );

export const createProfileLoader = (prisma: PrismaClient) =>
  new DataLoader<string, Profile>(async (userIds) =>
    batchLoadProfiles([...userIds], prisma),
  );

export const createSubscribersLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User[]>(async (userIds) =>
    batchLoadSubscribers([...userIds], prisma),
  );

export const createSubscriptionsLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User[]>(async (userIds) =>
    batchLoadSubscriptions([...userIds], prisma),
  );
