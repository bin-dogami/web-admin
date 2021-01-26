import React, { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl } from '@/utils/index';

const Wrapper = styled.div`
  max-width: 900px;
  margin: 50px;
`;

const Menu = () => {
  const [data, setData] = useState([]);

  const onFinish = async values => {
    const url = values.url.trim();
    if (!url) {
      return;
    }

    axios({
      url: `${baseUrl}spider`,
      method: 'post',
      data: {
        url,
      },
      errorTitle: '抓取错误',
    }).then((res) => {
      const data = res.data.data;
      if (Array.isArray(data)) {
        setData(data);
      } else {
        setData([JSON.stringify(data)])
      }
    })
  };

  return (
    <Wrapper>
      <Form
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        <Form.Item
          label="获取目录"
          name="url"
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            查询
          </Button>
        </Form.Item>
      </Form>
      <div>
        {data.map((str, key) => (
          <p key={key}>{str}</p>
        ))}
      </div>
    </Wrapper>
  );
};

export default Menu;