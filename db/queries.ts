import { cache } from "react";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import {
  challengeProgress,
  challenges,
  courses,
  units,
  userProgress,
  lessons,
  userSubscription,
} from "@/db/schema";
import CoursesPage from "@/app/(main)/courses/page";

//lấy người dùng từ database
export const getUserProgress = cache(async () => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  //tìm và lấy kết quả trả về là thông tin người dùng trong database trong điều kiện có khóa học tồn tại
  //điều kiệu select sẽ là id của người dùng và id tiến tình mà người dùng đang đăng nhập
  const data = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
    with: {
      activeCourse: true,
    },
  });

  return data;
});

export const getUnits = cache(async () => {
  const userProgress = await getUserProgress();
  const { userId } = await auth();
  if (!userId || !userProgress?.activeCourseId) {
    return [];
  }

  // lấy các chủ đề của khóa học hiện tại
  const data = await db.query.units.findMany({
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          challenges: {
            orderBy: (challenges, { asc }) => [asc(challenges.order)],

            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });

  //kiểm tra xem các thử thách trong khóa học đã được hoàn thành hay chưa nếu rồi thì đánh dấu là đã hoàn thành trả về true nếu chưa hoàn thành trả giá trị false
  const normalizedData = data.map((unit) => {
    const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
      //nếu khóa học không có các thử thách thì chả về giá trị của completed = false nghĩa rằng khóa các thử thách này
      if (lesson.challenges.length === 0) {
        return { ...lesson, completed: false };
      }

      const allCompletedChallenges = lesson.challenges.every((challenge) => {
        return (
          challenge.challengeProgress &&
          challenge.challengeProgress.length > 0 &&
          challenge.challengeProgress.every((progress) => progress.completed)
        );
      });
      return { ...lesson, completed: allCompletedChallenges };
    });
    return { ...unit, lessons: lessonsWithCompletedStatus };
  });
  return normalizedData;
});

//tìm tất cả các khóa học tồn tại trong database
export const getCourses = cache(async () => {
  const data = await db.query.courses.findMany();
  return data;
});
// lấy khóa học dựa theo id có được với điệu kiệu id của khóa học bằng với khóa học id mà người dùng vừa chọn
export const getCourseById = cache(async (courseId: number) => {
  const data = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
        with: {
          lessons: {
            orderBy: (lessons, { asc }) => [asc(lessons.order)],
          },
        },
      },
    },
  });

  return data;
});
// lấy thông tin khóa học nào đang trong quá trình học
export const getCourseProgress = cache(async () => {
  const { userId } = await auth();
  const userProgress = await getUserProgress();
  //nếu id người dùng hoặc không có khóa học nào đang học
  if (!userId || !userProgress?.activeCourseId) {
    return null;
  }
  // lấy các units đang được học ra và sắp xếp theo order (1,2,3,4) với điều kiện id khóa học phải = id khóa học của người dùng đang học
  const unitsInActiveCourse = await db.query.units.findMany({
    orderBy: (units, { asc }) => [asc(units.order)],
    where: eq(units.courseId, userProgress.activeCourseId),
    with: {
      lessons: {
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
        with: {
          unit: true,
          challenges: {
            with: {
              challengeProgress: {
                where: eq(challengeProgress.userId, userId),
              },
            },
          },
        },
      },
    },
  });
  const firstUncompletedLesson = unitsInActiveCourse
    .flatMap((unit) => unit.lessons)
    .find((lesson) => {
      return lesson.challenges.some((challenge) => {
        return (
          !challenge.challengeProgress ||
          challenge.challengeProgress.length === 0 ||
          challenge.challengeProgress.some(
            (progress) => progress.completed === false
          )
        );
      });
    });
  return {
    activeLesson: firstUncompletedLesson,
    activeLessonId: firstUncompletedLesson?.id,
  };
});

//hàm được tạo ra khi người dùng muốn học lại các bài cũ nếu là bài cũ thì load id ra còn nếu bài mới thì load không id
export const getLesson = cache(async (id?: number) => {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }
  //nếu người dùng chưa học bài nào tức id === null thì sẽ load ra bài đầu tiên trong lesson
  const courseProgress = await getCourseProgress();
  
  const lessonId = id || courseProgress?.activeLessonId;

  if (!lessonId) {
    return null;
  }

  //data Này sẽ chứa các bài học (lessons) mà khóa học đang có
  const data = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          challengesOptions: true,
          challengeProgress: {
            where: eq(challengeProgress.userId, userId),
          },
        },
      },
    },
  });
  if (!data || !data.challenges) {
    return null;
  }

  const normalizedChallenges = data.challenges.map((challenge) => {
    //1 khóa học được tính là hoàn thành nếu quá trình học có tồn tại và lớn hơn 0 và tất cả các bài học có quá trình đã hoàn thành
    const completed =
      challenge.challengeProgress &&
      challenge.challengeProgress.length > 0 &&
      challenge.challengeProgress.every((progress) => progress.completed);

    return { ...challenge, completed };
  });
  //trả về kết quả là các bài học (lesson) mà khóa học có nhưng challenge trong các bài học được trả về bằng giá trị của normalizedChallenges
  return { ...data, challenges: normalizedChallenges };
});

export const getLessonPercentage = cache(async () => {
  const courseProgress = await getCourseProgress();

  if (!courseProgress?.activeLessonId) {
    return 0;
  }

  const lesson = await getLesson(courseProgress.activeLessonId);

  if (!lesson) {
    return 0;
  }

  //lấy ra những thử thách mà đã được hoàn thành
  const completedChallenges = lesson.challenges.filter(
    (challenge) => challenge.completed
  );
  // tính phần trăm hoàn thành bằng cách lấy số khóa học đã hoàn thành chia cho tổng số khóa học * với 100
  const percentage = Math.round(
    (completedChallenges.length / lesson.challenges.length) * 100
  );
  return percentage;
});

const DAY_IN_MS = 86_400_000;
export const getUserSubscription = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const data = await db.query.userSubscription.findFirst({
    where: eq(userSubscription.userId, userId),
  });

  if (!data) return null;

  const isActive =
    data.stripePriceId &&
    data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

  return {
    ...data,
    isActive: !!isActive,
  };
  //8:47
});

export const getTopTenUser = cache(async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const data = await db.query.userProgress.findMany({
    orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
    limit: 10,
    columns: {
      userId: true,
      userName: true,
      userImageSrc: true,
      points: true,
    },
  });
  return data;
});
