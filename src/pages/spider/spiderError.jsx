import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import styled from 'styled-components';
import Menus from '@/components/Menu.jsx'
import FailedPages from './failedPages'
import LastMenuLost from './lastMenuLost'
import Last3MenusIndexEq0 from './last3MenusIndexEq0'
import RepeatsMenu from './repeatsMenu'
const { TabPane } = Tabs;

const Wrapper = styled.div`
  h2 {
    margin-bottom: 30px;
  }
`;

const SpiderError = () => {

  return (
    <Wrapper className="wrapper">
      <Menus name={'spiderError'} />
      <h2>error表错误信息</h2>
      <Tabs defaultActiveKey="1" type="card">
        <TabPane tab="最后三章index为0" key="1">
          <Last3MenusIndexEq0 />
        </TabPane>
        <TabPane tab="最后一章lost" key="2">
          <LastMenuLost />
        </TabPane>
        <TabPane tab="index重复" key="3">
          <RepeatsMenu />
        </TabPane>
        <TabPane tab="抓取失败章节" key="4">
          <FailedPages />
        </TabPane>
      </Tabs>
    </Wrapper>
  );
};

export default SpiderError;