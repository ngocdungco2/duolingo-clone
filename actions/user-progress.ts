"use server";

import { points_to_refill } from "@/constant";
import db from "@/db/drizzle";
import {
  getCourseById,
  getUserProgress,
  getUserSubscription,
} from "@/db/queries";
import { challengeProgress, challenges, userProgress } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs";
import { error } from "console";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//lấy thông tin id người dùng vào người dùng từ clerk js
export const upsertUserProgress = async (courseId: number) => {
  const { userId } = await auth();
  const user = await currentUser();
  //nếu người dùng hay id người dùng không tồn tại thông báo không xác thực
  if (!userId || !user) {
    throw new Error("Unauthorized");
  }
  //course id lấy từ querry đã tạo từ trước
  const course = await getCourseById(courseId);

  //nếu ccourse không tồn tại thông báo ra không tìm thấy course
  if (!course) {
    throw new Error("Course not found");
  }

  // nếu course không có bài giảng nào thông báo course rỗng
  if (!course.units.length || !course.units[0].lessons.length) {
    throw new Error("Course empty");
  }

  const existingUserProgress = await getUserProgress();

  //nếu người dùng đã tồn tại đồng nghĩa với người dùng đã sử dụng khóa học từ trước
  //hàm sẽ thay đổi nếu người dùng chuyển sang khóa khác sẽ update khóa hiện tại của người dùng đang học sang khóa mới
  if (existingUserProgress) {
    await db.update(userProgress).set({
      activeCourseId: courseId,
      userName: user.firstName || "User",
      userImageSrc: user.imageUrl || "/mascot.svg",
    });
    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
  }

  //nếu người dùng chưa từng học khóa nào tiến hành thêm khóa học người dùng vừa chọn thành activeCourse của người dùng đó
  await db.insert(userProgress).values({
    userId,
    activeCourseId: courseId,
    userName: user.firstName || "User",
    userImageSrc: user.imageUrl || "/mascot.svg",
  });
  revalidatePath("/courses");
  revalidatePath("/learn");
  redirect("/learn");
};

export const reduceHearts = async (challengeId: number) => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized user");
  }

  const currentUserProgress = await getUserProgress();
  const userSubscription = await getUserSubscription();
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeId),
  });
  if (!challenge) {
    throw new Error("Challenge not found");
  }
  const lessonId = challenge.lessonsId;
  const existingChallengeProgress = await db.query.challengeProgress.findFirst({
    where: and(
      eq(challengeProgress.userId, userId),
      eq(challengeProgress.challengeId, challengeId)
    ),
  });
  const isPractice = !!existingChallengeProgress;
  if (isPractice) {
    //return theo api
    return { error: "practice" };
  }
  if (!currentUserProgress) {
    //return theo thong bao (break the app)
    throw new Error("User progress not found");
  }
  //mỗi khi error sẽ dừng hoạt động và không tiến hành update database nữa
  if (userSubscription?.isActive) {
    return { error: "subscription" };
  }

  if (currentUserProgress.hearts === 0) {
    return { error: "hearts" };
  }

  await db
    .update(userProgress)
    .set({
      hearts: Math.max(currentUserProgress.hearts - 1, 0),
    })
    .where(eq(userProgress.userId, userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
  revalidatePath(`/lesson/${lessonId}`);
};

export const refillHearts = async () => {
  const currentUserProgress = await getUserProgress();

  if (!currentUserProgress) {
    throw new Error("User progress not found");
  }
  if (currentUserProgress.hearts === 5) {
    throw new Error("Hearts are already full");
  }
  if (currentUserProgress.points < points_to_refill) {
    throw new Error("Not enough points");
  }
  await db
    .update(userProgress)
    .set({
      hearts: 5,
      points: currentUserProgress.points - points_to_refill,
    })
    .where(eq(userProgress.userId, currentUserProgress.userId));

  revalidatePath("/shop");
  revalidatePath("/learn");
  revalidatePath("/quests");
  revalidatePath("/leaderboard");
};
