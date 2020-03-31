import { createGlobalStyle } from 'styled-components';

const logoColorsLightMode = [
  '#000000',
  '#85ca5d',
  '#5291e1',
  '#ff00b4',
  '#00ffbc',
  '#8ea5ff',
  '#c493ff',
  '#ffb5b5',
  '#8fb8ff',
  '#fd81eb',
];

const logoColorsDarkMode = ['#ededed', '#ffa41b', '#9818d6', '#61d4b3', '#fdd365', '#fb8d62', '#fd2eb3'];

export const globalTheme = {
  spaceUnits: {
    xxxs: '2px',
    xxs: '4px',
    xs: '8px',
    s: '12px',
    m: '16px',
    l: '24px',
    xl: '32px',
    xxl: '40px',
    xxxl: '48px',
  },
  fontFamilies: {
    primary: '"Source Serif Pro", serif',
  },
  fontSizes: {
    xxl: '1.25rem',
    xl: '1.125rem',
    l: '1rem',
    m: '0.875rem',
    s: '0.75rem',
    xs: '0.625rem',
    xxs: '0.55rem',
  },
  fontWeights: {
    light: '300',
    regular: '400',
    semiBold: '600',
    bold: '700',
  },
  mediaQueries: {
    xl: 'min-width: 1440px',
    l: 'min-width: 1024px',
    m: 'min-width: 768px',
    s: 'min-width: 480px',
  },
  container: {
    xl: '1320px',
    l: '1180px',
    m: '992px',
    s: '720px',
  },
  skeleton: {
    headerHeight: '88px',
    footerHeight: '48px',
  },
  header: {
    height: '88px',
  },
  transition: {
    defaultAll: 'all 0.3s ease-in-out',
    duration: '0.3s',
  },
  awesomegrid: {
    mediaQuery: 'only screen',
    columns: {
      xs: 12,
      sm: 12,
      md: 12,
      lg: 12,
      xl: 12,
    },
    gutterWidth: {
      xs: 1,
      sm: 1,
      md: 1,
      lg: 1.5,
      xl: 1.5,
    },
    paddingWidth: {
      xs: 0,
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
    },
    container: {
      xs: 'full', // 'full' = max-width: 100%
      sm: 'full', // 'full' = max-width: 100%
      md: 'full', // 'full' = max-width: 100%
      lg: 'full', // 'full' = max-width: 100%
      xl: 'full', // 'full' = max-width: 100%
    },
    breakpoints: {
      xs: 1,
      sm: 48, // 768px
      md: 64, // 1024px
      lg: 90, // 1440px
      xl: 120, // 1920px
    },
  },
};

