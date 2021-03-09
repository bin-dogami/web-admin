import React, { useState } from 'react';
import { Menu } from 'antd';
import styled from 'styled-components';

const Menus = ({ name }) => {
  return (
    <Menu mode="horizontal" selectedKeys={[name]} style={{ marginBottom: 40 }}>
      <Menu.Item key="book">
        <a href="/">书本抓取</a>
      </Menu.Item>
      <Menu.Item key="fieldsSetting">
        <a href="/fieldsSetting">字段更改</a>
      </Menu.Item>
      <Menu.Item key="lastMenuLost">
        <a href="/lastMenuLost">上一个目录丢失</a>
      </Menu.Item>
      <Menu.Item key="repeatsMenu">
        <a href="/repeatsMenu">重复index</a>
      </Menu.Item>
      <Menu.Item key="failedPages">
        <a href="/failedPages">失败章节</a>
      </Menu.Item>
      <Menu.Item key="tumorClear">
        <a href="/tumorClear">内容清理器</a>
      </Menu.Item>
      <Menu.Item key="fragmentFunctions">
        <a href="/fragmentFunctions">零碎功能</a>
      </Menu.Item>
    </Menu>
  )
}

export default Menus