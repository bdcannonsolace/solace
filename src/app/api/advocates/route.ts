import { getPaginationParams } from "../../../lib/pagination";
import { listAdvocates } from "./service";

export async function GET(request?: Request) {
  const { page, pageSize } = getPaginationParams(request);

  const data = await listAdvocates(page, pageSize);

  return Response.json({ data });
}
