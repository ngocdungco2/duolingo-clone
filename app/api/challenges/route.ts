import { NextResponse } from "next/server";

import db from "@/db/drizzle";

import { isAdmin } from "@/lib/admin";
import { challenges } from "@/db/schema";

export const GET = async () => {
  // kiểm tra quyền Admin
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // lấy hết các khóa học và lưu vào biến data
  const data = await db.query.challenges.findMany();
  // trả về data dạng json
  return NextResponse.json(data);
};
export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const data = await db
    .insert(challenges)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};
