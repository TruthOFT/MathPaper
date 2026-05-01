// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";
import {
  currentMathPaperUser,
  loginMathPaper,
  logoutMathPaper,
} from "@/services/mathpaper";
export { addRule, removeRule, rule, updateRule } from "./rule";

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return currentMathPaperUser();
}

/** 登录接口 POST /api/auth/login */
export async function login(
  body: API.LoginParams,
  options?: { [key: string]: any }
) {
  return loginMathPaper(body);
}

/** 退出登录 POST /api/auth/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return logoutMathPaper();
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>("/api/notices", {
    method: "GET",
    ...(options || {}),
  });
}
