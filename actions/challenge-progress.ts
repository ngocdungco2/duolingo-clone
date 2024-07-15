"use server";

import db from "@/db/drizzle";
import { getUserProgress, getUserSubscription } from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const upsertChallengeProgress = async (challengeId: number) => {
  // lấy thông tin người dùng nếu không có trả về lỗi
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  //lấy thông tin khóa học mà người dùng đang học
  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();
  if (!currentUserProgress) {
    throw Error("User progress not found");
  }
  //tìm thử thách người dùng học
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });
  if (!challenge) {
    throw new Error("Challenge not found");
  }

  const lessonId = challenge.lessonsId;
  //lấy ra những khóa học mà người dùng đang học với
  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });
  const isPractice = !!existingChallengeProgress;

  //nếu người dùng đang học bài mới và đã hết lượt làm bài chỉ thực hiện khi đây không phải luyện tập và không phải là tài khoản pro
  if (
    currentUserProgress.hearts === 0 &&
    !isPractice &&
    !userSubscription?.isActive
  ) {
    return { error: "hearts" };
  }
  //nếu người dùng đang luyện tập bài học cũ
  if (isPractice) {
    //cập nhập lại trạng thái hoàn thành của bài học nếu trường hợp chưa cập nhật với đkien là id của bài học bằng với id của bài học hiện tại
    await db
      .update(challengeProgress)
      .set({
        completed: true,
      })
      .where(eq(challengeProgress.id, existingChallengeProgress.id));

    //NOTE: với mỗi câu trả lời đúng người dùng đc 10 điểm
    await db
      .update(userProgress)
      .set({
        hearts: Math.min(currentUserProgress.hearts + 1, 5),
        points: currentUserProgress.points + 10,
      })
      .where(eq(userProgress.userId, userId));

    revalidatePath("/learn");
    revalidatePath("/lesson");
    revalidatePath("/quests");
    revalidatePath("/leaderboard");
    revalidatePath(`/lesson/${lessonId}`);
    return;
  }
  //thêm dữ liệu cho quá trình học
  await db.insert(challengeProgress).values({
    challengeId,
    userId,
    completed: true,
  });
  //cập nhật điểm số cho người dùng
  await db
    .update(userProgress)
    .set({
      points: currentUserProgress.points + 10,
    })
    .where(eq(userProgress.userId, userId));
  revalidatePath("/learn");
  revalidatePath("/lesson");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};
