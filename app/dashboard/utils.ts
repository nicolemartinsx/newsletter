import { TokenWithUser } from "@/app/schema";
import { useQuery } from "@tanstack/react-query";
import { decodeJwt } from "jose";

export function useToken() {
  return useQuery({
    queryKey: ["token"],
    queryFn: () => {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const user = decodeJwt(token);
      return TokenWithUser.parse({
        ...user,
        token,
      });
    },
  });
}
