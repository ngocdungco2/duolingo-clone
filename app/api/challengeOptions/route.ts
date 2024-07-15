import { NextResponse } from "next/server";

import db from "@/db/drizzle";

import { isAdmin } from "@/lib/admin";
import { challengesOptions } from "@/db/schema";

export const GET = async () => {
  // kiểm tra quyền Admin
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  // lấy hết các khóa học và lưu vào biến data
  const data = await db.query.challengesOptions.findMany();
  // trả về data dạng json
  return NextResponse.json(data);
};
export const POST = async (req: Request) => {
  if (!isAdmin()) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const data = await db
    .insert(challengesOptions)
    .values({
      ...body,
    })
    .returning();

  return NextResponse.json(data[0]);
};
