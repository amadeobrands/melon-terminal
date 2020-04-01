import styled from 'styled-components';

export const Chart = styled.div`
  height: 397px;
  color: ${props => props.theme.mainColors.primary};
`;

export const chartColorsLight = {
  textColor: 'black',
  axis: {
    ticks: {
      line: {
        stroke: 'red',
        strokeWidth: 5,
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
      stroke: 'black',
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
  crosshair: {
    line: {
      stroke: '#000000',
      strokeWidth: 1,
      strokeOpacity: 0.75,
      strokeDasharray: '6 6',
    },
  },
};

export const chartColorsDark = {
  textColor: 'rgb(155, 155, 155)',
  axis: {
    ticks: {
      line: {
        stroke: 'rgb(155, 155, 155)',
        strokeWidth: 1,
      },
      // text: {
      //   textColor: 'white',
      // },
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

  labels: {
    text: {},
  },
  markers: {
    lineColor: 'red',
    lineStrokeWidth: 1,
    text: {},
  },
  dots: {
    text: {},
  },
  crosshair: {
    line: {
      stroke: '#000000',
      strokeWidth: 1,
      strokeOpacity: 0.75,
      strokeDasharray: '6 6',
    },
  },
};
