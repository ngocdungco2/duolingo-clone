import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);

const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Seeding the database");
    await db.delete(schema.courses);
    await db.delete(schema.userProgress);

    await db.delete(schema.units);
    await db.delete(schema.lessons);

    await db.delete(schema.challenges);
    await db.delete(schema.challengesOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.userSubscription);

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: "Spanish",
        imageSrc: "/es.svg",
      },
      {
        id: 2,
        title: "Italian",
        imageSrc: "/it.svg",
      },
      {
        id: 3,
        title: "French",
        imageSrc: "/fr.svg",
      },
      {
        id: 4,
        title: "Croatian",
        imageSrc: "/hr.svg",
      },
    ]);
    await db.insert(schema.units).values([
      {
        id: 1,
        courseId: 1, // spanish
        title: "Unit 1", // tên tiêu đề
        description: "Learn the basic", // nội dung mô tả
        order: 1,
      },
    ]);
    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1, //learn the bassic
        order: 1,
        title: "Nouns",
      },
      {
        id: 2,
        unitId: 1, //learn the bassic
        order: 2,
        title: "Verbs",
      },
      {
        id: 3,
        unitId: 1, //learn the bassic
        order: 3,
        title: "Adjectives",
      },
      {
        id: 4,
        unitId: 1, //learn the bassic
        order: 4,
        title: "Example",
      },
      {
        id: 5,
        unitId: 1, //learn the bassic
        order: 5,
        title: "Test",
      },
    ]);
    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonsId: 1, //nouns
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man" ?',
      },
      {
        id: 2,
        lessonsId: 1,
        type: "ASSIST",
        order: 2,
        question: '"The man"',
      },
      {
        id: 3,
        lessonsId: 1,
        type: "SELECT",
        order: 3,
        question: 'Which one of these is "the robot"',
      },
    ]);
    await db.insert(schema.challengesOptions).values([
      {
        challengeId: 1,
        imageSrc: "/man.svg",
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 1,
        imageSrc: "/robot.svg",
        correct: false,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengesOptions).values([
      {
        challengeId: 2,
        correct: true,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 2,
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 2,
        correct: false,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);
    await db.insert(schema.challengesOptions).values([
      {
        challengeId: 3,
        imageSrc: "/man.svg",
        correct: false,
        text: "el hombre",
        audioSrc: "/es_man.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/woman.svg",
        correct: false,
        text: "la mujer",
        audioSrc: "/es_woman.mp3",
      },
      {
        challengeId: 3,
        imageSrc: "/robot.svg",
        correct: true,
        text: "el robot",
        audioSrc: "/es_robot.mp3",
      },
    ]);

    await db.insert(schema.challenges).values([
      {
        id: 4,
        lessonsId: 2, //nouns
        type: "SELECT",
        order: 1,
        question: 'Which one of these is "the man" ?',
      },
      {
        id: 5,
        lessonsId: 2,
        type: "ASSIST",
        order: 2,
        question: '"The man"',
      },
      {
        id: 6,
        lessonsId: 2,
        type: "SELECT",
        order: 3,
        question: 'Which one of these is "the robot"',
      },
    ]);
    console.log("Database seeding completed");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed the db");
  }
};

main();
