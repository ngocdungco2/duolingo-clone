import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import { redirect } from "next/navigation";
import Quiz from "./quiz";

const LessonPage = async () => {
  // lấy ra các dữ liệu về bài học (lesson) và quá trình ngươi dùng học tới đâu
  const lessonData = getLesson();
  const userProgressData = getUserProgress();

  const userSubscriptionData = getUserSubscription();
  // khoai báo biến lesson, userprogress để dễ gọi
  const [lesson, userProgress, userSubscription] = await Promise.all([
    lessonData,
    userProgressData,
    userSubscriptionData,
  ]);
  //   nếu bài học (lesson) hoặc quá trình học của người dùng rỗng sẽ chuyển về trang learn
  if (!lesson || !userProgress) {
    redirect("/learn");
  }
  // tính toán số % mà khóa học đã được hoàn thành bằng cách lọc các khóa học khôg
  const initialPercentage =
    (lesson.challenges.filter((challenge) => challenge.completed).length /
      lesson.challenges.length) *
    100;
  return (
    <div>
      <Quiz
        initialLessonId={lesson.id}
        initialLessonChallenges={lesson.challenges}
        initialHearts={userProgress.hearts}
        initialPercentage={initialPercentage}
        userSubscription={userSubscription}
      />
    </div>
  );
};

export default LessonPage;
