import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Table } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, copyText } from '@/utils/index';

const Last100Books = ({ onSearchBook, onSpider }) => {
  const [data, setData] = useState([])

  const onClick = id => {
    onSearchBook(id)
    copyText(id)
  }

  const columns = [
    {
      title: '小说ID',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <span onClick={() => onClick(id)}>{id}</span>
        )
      }
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
      title: '章节数',
      dataIndex: 'menusLen',
    },
    {
      title: '来源',
      dataIndex: 'from',
      render: (from, record) => {
        return (
          <>
            <a href={from} target="_blank">看看</a>
            <span onClick={e => copyText(e.target.previousElementSibling.getAttribute('href'))} style={{ marginLeft: 15 }}>复制链接</span>
          </>
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <>
            <span onClick={onSpider(record.from)} style={{ marginLeft: 15 }}>再次抓取</span>
          </>
        )
      }
    }
  ]

  const getList = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/getLastBookList`,
        method: 'get',
        errorTitle: '获取书本错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        setData(Array.isArray(data) ? data : [])
      })

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getList()
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <div className="chunk">
      <h2>最新抓取的小说list</h2>
      <div className="content">
        <Table dataSource={data} size={'small'} pagination={{ pageSize: 5 }} columns={columns} rowKey={rowKey} />
      </div>
    </div>
  )
}

export default Last100Books