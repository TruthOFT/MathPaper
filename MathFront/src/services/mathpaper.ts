import { request } from '@umijs/max';

export type MathPaperResult<T> = {
  code: number;
  message: string;
  data: T;
};

export type MathPaperUser = {
  id: number;
  username: string;
  roleType: 'teacher' | 'student' | 'admin';
  realName: string;
};

type MathPaperRequestOptions = {
  method?: string;
  data?: unknown;
  body?: BodyInit | null;
  headers?: Record<string, string>;
  skipErrorHandler?: boolean;
  [key: string]: unknown;
};

const parseBody = (body: BodyInit | null | undefined) => {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

export async function mathRequest<T>(
  url: string,
  options: MathPaperRequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const result = await request<MathPaperResult<T>>(url, {
    credentials: 'include',
    withCredentials: true,
    ...rest,
    data: rest.data ?? parseBody(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    skipErrorHandler: true,
  });

  if (result.code !== 0) {
    throw new Error(result.message || '请求失败');
  }

  return result.data;
}

export function toCurrentUser(user: MathPaperUser): API.CurrentUser {
  return {
    id: user.id,
    userid: String(user.id),
    username: user.username,
    name: user.realName || user.username,
    realName: user.realName,
    roleType: user.roleType,
    access: user.roleType === 'admin' ? 'admin' : user.roleType,
    title:
      user.roleType === 'teacher'
        ? '教师'
        : user.roleType === 'admin'
          ? '管理员'
          : '学生',
  };
}

export async function loginMathPaper(params: API.LoginParams) {
  const user = await mathRequest<MathPaperUser>('/api/auth/login', {
    method: 'POST',
    data: {
      username: params.username,
      password: params.password,
    },
  });

  return {
    status: 'ok',
    type: params.type,
    currentAuthority: user.roleType,
    user: toCurrentUser(user),
  };
}

export async function registerMathPaper(params: {
  username: string;
  password: string;
  realName: string;
  roleType: string;
}) {
  const user = await mathRequest<MathPaperUser>('/api/auth/register', {
    method: 'POST',
    data: params,
  });

  return {
    status: 'ok',
    currentAuthority: user.roleType,
    user: toCurrentUser(user),
  };
}

export async function currentMathPaperUser() {
  const user = await mathRequest<MathPaperUser>('/api/auth/me');
  return { data: toCurrentUser(user) };
}

export async function logoutMathPaper() {
  await mathRequest<void>('/api/auth/logout', { method: 'POST' });
  return { status: 'ok' };
}
