import { Spin } from 'antd';
import styled from 'styled-components';

const Loading = styled(Spin)`
  display: flex !important;
  flex-direction: column !important;
  justify-content: center;
  height: 100%;
  width: 100%;
  position: absolute !important;
  z-index: 100000;

  .ant-spin-dot {
    margin: auto;
  }
`;

export default Loading;