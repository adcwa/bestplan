export const theme = {
  colors: {
    // 2024年潘通年度代表色：PANTONE 13-1023 Peach Fuzz
    primary: {
      light: '#FFE4D6',
      DEFAULT: '#FFBE98',
      dark: '#FF9B6A',
    },
    // 辅助色系
    secondary: {
      light: '#E3F1FF',
      DEFAULT: '#2E90FA',
      dark: '#1570CD',
    },
    // 成功/进度色
    success: {
      light: '#E6F9F1',
      DEFAULT: '#12B76A',
      dark: '#027948',
    },
    // 警告色
    warning: {
      light: '#FEF4E6',
      DEFAULT: '#F79009',
      dark: '#B54708',
    },
    // 错误色
    error: {
      light: '#FEE4E2',
      DEFAULT: '#F04438',
      dark: '#B42318',
    },
    // 中性色
    neutral: {
      50: '#F9FAFB',
      100: '#F2F4F7',
      200: '#EAECF0',
      300: '#D0D5DD',
      400: '#98A2B3',
      500: '#667085',
      600: '#475467',
      700: '#344054',
      800: '#1D2939',
      900: '#101828',
    },
  },
  shadows: {
    sm: '0px 1px 2px rgba(16, 24, 40, 0.05)',
    md: '0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)',
    lg: '0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03)',
  },
  animations: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const zIndexLevels = {
  base: 0,           // 基础内容
  calendar: 1,       // 日历组件
  hover: 100,        // 悬浮内容
  modal: 1000,       // 模态框背景
  modalContent: 1001 // 模态框内容
} as const; 