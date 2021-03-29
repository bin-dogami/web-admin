import React, { useState, useEffect, useRef } from 'react';
import { Form, DatePicker, Input, Button, Table, Radio, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl, scanUrl, copyText } from '@/utils/index';
import { Spin } from 'antd';
import Menus from '@/components/Menu.jsx'
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

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
  const [data, setData] = useState([])

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
      title: 'host',
      dataIndex: 'host',
    },
    {
      title: '哪家',
      dataIndex: 'spider',
    },
    {
      title: 'referer',
      dataIndex: 'referer',
    },
    {
      title: 'user-agent',
      dataIndex: 'useragent',
    },
    {
      title: 'sec-ch-ua',
      dataIndex: 'secchua',
    },
    {
      title: 'sec-ch-ua-mobile',
      dataIndex: 'secchuamobile',
    },
    {
      title: '全部信息',
      dataIndex: 'headers',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      width: 100,
      render: (ctime, record) => {
        return (
          moment(ctime).format('YYYY-MM-DD')
        )
      }
    }
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
      <div className="chunk">
        <h2>查看用户访问设备信息</h2>
        <div className="content">
          {/* <Form.Item label="目录查询"> */}
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
            {/* <Button onClick={onSearchMenus} style={{ marginLeft: 15 }}>查询</Button><br /> */}
          {/* </Form.Item> */}
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