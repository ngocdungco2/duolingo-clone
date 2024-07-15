import { auth } from "@clerk/nextjs";

const adminIds = ["user_2eG9eU3MqoqtJ6XOWqkpsqSjc07"];

export const isAdmin = () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }
  return adminIds.indexOf(userId) !== -1;
};
