import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Input, Button, Row, Col, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl } from '@/utils/index';
import { Spin } from 'antd';
import Menus from '@/components/Menu.jsx'

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Wrapper = styled.div`
  .chunk {
    margin-bottom: 30px;
  }

  h2 {
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 3px solid #f7700f;
    height: 18px;
    line-height: 18px;
    font-size: 16px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const FragmentFunctions = () => {

  return (
    <Wrapper className="wrapper">
      <Menus name={'fragmentFunctions'} />
      <div className="chunk">
        <h2>功能待开发</h2>
        <div className="content">
        </div>
      </div>
    </Wrapper>
  );
};

export default FragmentFunctions;