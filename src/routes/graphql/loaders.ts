import { PrismaClient } from '@prisma/client';
import { MemberTypeType, Post, Profile, User } from './ts-types.js';

export async function batchLoadMemberTypes(
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

export async function batchLoadPosts(
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

export async function batchLoadProfiles(
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

export async function batchLoadSubscribers(
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

export async function batchLoadSubscriptions(
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
