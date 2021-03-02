import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Table, Modal, message } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, copyText } from '@/utils/index';
import {
  SyncOutlined,
} from '@ant-design/icons';

import styled, { createGlobalStyle } from 'styled-components';
const Wrapper = styled.div`
  .chunk h2 {
    margin-bottom: 0;
  }
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    button {
      margin-left: 15px;
      margin-right: 0;
    }
  }
`

const Last100Books = ({ onSearchBook, onSpider }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

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
    if (loading) {
      return
    }
    setLoading(true)
    try {
      axios({
        url: `${baseUrl}fixdata/getLastBookList`,
        method: 'get',
        errorTitle: '获取书本错误',
      }).then((res) => {
        setLoading(false)
        const data = res && res.data && res.data.data
        setData(Array.isArray(data) ? data : [])
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  }

  const onDetectIsSpidering = () => {
    try {
      axios({
        url: `${baseUrl}getbook/detectWhoIsSpidering`,
        method: 'get',
        errorTitle: '探查是否有书在抓取中错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        Modal.info({ title: typeof data === 'string' ? (data || '没有书在抓取中') : '我也不知道咋回事' })
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onCancelIsSpidering = () => {
    try {
      axios({
        url: `${baseUrl}getbook/setAllStopSpidering`,
        method: 'post',
        errorTitle: '取消所有抓取状态错误',
      }).then((res) => {
        // const data = res && res.data && res.data.data
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onInitSpiderData = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/initSpiderData`,
        method: 'post',
        errorTitle: '初始化spider数据错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onSpiderAll = () => {
    message.info('开始抓取全部书了')
    try {
      axios({
        url: `${baseUrl}getbook/spiderAll`,
        method: 'post',
        errorTitle: '抓取全部书错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        Modal.info({ title: typeof data === 'string' ? data : '我也不知道咋回事' })
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
    <Wrapper>
      <div className="chunk">
        <div className="flex">
          <h2>最新抓取的小说list</h2>
          <div>
            {/*  用完注释掉吧 */}
            {/* <Button onClick={onInitSpiderData}>初始化spider表数据</Button> */}
            <Button onClick={onDetectIsSpidering}>是否有书在抓取中</Button>
            <Button onClick={onCancelIsSpidering}>取消所有抓取状态</Button>
            <Button onClick={onSpiderAll}>抓取所有书</Button>
            <Button disabled={loading} onClick={() => getList()}><SyncOutlined spin={loading} /></Button>
          </div>
        </div>
        <div className="content">
          <Table dataSource={data} size={'small'} pagination={{ pageSize: 5 }} loading={loading} columns={columns} rowKey={rowKey} />
        </div>
      </div>
    </Wrapper>
  )
}

export default Last100Books