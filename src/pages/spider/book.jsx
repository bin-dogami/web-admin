import React, { useState } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl } from '@/utils/index';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Menus from '@/components/Menu.jsx'

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

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

`;

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
`;

const defaultNum = 5
const Book = () => {
  const [form] = Form.useForm();
  const [url, setUrl] = useState('');
  const [isRecommend, setIsRecommend] = useState(false);
  const [mnum, setMnum] = useState(isDev ? defaultNum : '');
  const [action, setAction] = useState('');
  const [data, setData] = useState({});
  const [inserting, setInserting] = useState(false);
  const [insertMPRes, setInsertMPRes] = useState('');
  const [lastPage, setLastPage] = useState('');

  const onSpiderNewMenus = () => {
    try {
      // axios({
      //   url: `${baseUrl}getbook/spiderBooksNewMenus`,
      //   method: 'post',
      //   data: {},
      //   errorTitle: '所有书新章节抓取错误',
      // })
    } catch (error) {
      console.log(error)
    }
  }

  const onSearch = isSpider => () => {
    try {
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
          mnum,
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
    } catch (error) {
      console.log(error)
    }
  };

  const onValuesChange = (changedValues) => {
    setIsRecommend(false)
  }

  const onSetRecommend = () => {
    setIsRecommend(!isRecommend)
  }

  const onSetMnum = () => {
    setMnum(mnum === defaultNum ? '' : defaultNum)
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'book'} />
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
          <Input allowClear />
        </Form.Item>
      </Form>
      <div className="flex">
        <div>
          <Button type="primary" onClick={onSearch(false)} style={{ marginRight: '30px' }}>
            查询
          </Button>
          <Button type="primary" onClick={onSpiderNewMenus} style={{ marginRight: '30px' }}>
            所有书新章节抓取
          </Button>
          <Button type="primary" onClick={onSearch(true)} style={{ marginRight: '30px' }}>
            抓取书信息及目录信息
          </Button>
          <Button type="primary" onClick={onSetRecommend} style={{ marginRight: '30px', background: '#e60101', borderColor: '#e60101' }} className={{ hasRecommend: isRecommend }}>
            {isRecommend ? '取消推荐' : '设置为推荐'}
          </Button>
          <Button type="primary" onClick={onSetMnum} style={{ marginRight: '30px', background: '#e60101', borderColor: '#e60101' }} className={{ hasRecommend: mnum === '' }}>
            {mnum ? '去设置抓取全部目录' : `去设置抓取前${defaultNum}个目录`}
          </Button>
        </div>
        <a href="/tumorClear" target="_blank">内容清理器</a>
      </div>
      <div style={{ marginTop: 30 }}>
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