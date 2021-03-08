import React, { useEffect, useState } from 'react';
import { Table, Tooltip, message } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl } from '@/utils/index';

import Menus from '@/components/Menu.jsx'
import ModifyAction from '@/components/ModifyAction.jsx'

const Wrapper = styled.div`

  h2 {
    margin-bottom: 30px;
  }
`;

const LastMenuLost = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getList = () => {
    try {
      setLoading(true)
      axios({
        url: `${baseUrl}fixdata/getLostLastMenus`,
        method: 'get',
        errorTitle: '抓取错误',
      }).then((res) => {
        setLoading(false)
        const data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
        setData(data);
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  const onDelete = (id) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/deleteLastMenuLostError`,
        method: 'post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        message.success(typeof data === 'string' ? data : '删除失败')
        getList()
      })

    } catch (e) {
      console.log(e)
    }
  }


  const columns = [
    {
      title: '小说ID',
      dataIndex: 'id',
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`http://m.zjjdxr.com/book/${record.id}`} target="_blank">{title}</a>
        )
      }
    },
    {
      title: '上一次的目录Id',
      dataIndex: 'menuId',
    },
    {
      title: '错误说明',
      dataIndex: 'info',
    },
    {
      title: '操作',
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <ModifyAction id={record.id} html="删除" name={"deleteLastMenuLostError"} modifyFnName={onDelete} />
        )
      }
    },
  ];

  useEffect(() => {
    getList()
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'lastMenuLost'} />
      <h2>上一次抓取的最后的目录这次抓取不到了</h2>
      <Table dataSource={data} columns={columns} loading={loading} rowKey={rowKey} />
    </Wrapper>
  );
};

export default LastMenuLost;