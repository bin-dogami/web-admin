import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Table, Modal, message, Select } from 'antd';
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
    align-items: top;
    margin-bottom: 20px;

    button {
      margin: 0 0 15px 15px;
    }
  }
`

const booksType = [
  {
    label: '未完降序',
    value: 1,
  },
  {
    label: '未完升序',
    value: 2,
  },
  {
    label: '完本降序',
    value: 3,
  },
  {
    label: '完本升序',
    value: 4,
  }
]

const Last100Books = ({ onSearchBook, onSpider }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(1)

  const onClick = id => {
    onSearchBook(id)
    copyText(id)
  }

  const onCompleteMenusAll = (id) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/setBookSpiderComplete`,
        method: 'post',
        data: {
          id
        },
        errorTitle: '设置全本及抓取完毕操作错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          if (data === '') {
            message.success('设置成功')
          } else {
            message.error(data)
          }
        }
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
          <span onClick={() => onClick(id)}>{id}</span>
        )
      }
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`http://m.zjjdxr.com/book/${record.id}`} target="_blank">{title} {record.isComplete ? `（${record.isSpiderComplete ? '抓' : ''}完）` : ''}</a>
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
            <a onClick={onCompleteMenusAll(record.id)}>全本且抓完了</a>
            <a onClick={onSpider(record.from)} style={{ marginLeft: 20 }}>再次抓取</a>
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
        params: {
          order
        },
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

  useEffect(() => {
    getList()
  }, [order])

  const onDetectIsSpidering = () => {
    try {
      axios({
        url: `${baseUrl}getbook/detectWhoIsSpidering`,
        method: 'get',
        errorTitle: '探查是否有书在抓取中错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        const title = typeof data === 'string' ? (data || '没有书在抓取中') : '我也不知道咋回事'
        Modal.info({
          title, onOk: () => {
            const match = title.match(/#(\d+)#/)
            if (Array.isArray(match) && match.length > 1) {
              onSearchBook(+match[1])
            }
          }
        })
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onCancelIsSpidering = () => {
    try {
      axios({
        url: `${baseUrl}getbook/setCurrentSpideringStop`,
        method: 'post',
        errorTitle: '取消所有抓取状态错误',
      }).then((res) => {
        // const data = res && res.data && res.data.data
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
        const title = typeof data === 'string' ? data : '我也不知道咋回事'
        Modal.info({
          title, onOk: () => {
            const match = title.match(/#(\d+)#/)
            if (Array.isArray(match) && match.length > 1) {
              onSearchBook(+match[1])
            }
          }
        })
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
            <Select options={booksType} value={order} onChange={value => setOrder(value)} style={{ width: '100px' }} />
            <Button onClick={onDetectIsSpidering}>在抓取?</Button>
            <Button onClick={onCancelIsSpidering}>中断抓取</Button>
            <Button onClick={onSpiderAll}>抓取all</Button>
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