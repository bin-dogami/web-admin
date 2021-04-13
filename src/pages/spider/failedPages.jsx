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
          isSingleReget: 1
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
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`${scanUrl}book/${record.id}`} target="_blank">{title}</a>
        )
      }
    },
    {
      title: '失败章节数量',
      dataIndex: 'count',
      // render: (count, record, index) => {
      //   return (
      //     <Tooltip title={record.mIds || '加载中...'} color="orange" onVisibleChange={onVisibleChange(record, index)}>
      //       <a>{count}</a>
      //     </Tooltip>
      //   )
      // }
    },
    {
      title: '操作',
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <a>暂无</a>
          // <a onClick={onReGet(record.id)}>重新请求</a>
        )
      }
    },
  ];

  const [subData, setSubData] = useState([])
  const onExpand = (expanded, record) => {
    if (expanded) {
      try {
        setSubData([])
        axios({
          url: `${baseUrl}getbook/getErrorMenuIds`,
          method: 'get',
          params: {
            id: record.id,
            type: 'page_lost'
          },
          errorTitle: '抓取错误',
        }).then((res) => {
          const _data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
          setSubData(_data)
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
  // const onModifyIndex = (id, errorId, value) => () => {
  //   try {
  //     axios({
  //       url: `${baseUrl}fixdata/modifyMenuIndex`,
  //       method: 'post',
  //       data: {
  //         id,
  //         value,
  //         errorId
  //       },
  //       errorTitle: '修改错误',
  //     }).then((res) => {
  //       const data = res && res.data && res.data.data
  //       if (typeof data === 'string' && !data.length) {
  //         message.success('修改成功')
  //         onExpand(true, { id: errorId })
  //       } else {
  //         message.error(typeof data === 'string' && data.length ? data : '修改错误')
  //       }
  //     })

  //   } catch (e) {
  //     console.log(e)
  //   }
  // }
  const expandedRowRender = () => {
    const columns = [
      {
        title: '目录ID',
        dataIndex: 'menuId',
        width: 100
      },
      {
        title: '目录原始名',
        dataIndex: 'moriginalname',
        width: 200
      },
      {
        title: 'index',
        dataIndex: 'menuIndex',
        render: (menuIndex, record) => {
          return (
            <>
              <span style={{ marginRight: 20 }}>{menuIndex}</span>
              {/* <ModifyAction id={record.menuId} name={record.id} modifyFnName={onModifyIndex} /> */}
            </>
          )
        },
        width: 150
      },
      {
        title: '说明',
        dataIndex: 'info',
      },
    ]

    const rowKey = (record) => {
      return record.id
    }

    return <Table columns={columns} dataSource={subData} pagination={false} rowKey={rowKey} />;
  }

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
      <h3>抓取失败列表</h3>
      <Table dataSource={data} columns={columns} rowKey={rowKey} expandable={{ expandedRowRender, onExpand }} />
    </Wrapper>
  );
};

export default FailedPages;