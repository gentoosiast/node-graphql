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

async function batchLoadUsers(userIds: string[], prisma: PrismaClient): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: {
      userSubscribedTo: true,
      subscribedToUser: true,
    },
  });

  const usersMap: Record<string, User> = {};

  users.forEach((user) => {
    usersMap[user.id] = user;
  });

  return userIds.map((userId) => usersMap[userId]);
}

export const createUserLoader = (prisma: PrismaClient) =>
  new DataLoader<string, User>(async (userIds) => batchLoadUsers([...userIds], prisma));

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
