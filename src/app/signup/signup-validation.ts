// XQUARE 인프라 서비스 회원가입과 같은 입력 규칙
const EMAIL_REGEX = /^[^\s@]+@dsm\.hs\.kr$/;
const VERIFY_CODE_REGEX = /^\d{6}$/;
const STUDENT_ID_REGEX = /^\d{4}$/;
const NAME_REGEX = /^[가-힣]+$/;
const USERNAME_REGEX = /^[A-Za-z0-9_-]+$/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

const STUDENT_ID_MIN = 1000;
const STUDENT_ID_MAX = 3999;
const STUDENT_ID_MAX_DIGITS = 4;

const USERNAME_MIN_LENGTH = 4;
const USERNAME_MAX_LENGTH = 15;

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 20;

export interface SignupFormValues {
  email: string;
  verifyCode: string;
  studentId: string;
  name: string;
  username: string;
  password: string;
  passwordCheck: string;
}

export const INITIAL_SIGNUP_FORM: SignupFormValues = {
  email: "",
  verifyCode: "",
  studentId: "",
  name: "",
  username: "",
  password: "",
  passwordCheck: "",
};

export const SIGNUP_ERROR_MESSAGES = {
  email: "유효한 학교 이메일(@dsm.hs.kr)을 입력하세요.",
  verifyCode: "유효한 인증코드를 입력하세요.",
  studentId: "학번은 1000~3999의 숫자 4자리로 입력해주세요.",
  name: "이름을 다시 한번 확인해주세요.",
  username: "아이디는 4~15자의 영문, 숫자, -, _만 허용 합니다.",
  password: "비밀번호는 8~20자이며 특수문자를 포함해야 합니다.",
  passwordMatch: "비밀번호가 일치하지 않습니다.",
};

// 학번 입력칸에는 숫자만 4자리까지 남김
export const sanitizeStudentId = (value: string) =>
  value.replace(/\D/g, "").slice(0, STUDENT_ID_MAX_DIGITS);

export function validateSignupForm(form: SignupFormValues) {
  const studentId = Number(form.studentId);

  return {
    email: EMAIL_REGEX.test(form.email),
    verifyCode: VERIFY_CODE_REGEX.test(form.verifyCode),
    studentId:
      STUDENT_ID_REGEX.test(form.studentId) &&
      studentId >= STUDENT_ID_MIN &&
      studentId <= STUDENT_ID_MAX,
    name: NAME_REGEX.test(form.name),
    username:
      form.username.length >= USERNAME_MIN_LENGTH &&
      form.username.length <= USERNAME_MAX_LENGTH &&
      USERNAME_REGEX.test(form.username),
    password:
      form.password.length >= PASSWORD_MIN_LENGTH &&
      form.password.length <= PASSWORD_MAX_LENGTH &&
      PASSWORD_SPECIAL_REGEX.test(form.password),
    passwordMatch:
      form.password.length > 0 && form.password === form.passwordCheck,
  };
}
