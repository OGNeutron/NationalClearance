# Migration `20200327133509-bookings`

This migration has been generated by scott at 3/27/2020, 1:35:09 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Bookings" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "id" SERIAL,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Week" (
    "bookings" integer   ,
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "days" integer  NOT NULL ,
    "id" SERIAL,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Days" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "friday" integer  NOT NULL ,
    "id" SERIAL,
    "monday" integer  NOT NULL ,
    "thursday" integer  NOT NULL ,
    "tuesday" integer  NOT NULL ,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "wednesday" integer  NOT NULL ,
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Monday" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "eighttoten" boolean  NOT NULL DEFAULT false,
    "fourtosix" boolean  NOT NULL DEFAULT false,
    "id" SERIAL,
    "tentotwelve" boolean  NOT NULL DEFAULT false,
    "twelvetotwo" boolean  NOT NULL DEFAULT false,
    "twotofour" boolean  NOT NULL DEFAULT false,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Tuesday" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "eighttoten" boolean  NOT NULL DEFAULT false,
    "fourtosix" boolean  NOT NULL DEFAULT false,
    "id" SERIAL,
    "tentotwelve" boolean  NOT NULL DEFAULT false,
    "twelvetotwo" boolean  NOT NULL DEFAULT false,
    "twotofour" boolean  NOT NULL DEFAULT false,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Wednesday" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "eighttoten" boolean  NOT NULL DEFAULT false,
    "fourtosix" boolean  NOT NULL DEFAULT false,
    "id" SERIAL,
    "tentotwelve" boolean  NOT NULL DEFAULT false,
    "twelvetotwo" boolean  NOT NULL DEFAULT false,
    "twotofour" boolean  NOT NULL DEFAULT false,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Thursday" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "eighttoten" boolean  NOT NULL DEFAULT false,
    "fourtosix" boolean  NOT NULL DEFAULT false,
    "id" SERIAL,
    "tentotwelve" boolean  NOT NULL DEFAULT false,
    "twelvetotwo" boolean  NOT NULL DEFAULT false,
    "twotofour" boolean  NOT NULL DEFAULT false,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Friday" (
    "createdAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    "eighttoten" boolean  NOT NULL DEFAULT false,
    "fourtosix" boolean  NOT NULL DEFAULT false,
    "id" SERIAL,
    "tentotwelve" boolean  NOT NULL DEFAULT false,
    "twelvetotwo" boolean  NOT NULL DEFAULT false,
    "twotofour" boolean  NOT NULL DEFAULT false,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

ALTER TABLE "public"."Week" ADD FOREIGN KEY ("bookings")REFERENCES "public"."Bookings"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."Week" ADD FOREIGN KEY ("days")REFERENCES "public"."Days"("id") ON DELETE RESTRICT  ON UPDATE CASCADE

ALTER TABLE "public"."Days" ADD FOREIGN KEY ("monday")REFERENCES "public"."Monday"("id") ON DELETE RESTRICT  ON UPDATE CASCADE

ALTER TABLE "public"."Days" ADD FOREIGN KEY ("tuesday")REFERENCES "public"."Tuesday"("id") ON DELETE RESTRICT  ON UPDATE CASCADE

ALTER TABLE "public"."Days" ADD FOREIGN KEY ("wednesday")REFERENCES "public"."Wednesday"("id") ON DELETE RESTRICT  ON UPDATE CASCADE

ALTER TABLE "public"."Days" ADD FOREIGN KEY ("thursday")REFERENCES "public"."Thursday"("id") ON DELETE RESTRICT  ON UPDATE CASCADE

ALTER TABLE "public"."Days" ADD FOREIGN KEY ("friday")REFERENCES "public"."Friday"("id") ON DELETE RESTRICT  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200327133509-bookings
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,97 @@
+// This is your Prisma schema file,
+// learn more about it in the docs: https://pris.ly/d/prisma-schema
+
+datasource db {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
+
+generator client {
+  provider = "prisma-client-js"
+}
+
+model Bookings {
+  id Int @id @default(autoincrement())
+  weeks Week[]
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Week {
+  id Int @id @default(autoincrement())
+  days Days
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Days {
+  id Int @id @default(autoincrement())
+  monday Monday @relation("monday-times")
+  tuesday Tuesday @relation("tuesday-times")
+  wednesday Wednesday @relation("wednesday-times")
+  thursday Thursday @relation("thursday-times")
+  friday Friday @relation("friday-times")
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+  // monday Day @relation("monday-times")
+  // tuesday Day @relation("tuesday-times")
+  // wednesday Day @relation("wednesday-times")
+  // thrusday Day @relation("thrusday-times")
+  // friday Day @relation("friday-times")
+  // @@unique([monday, tuesday, wednesday, thrusday, friday])
+}
+
+model Monday {
+  id Int @id @default(autoincrement())
+  eighttoten Boolean @default(false)
+  tentotwelve Boolean @default(false)
+  twelvetotwo Boolean @default(false)
+  twotofour Boolean @default(false)
+  fourtosix Boolean @default(false)
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Tuesday {
+  id Int @id @default(autoincrement())
+  eighttoten Boolean @default(false)
+  tentotwelve Boolean @default(false)
+  twelvetotwo Boolean @default(false)
+  twotofour Boolean @default(false)
+  fourtosix Boolean @default(false)
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Wednesday {
+  id Int @id @default(autoincrement())
+  eighttoten Boolean @default(false)
+  tentotwelve Boolean @default(false)
+  twelvetotwo Boolean @default(false)
+  twotofour Boolean @default(false)
+  fourtosix Boolean @default(false)
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Thursday {
+  id Int @id @default(autoincrement())
+  eighttoten Boolean @default(false)
+  tentotwelve Boolean @default(false)
+  twelvetotwo Boolean @default(false)
+  twotofour Boolean @default(false)
+  fourtosix Boolean @default(false)
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
+
+model Friday {
+  id Int @id @default(autoincrement())
+  eighttoten Boolean @default(false)
+  tentotwelve Boolean @default(false)
+  twelvetotwo Boolean @default(false)
+  twotofour Boolean @default(false)
+  fourtosix Boolean @default(false)
+  createdAt DateTime @default(now())
+  updatedAt DateTime @default(now())
+}
```


