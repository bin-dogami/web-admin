import React, { useState } from 'react';
import { Menu } from 'antd';
import styled from 'styled-components';

const Menus = ({ name }) => {
  return (
    <Menu mode="horizontal" selectedKeys={[name]} style={{ marginBottom: 30 }}>
      <Menu.Item key="book">
        <a href="/">书本抓取</a>
      </Menu.Item>
      <Menu.Item key="fieldsSetting">
        <a href="/fieldsSetting">字段更改</a>
      </Menu.Item>
      <Menu.Item key="spiderError">
        <a href="/spiderError">抓取错误</a>
      </Menu.Item>
      <Menu.Item key="tumorClear">
        <a href="/tumorClear">内容清理器</a>
      </Menu.Item>
      <Menu.Item key="submitSeo">
        <a href="/submitSeo">百度收录</a>
      </Menu.Item>
      <Menu.Item key="visitors">
        <a href="/visitors">用户访问</a>
      </Menu.Item>
      <Menu.Item key="fragmentFunctions">
        <a href="/fragmentFunctions">零碎功能</a>
      </Menu.Item>
    </Menu>
  )
}

export default Menus