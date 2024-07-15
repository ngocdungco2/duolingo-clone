import { NextResponse } from "next/server";

import db from "@/db/drizzle";

import { isAdmin } from "@/lib/admin";
import { lessons } from "@/db/schema";

export const GET = async () => {
  // kiểm tra quyền Admin
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // lấy hết các khóa học và lưu vào biến data
  const data = await db.query.lessons.findMany();
  // trả về data dạng json
  return NextResponse.json(data);
};
export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const data = await db
    .insert(lessons)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};
