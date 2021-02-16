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

  .hasRecommend {
    filter: grayscale(1);
  }
`;

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
`;

const Book = () => {
  const [form] = Form.useForm();
  const [url, setUrl] = useState('');
  const [isRecommend, setIsRecommend] = useState(false);
  const [action, setAction] = useState('');
  const [data, setData] = useState({});
  const [inserting, setInserting] = useState(false);
  const [insertMPRes, setInsertMPRes] = useState('');
  const [lastPage, setLastPage] = useState('');

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
        recommend: +isRecommend
      },
      errorTitle: '抓取错误',
    }).then((res) => {
      const data = res.data.data;
      if (!data.url) {
        data.url = url;
      }
      setData(data);
      // @TODO: 再建一个表记录抓取情况，写入抓取开始结束时间点，方便知道已经抓取完了，再把错误信息写进去
    })
  };

  const onValuesChange = (changedValues) => {
    setIsRecommend(false)
  }

  const onSetRecommend = () => {
    setIsRecommend(!isRecommend)
  }

  return (
    <Wrapper>
      <Form
        name="basic"
        form={form}
        initialValues={{ remember: true }}
        onValuesChange={onValuesChange}
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
          <Button type="primary" onClick={onSetRecommend} style={{ marginRight: '30px', background: '#e60101', borderColor: '#e60101' }} className={{ hasRecommend: isRecommend }}>
            {isRecommend ? '取消推荐' : '设置为推荐'}
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
      <Iframe src={url}></Iframe>
    </Wrapper>
  );
};

export default Book;