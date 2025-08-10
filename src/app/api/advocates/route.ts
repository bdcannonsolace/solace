import db from "../../../db";
import { asc } from "drizzle-orm";
import { advocates } from "../../../db/schema";

const PAGE_SIZE = 10;

export async function GET(request?: Request) {
  const { pageSize, offset } = getPaginationParams(request);

  const data = await db
    .select()
    .from(advocates)
    .orderBy(asc(advocates.id))
    .limit(pageSize)
    .offset(offset);

  return Response.json({ data });
}

function parsePositiveIntOrDefault(
  value: string | null | undefined,
  defaultValue: number,
): number {
  const parsed = value != null ? parseInt(value, 10) : Number.NaN;
  if (Number.isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }
  return parsed;
}

function getPaginationParams(request?: Request) {
  const url = request?.url ? new URL(request.url) : undefined;
  const page = parsePositiveIntOrDefault(url?.searchParams.get("page"), 1);
  const pageSize = parsePositiveIntOrDefault(
    url?.searchParams.get("pageSize"),
    PAGE_SIZE,
  );
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}
