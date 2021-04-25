import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';

import Menus from '@/components/Menu.jsx'
import ModifyAction from '@/components/ModifyAction.jsx'

const Wrapper = styled.div`

  h3 {
    margin: 0 0 30px 20px;
  }
`;

const ContentInvalid = () => {
  const [data, setData] = useState([]);

  const [skip, setSkip] = useState(1)
  const [size, setSize] = useState(100)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const onDelete = id => e => {
    e.preventDefault()

    try {
      axios({
        url: `${baseUrl}fixdata/deleteInvalidContent`,
        method: 'post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        message.success(data === '' ? '删除成功' : (typeof data === 'string' ? data : '删除失败'))
        data === '' && getList(skip, size)
      })

    } catch (e) {
      console.log(e)
    }
  }

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: 'mId',
      dataIndex: 'key',
    },
    {
      title: '小说ID',
      dataIndex: 'novelId',
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`${scanUrl}book/${record.novelId}`} target="_blank">{title}</a>
        )
      }
    },
    {
      title: '备注',
      dataIndex: 'text',
    },
    {
      title: '操作',
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <a onClick={onDelete(record.id)}>删除</a>
        )
      }
    },
  ];

  const pagination = {
    current: skip,
    pageSize: size,
    total: total,
    showTotal: total => `共 ${total} 条`,
    showSizeChanger: true,
  };

  const onTableChange = (pagination) => {
    getList(pagination.current || 1, pagination.pageSize || size);
  };

  const getList = (_skip, _size) => {
    if (loading) {
      return
    }
    setSkip(_skip)
    setSize(_size)
    setLoading(true)
    try {
      axios({
        url: `${baseUrl}fixdata/getContentInvalid`,
        method: 'get',
        params: {
          skip: (_skip - 1) * _size,
          size: _size,
        },
        errorTitle: '抓取错误',
      }).then((res) => {
        setLoading(false)
        const [data, total] = res && res.data && Array.isArray(res.data.data) && res.data.data.length > 1 ? res.data.data : [[], 0];
        setTotal(total)
        setData(Array.isArray(data) ? data : [])
      })

    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  useEffect(() => {
    getList(skip, size)
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper>
      <h3>内容正在手打中</h3>
      <Table dataSource={data} columns={columns} rowKey={rowKey} pagination={pagination} onChange={onTableChange} loading={loading} />
    </Wrapper>
  );
};

export default ContentInvalid;