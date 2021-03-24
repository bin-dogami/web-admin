import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Input, Button, Row, Col, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl } from '@/utils/index';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

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

const Iframe = styled.iframe`
  width: 100%;
  height: 500px;
`;

const FragmentFunctions = () => {
  const [seoLinks, setSeoLinks] = useState([])
  const [menuList, setMenuList] = useState([])
  const [dateMenus, setDateMenus] = useState([])

  const [bookList, setBookList] = useState([])
  const [dateBooks, setDateBooks] = useState([])

  const onSearchMenus = () => {
    if (dateMenus.length > 1) {
      try {
        axios({
          url: `${baseUrl}fixdata/getMenusByCreateDate`,
          method: 'get',
          params: {
            sDate: dateMenus[0],
            eDate: dateMenus[1]
          },
          errorTitle: '获取错误',
        }).then((res) => {
          const data = res && res.data && res.data.data
          if (Array.isArray(data)) {
            setMenuList(data)
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const onSearchBooks = () => {
    if (dateBooks.length > 1) {
      try {
        axios({
          url: `${baseUrl}fixdata/getBooksByCreateDate`,
          method: 'get',
          params: {
            sDate: dateBooks[0],
            eDate: dateBooks[1]
          },
          errorTitle: '获取错误',
        }).then((res) => {
          const data = res && res.data && res.data.data
          if (Array.isArray(data)) {
            setBookList(data)
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const onLinksChange = (e) => {
    setSeoLinks(e.target.value)
  }

  const onSeoSubmit = () => {
    if (isDev) {
      message.error('开发环境不能提交，因为id在生产环境应该不存在')
      return
    }

    const _seoLinks = seoLinks.trim()
    if (_seoLinks.length) {
      try {
        axios({
          url: `${baseUrl}fixdata/curlBaiduSeo`,
          method: 'post',
          data: {
            links: _seoLinks
          },
          errorTitle: '获取错误',
        }).then((res) => {
          const data = res && res.data && res.data.data
          if (typeof data === 'string') {
            Modal.info({
              content: data
            })
          } else {
            Modal.error({
              title: '有未知错误'
            })
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    const books = bookList.map(id => `https://m.zjjdxr.com/book/${id}`)
    const menus = menuList.map(id => `https://m.zjjdxr.com/page/${id}`)
    setSeoLinks(`${books.join('\n')}\n${menus.join('\n')}`.trim())
  }, [menuList, bookList])

  return (
    <Wrapper className="wrapper">
      <Menus name={'fragmentFunctions'} />
      <div className="chunk">
        <h2>提交百度收录</h2>
        <div className="content">
          <Form.Item label="目录查询">
            <RangePicker onChange={(date, dateString) => setDateMenus(dateString)} />
            <Button onClick={onSearchMenus} style={{ marginLeft: 15 }}>查询</Button>
          </Form.Item>
          <Form.Item label="书本查询">
            <RangePicker onChange={(date, dateString) => setDateBooks(dateString)} />
            <Button onClick={onSearchBooks} style={{ marginLeft: 15 }}>查询</Button>
          </Form.Item>
          <TextArea value={seoLinks} rows={10} onChange={onLinksChange} />
          <Button type="primary" onClick={onSeoSubmit} style={{ marginTop: 15 }}>提交</Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default FragmentFunctions;