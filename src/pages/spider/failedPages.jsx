import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl } from '@/utils/index';

import Menus from '@/components/Menu.jsx'

const Wrapper = styled.div`
  max-width: 900px;
  margin: 20px 50px;

  h2 {
    margin-bottom: 30px;
  }
`;

const FailedPages = () => {
  const [data, setData] = useState([]);

  const onReGet = id => e => {
    e.preventDefault()

    try {
      axios({
        url: `${baseUrl}getbook/reGetPages`,
        method: 'get',
        params: {
          id,
        },
        errorTitle: '抓取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        message.success(typeof data === 'string' ? data : '修复失败')
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onVisibleChange = (record, index) => (visible) => {

    const id = record.id

    if (!visible || record.mIds) {
      return
    }

    try {
      axios({
        url: `${baseUrl}getbook/getFailedMenuIds`,
        method: 'get',
        params: {
          id,
        },
        errorTitle: '抓取错误',
      }).then((res) => {
        const _data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
        const newData = JSON.parse(JSON.stringify(data))
        newData[index].mIds = _data.length ? `前20个目录ID：${_data.join(', ')}` : '啥也没有'
        newData[index].key = `${id}0${id}`
        setData(newData)
      })
    } catch (e) {
      console.log(e)
    }
  }

  const columns = [
    {
      title: '小说ID',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <a href={`http://m.zjjdxr.com/book/${id}`} target="_blank">{id}</a>
        )
      }
    },
    {
      title: '小说名称',
      dataIndex: 'title'
    },
    {
      title: '失败章节数量',
      dataIndex: 'count',
      render: (count, record, index) => {
        return (
          <Tooltip title={record.mIds || '加载中...'} color="orange" onVisibleChange={onVisibleChange(record, index)}>
            <a>{count}</a>
          </Tooltip>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <a onClick={onReGet(record.id)}>重新请求</a>
        )
      }
    },
  ];

  const getList = () => {
    try {
      axios({
        url: `${baseUrl}getbook/getFailedPages`,
        method: 'get',
        errorTitle: '抓取错误',
      }).then((res) => {
        const data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
        setData(data);
      })

    } catch (e) {
      console.log(e)
    }
  };

  useEffect(() => {
    getList()
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper>
      <Menus name={'failedPages'} />
      <h2>抓取失败列表</h2>
      <Table dataSource={data} columns={columns} rowKey={rowKey} />
    </Wrapper>
  );
};

export default FailedPages;