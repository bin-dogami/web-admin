import React, { useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl } from '@/utils/index';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Menus from '@/components/Menu.jsx'

const Wrapper = styled.div`
  button {
    margin-bottom: 20px;
  }

  .hasRecommend {
    filter: grayscale(1);
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .blank {
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 100px;
    }
  }
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
`;

const FragmentFunctions = () => {
  const [form] = Form.useForm();

  return (
    <Wrapper className="wrapper">
      <Menus name={'fragmentFunctions'} />
      <div className="blank">
      </div>
    </Wrapper>
  );
};

export default FragmentFunctions;