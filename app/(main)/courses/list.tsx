"use client";

import { courses, userProgress } from "@/db/schema";
import Card from "./card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { upsertUserProgress } from "@/actions/user-progress";
import { toast } from "sonner";
// tạo props để định dạng các dữ liệu nhận từ cha
type Props = {
  courses: (typeof courses.$inferSelect)[];
  activeCourseId?: typeof userProgress.$inferSelect.activeCourseId;
};

export const List = ({ courses, activeCourseId }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // hàm onclick sẽ nhận giá trị id khóa học được gửi
  const onClick = (id: number) => {
    // nếu đang trong tình trạng pending thì return và chờ load
    if (pending) return;
    // nếu id tại card vừa chọn bằng với course đã được học từ trước thì chuyển tới trang /learn của khóa đó
    if (id === activeCourseId) {
      return router.push("/learn");
    }
    //user select new course
    startTransition(() => {
      upsertUserProgress(id).catch(() => toast.error("Something went wrong"));
    });
  };
  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {/* tạo 1 vòng lặp hiển thị các dữ liệu được in theo component card */}
      {courses.map((course) => (
        <Card
          key={course.id}
          id={course.id}
          title={course.title}
          imageSrc={course.imageSrc}
          onClick={onClick}
          disabled={pending}
          active={course.id === activeCourseId}
        />
      ))}
    </div>
  );
};
