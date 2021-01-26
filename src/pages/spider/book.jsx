import React, { useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';

import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl } from '@/utils/index';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;


const Wrapper = styled.div`
  max-width: 900px;
  margin: 50px;
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
`;

const Book = () => {
  const [form] = Form.useForm();
  const [url, setUrl] = useState('');
  const [action, setAction] = useState('');
  const [data, setData] = useState({});
  const [inserting, setInserting] = useState(false);
  const [insertMPRes, setInsertMPRes] = useState('');
  const [lastPage, setLastPage] = useState('');

  // const insertMenusAndPages = async (id, title, thumb, from, menus) => {
  //   setInserting(true);
  //   setInsertMPRes('开始插入目录...');
  //   axios({
  //     url: `${baseUrl}getbook/insertMenuAndPages`,
  //     method: 'post',
  //     data: {
  //       menus: menus.slice(0, 10),
  //       id,
  //       title,
  //       thumb,
  //       from,
  //     },
  //     errorTitle: '抓取错误',
  //   }).then((res) => {
  //     const data = res.data.data;
  //     setInserting(false);
  //     setInsertMPRes(`写入完成，成功插入 ${data.successLen} 条目录。失败章节${data.failedIndex.length}条：${data.failedIndex.length ? data.failedIndex.join(', ') : '无'}。`);
  //     setLastPage(`最新章节：${data.lastPage}`)
  //   }).catch(() => {
  //     setInserting(false);
  //     setInsertMPRes('写入失败');
  //   })
  // }

  // const getMenus = (id, title, thumb, url) => {
  //   axios({
  //     url: `${baseUrl}getbook/getMenus`,
  //     method: 'post',
  //     data: {
  //       url,
  //     },
  //     errorTitle: '抓取错误',
  //   }).then((res) => {
  //     const data = res.data.data;
  //     if (data.length) {
  //       insertMenusAndPages(id, title, thumb, url, data);
  //     }
  //   })
  // }

  const onSearch = isSpider => () => {
    const action = isSpider ? 'spider' : 'view';
    let url = form.getFieldValue('url')
    if (!url) {
      return;
    }
    url = url.trim();
    setUrl(url);
    setAction(isSpider ? '抓取' : '查询');

    setData({});
    setInsertMPRes('');
    setLastPage('');
    axios({
      url: `${baseUrl}getbook/${action}`,
      method: 'post',
      data: {
        url,
      },
      errorTitle: '抓取错误',
    }).then((res) => {
      const data = res.data.data;
      if (!data.url) {
        data.url = url;
      }
      setData(data);
      if (data && data.id) {
        // getMenus(data.id, data.title, data.thumb, url);
      }
    })
  };

  return (
    <Wrapper>
      <Form
        name="basic"
        form={form}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label="获取书信息"
          name="url"
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={onSearch(false)} style={{ marginRight: '30px' }}>
            查询
          </Button>
          <Button type="primary" onClick={onSearch(true)} style={{ marginRight: '30px' }}>
            抓取书信息及目录信息
          </Button>
        </Form.Item>
      </Form>
      <div>
        <h2>{action}</h2>
        {Object.keys(data).map((key) => (
          <Row key={key}>
            <Col span={6}>{key}</Col>
            <Col span={18}>{data[key]}</Col>
          </Row>
        ))}
      </div>
      <br /><br />
      <div>
        {insertMPRes || ''}
        <br />
        <div dangerouslySetInnerHTML={{ __html: lastPage || '' }}></div>
        <br />
        {inserting ? <Spin indicator={antIcon} /> : null}
      </div>
      <br /><br />
      {/* <Iframe src={url}></Iframe> */}
    </Wrapper>
  );
};

export default Book;