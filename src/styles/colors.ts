export interface ColorGroup {
  [key: string]: string | ColorGroup;
  [key: number]: string | ColorGroup;
}

export const Xquare_colors: ColorGroup = {
  black: "#000000",
  white: "#FFFFFF",

  gray: {
    300: "#EAEAEA",
    400: "#BEBEBE",
    500: "#ABABAB",
    600: "#6B737A",
    700: "#323232",
  },

  red: {
    400: "#FF9090",
    500: "#FF5353",
    600: "#D94040",
  },

  green: {
    100: "#DCEFE6",
    500: "#0F9959",
  },

  blue: {
    100: "#DEE7FB",
    400: "#256EF4",
    500: "#2563EB",
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
    200: "#BE9DE8",
    400: "#8A38F5",
    500: "#9650FA",
    600: "#433459",
    700: "#0B001A",
  },
};

export default Xquare_colors;
