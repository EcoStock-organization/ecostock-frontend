import { authApi } from "@/lib/api";
import Cookies from "js-cookie";

export async function login(email: string, password: string) {
  const response = await authApi.post("/token/", {
    username: email,
    password: password,
  });

  const { access, refresh } = response.data;

  Cookies.set("access_token", access, { expires: 1 });
  Cookies.set("refresh_token", refresh, { expires: 7 });

  return response.data;
}
