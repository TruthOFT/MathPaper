import { registerMathPaper } from '@/services/mathpaper';

export interface StateType {
  status?: 'ok' | 'error';
  currentAuthority?: 'user' | 'guest' | 'admin';
}

export interface UserRegisterParams {
  username: string;
  password: string;
  confirm: string;
  realName: string;
  roleType: string;
}

export async function fakeRegister(params: UserRegisterParams) {
  return registerMathPaper({
    username: params.username,
    password: params.password,
    realName: params.realName || params.username,
    roleType: params.roleType || 'student',
  });
}
