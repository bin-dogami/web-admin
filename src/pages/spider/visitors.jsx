import React, { useState, useEffect, useRef } from 'react';
import { Form, DatePicker, Input, Button, Table, Radio, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl, scanUrl, copyText } from '@/utils/index';
import { Spin } from 'antd';
import Menus from '@/components/Menu.jsx'
import moment from 'moment';

// const { RangePicker } = DatePicker;
// const { TextArea } = Input;

const Wrapper = styled.div`
  padding-bottom: 50px;
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

const Visitors = () => {
  const [loading, setLoading] = useState(false)
  const [collectLoading, setCollectLoading] = useState(false)
  const [data, setData] = useState([])

  const collectLogs = () => {
    if (collectLoading) {
      return
    }
    try {
      setCollectLoading(true)
      axios({
        url: `${baseUrl}fixdata/collectNginxLogs`,
        method: 'get',
        params: {
          // skip: (_skip - 1) * _size,
          // size: _size,
        },
        errorTitle: '获取错误',
      }).then((res) => {
        setCollectLoading(false)
        const data = res && res.data && res.data.data
        message.info(typeof data === 'string' ? data : '收集完成')
        getList()
      })
    } catch (e) {
      setCollectLoading(false)
      console.log(e)
    }
  }

  const getList = () => {
    if (loading) {
      return
    }
    try {
      setLoading(true)
      axios({
        url: `${baseUrl}fixdata/getVisitors`,
        method: 'get',
        params: {
          // skip: (_skip - 1) * _size,
          // size: _size,
        },
        errorTitle: '获取错误',
      }).then((res) => {
        setLoading(false)
        // const [data, total] = res && res.data && Array.isArray(res.data.data) && res.data.data.length > 1 ? res.data.data : [[], 0];
        setData(res && res.data && Array.isArray(res.data.data) ? res.data.data : []);
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 70,
      render (text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: '访问时间',
      dataIndex: 'ctime',
    },
    {
      title: 'host',
      dataIndex: 'host',
    },
    {
      title: '访问页面',
      dataIndex: 'url',
      render: (url) => {
        return (
          url.replace('GET ', '').replace(' HTTP/1.1', '')
        )
      }
    },
    {
      title: '爬虫',
      dataIndex: 'spider',
    },
    {
      title: 'ip',
      dataIndex: 'ip',
    },
    {
      title: 'referer',
      dataIndex: 'referer',
    },
    {
      title: 'use_agent',
      dataIndex: 'use_agent',
    },
    {
      title: 'http_x_forwarded_for',
      dataIndex: 'http_x_forwarded_for',
    },
    {
      title: '响应状态',
      dataIndex: 'status',
    },
    {
      title: '主体长度',
      dataIndex: 'bytes',
    },
    {
      title: '后台user',
      dataIndex: 'user',
    },
  ]

  // const pagination = {
  //   current: skip,
  //   pageSize: size,
  //   total: total,
  //   showTotal: total => `共 ${total} 条`,
  //   showSizeChanger: true,
  // };

  // const onChange = (e) => {
  //   const desc = e.target.value
  //   setIsDesc(desc)
  //   getList(1, size, desc)
  // }

  // const onTableChange = (pagination) => {
  //   getList(pagination.current || 1, pagination.pageSize || size, isDesc);
  // };

  useEffect(() => {
    getList()
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'visitors'} />
      <div className="chunk" style={{ marginBottom: 40 }}>
        <Button loading={collectLoading} type="primary" onClick={collectLogs} style={{ marginRight: 15 }}>收集日志到数据库里</Button>
      </div>
      <div className="chunk">
        <h2>查看用户访问设备信息</h2>
        <div className="content">
          <Form.Item label="查询">
            {/* <RangePicker
              defaultValue={dateMenus}
              format={dateFormat}
              onChange={(date, dateString) => setDateMenus(dateString)}
            /> */}
            {/* <Radio.Group
              options={onlineOptions}
              onChange={e => setMOnline(e.target.value)}
              value={mOnline}
              optionType="button"
              buttonStyle="solid"
              style={{ marginLeft: 15 }}
            /> */}
            <Button loading={loading} type="primary" onClick={() => getList()} style={{ marginRight: 15 }}>查询</Button>
          </Form.Item>
          <Table
            dataSource={data}
            loading={loading}
            columns={columns}
            rowKey={rowKey}
          />
        </div>
      </div>
    </Wrapper >
  )
};

export default Visitors;