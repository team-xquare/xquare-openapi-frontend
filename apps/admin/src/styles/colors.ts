export interface ColorGroup {
  [key: string]: string | ColorGroup;
  [key: number]: string | ColorGroup;
}

// user 앱 Xquare_colors 중 admin 화면에서 쓰는 색만 같은 이름으로 둠
// 공유 패키지로 옮길 때 그대로 합칠 수 있도록 값과 키를 바꾸지 않음
export const Xquare_colors: ColorGroup = {
  black: "#000000",
  white: "#FFFFFF",

  red: {
    500: "#FF5353",
    600: "#D94040",
  },

  slate: {
    50: "#F9F9FB",
    200: "#E5E8EB",
    400: "#B1B8BE",
    600: "#5C646B",
    900: "#1E2124",
  },

  purple: {
    100: "#F2E9FE",
    400: "#8A38F5",
    700: "#0B001A",
  },
};
