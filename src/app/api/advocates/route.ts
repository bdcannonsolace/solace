import { getPaginationParams } from "../../../lib/pagination";
import { listAdvocates } from "./service";
import db from "../../../db";
import { buildFiltersFromRequest } from "./filters";

export async function GET(request: Request) {
  const { page, pageSize } = getPaginationParams(request);
  const filters = buildFiltersFromRequest(request);

  const data = await listAdvocates(page, pageSize, db, filters);

  return Response.json({ data });
}
