import { hasValidToken } from "../utils";

export async function POST(request: Request) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  return new Response(null, { status: 200 });
}