export const lightTheme = {
  mainColors: {
    primary: 'rgb(255, 255, 255)',
    primaryAlpha: 'rgba(255, 255, 255, 0.6)',
    primaryDark: 'rgb(29,29,29)',
    secondary: 'rgb(242, 242, 242)',
    secondaryDark: 'rgb(120, 120, 120)',
    secondaryDarkAlpha: 'rgb(120, 120, 120)',
    border: 'rgb(29, 29, 29)',
    progressBar: 'rgb(29, 29, 29)',
    textColor: 'rgb(0, 0, 0)',
  },
  border: {
    borderDefault: '1px solid rgb(29,29,29)',
    borderSecondary: '1px solid rgb(196,196,196)',
    borderRadius: '0px',
    borderColor: 'rgb(29,29,29)',
  },
  statusColors: {
    primaryProfit: 'rgb(141, 197, 103)',
    secondaryProfit: 'rgb(243, 249, 241)',
    primaryLoss: 'rgb(206, 88, 102)',
    secondaryLoss: 'rgb(252, 240, 242)',
    warning: 'rgb(249,209,118)',
    neutral: 'rgb(74,194,238)',
  },
  otherColors: {
    black: 'rgb(0, 0, 0)',
    white: 'rgb(255, 255, 255)',
    grey: 'rgb(155, 155, 155)',
    red: 'rgb(244,67,54)',
    green: 'rgb(76,175,80)',
    logo: '#0B0B09',
    badge: 'rgb(230, 230, 230)',
    progressBar: 'rgba(230, 230, 230, 0.8)',
  },
  orderbookColors: {
    askDark: 'darkred',
    ask: 'rgb(244,67,54)',
    orderbook: 'darkgreen',
    orderbookLight: 'limegreen',
    hover: 'rgba(0, 0, 0, 0.2)',
  },
  logoColors: logoColorsLightMode,
  chartColors: {
    textColor: '#333333',
    axis: {
      domain: {
        line: {
          stroke: 'transparent',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#777777',
          strokeWidth: 1,
        },
        text: {},
      },
      legend: {
        text: {
          fontSize: 12,
        },
      },
    },
    grid: {
      line: {
        stroke: '#dddddd',
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fill: '#333333',
      },
    },
    labels: {
      text: {},
    },
    markers: {
      lineColor: '#000000',
      lineStrokeWidth: 1,
      text: {},
    },
    dots: {
      text: {},
    },
    tooltip: {
      container: {
        background: 'white',
        color: 'inherit',
        fontSize: 'inherit',
        borderRadius: '2px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
        padding: '5px 9px',
      },
      basic: {
        whiteSpace: 'pre',
        display: 'flex',
        alignItems: 'center',
      },
      chip: {
        marginRight: 7,
      },
      table: {},
      tableCell: {
        padding: '3px 5px',
      },
    },
    crosshair: {
      line: {
        stroke: '#000000',
        strokeWidth: 1,
        strokeOpacity: 0.75,
        strokeDasharray: '6 6',
      },
    },
    annotations: {
      text: {
        fontSize: 13,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      link: {
        stroke: '#000000',
        strokeWidth: 1,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      outline: {
        fill: 'none',
        stroke: '#000000',
        strokeWidth: 2,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      symbol: {
        fill: '#000000',
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
    },
  },
  ...globalTheme,
};

export const darkTheme = {
  mainColors: {
    primary: '#313131',
    primaryAlpha: '#3B4252',
    primaryDark: '#e5dfdf',
    secondary: '#313131',
    secondaryDark: '#313131',
    secondaryDarkAlpha: 'rgb(196, 196, 196)',
    border: 'rgb(29, 29, 29)',
    progressBar: '#e5dfdf',
    textColor: '#e5dfdf',
  },
  border: {
    borderDefault: '1px solid rgb(196, 196, 196)',
    borderSecondary: '1px solid rgb(196,196,196)',
    borderRadius: '0px',
    borderColor: 'rgb(196, 196, 196)',
  },
  statusColors: {
    primaryProfit: 'rgb(141, 197, 103)',
    secondaryProfit: 'rgb(243, 249, 241)',
    primaryLoss: 'rgb(206, 88, 102)',
    secondaryLoss: 'rgb(252, 240, 242)',
    warning: 'rgb(249,209,118)',
    neutral: 'rgb(74,194,238)',
  },
  otherColors: {
    black: 'rgb(0, 0, 0)',
    white: 'rgb(255, 255, 255)',
    grey: 'rgb(155, 155, 155)',
    red: 'rgb(244,67,54)',
    green: 'rgb(76,175,80)',
    logo: '#0B0B09',
    badge: 'black',
    progressBar: 'black',
  },
  orderbookColors: {
    askDark: 'darkred',
    ask: 'rgb(244,67,54)',
    orderbook: 'darkgreen',
    orderbookLight: 'limegreen',
    hover: 'rgba(0, 0, 0, 0.2)',
  },
  chartColors: {
    textColor: '#333333',
    axis: {
      domain: {
        line: {
          stroke: 'transparent',
          strokeWidth: 1,
        },
      },
      ticks: {
        line: {
          stroke: '#777777',
          strokeWidth: 1,
        },
        text: {
          textColor: 'white',
        },
      },
      legend: {
        text: {
          fontSize: 12,
        },
      },
    },
    grid: {
      line: {
        stroke: '#dddddd',
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fill: '#333333',
      },
    },
    labels: {
      text: {},
    },
    markers: {
      lineColor: '#000000',
      lineStrokeWidth: 1,
      text: {},
    },
    dots: {
      text: {},
    },
    tooltip: {
      container: {
        background: 'white',
        color: 'inherit',
        fontSize: 'inherit',
        borderRadius: '2px',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
        padding: '5px 9px',
      },
      basic: {
        whiteSpace: 'pre',
        display: 'flex',
        alignItems: 'center',
      },
      chip: {
        marginRight: 7,
      },
      table: {},
      tableCell: {
        padding: '3px 5px',
      },
    },
    crosshair: {
      line: {
        stroke: '#000000',
        strokeWidth: 1,
        strokeOpacity: 0.75,
        strokeDasharray: '6 6',
      },
    },
    annotations: {
      text: {
        fontSize: 13,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      link: {
        stroke: '#000000',
        strokeWidth: 1,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      outline: {
        fill: 'none',
        stroke: '#000000',
        strokeWidth: 2,
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
      symbol: {
        fill: '#000000',
        outlineWidth: 2,
        outlineColor: '#ffffff',
      },
    },
  },
  logoColors: logoColorsDarkMode,
  ...globalTheme,
};

export const Global = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    min-height: 100%;
  }

  html, body, form, fieldset, table, tr, td, img {
    font: 14px/1.4 monospace, sans-serif;
  }

  input, button, select, textarea, optgroup, option {
      font-family: inherit;
      font-size: inherit;
      font-style: inherit;
      font-weight: inherit;
  }
  
  body {
    margin: 0;
    min-height: 100%;
    background-color: ${props => props.theme.mainColors.secondary};
    color: ${props => props.theme.mainColors.textColor}
  }

  h1, h2, h3 {
    margin-bottom: ${lightTheme.spaceUnits.m};
    font-size: ${lightTheme.fontSizes.xxl};
    font-weight: bold;
    position: relative;
  }


  h2, h3 {
    padding-bottom: ${lightTheme.spaceUnits.xs};
    border-bottom : ${lightTheme.border.borderSecondary};
    margin-bottom: ${lightTheme.spaceUnits.xs};
  }

  h4 {
    font-size: ${lightTheme.fontSizes.xl};
    margin-bottom: ${lightTheme.spaceUnits.xs};
  }

  a {
    display: inline-flex;
    align-items: center;
    text-decoration: underline;
    cursor: pointer;
    color: ${props => props.theme.mainColors.textColor};
    transition: ${lightTheme.transition.defaultAll};
    :hover{
      opacity: 0.6;
    }
  }

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid ${lightTheme.mainColors.border};
    margin: ${lightTheme.spaceUnits.s} 0;
  }

  p {
    margin-bottom: ${lightTheme.spaceUnits.m};
  }
`;
