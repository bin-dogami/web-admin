import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Table, Modal, message, Radio } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, copyText, onCopyHref } from '@/utils/index';
import styled, { createGlobalStyle } from 'styled-components';
import ModifyAction from '@/components/ModifyAction.jsx'
import moment from 'moment'

const GlobalStyle = createGlobalStyle`
  .clearDropper .ant-select-item-option-content {
    white-space: normal;
  }
`

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

  .link {
    color: #1ca9bb;

    &:link {
      color: #1890ff;
    }
  }
`

const descOptions = [
  {
    label: 'id降序',
    value: '1',
  },
  {
    label: 'id升序',
    value: '2',
  },
]

const completeOptions = [
  {
    label: '全部',
    value: '1',
  },
  {
    label: '完本',
    value: '2',
  },
  {
    label: '非完本',
    value: '3',
  },
]

const completeSpiderOptions = [
  {
    label: '全部',
    value: '1',
  },
  {
    label: '已抓完',
    value: '2',
  },
  {
    label: '未抓完',
    value: '3',
  },
]

const BookList = ({ onSearchBook, onSpider, setBookInfo, setMenusPopVisible }) => {
  const [data, setData] = useState([])
  const [skip, setSkip] = useState(1)
  const [size, setSize] = useState(5)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [desc, setDesc] = useState('1')
  const [complete, setComplete] = useState('1')
  const [completeSpider, setCompleteSpider] = useState('1')
  const [tumorList, setTumorList] = useState([])

  const getList = (_skip, _size) => {
    if (loading) {
      return
    }
    setSkip(_skip)
    setSize(_size)
    setLoading(true)
    try {
      axios({
        url: `${baseUrl}fixdata/getBookList`,
        method: 'get',
        params: {
          desc,
          skip: (_skip - 1) * _size,
          size: _size,
          complete,
          completeSpider
        },
        errorTitle: '获取书本错误',
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
            getList(skip, size)
          } else {
            message.error(data)
          }
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onViewMenus = (bookInfo) => () => {
    setBookInfo(bookInfo)
    setMenusPopVisible(2)
  }

  const onFixPagesContent = (novelId, text) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/fixPagesContent`,
        method: 'Post',
        data: {
          text,
          id: novelId,
        },
        errorTitle: '修复错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (data === '') {
          Modal.success({
            title: '修复成功'
          })
        } else {
          Modal.error({
            title: typeof data === 'string' ? data : '有未知错误'
          })
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 50,
      render(text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    {
      title: '小说ID',
      dataIndex: 'id',
      width: 100,
      fixed: 'left',
      render: (id, record) => {
        return (
          <>
            <span style={{ marginRight: 10 }} onClick={() => onSearchBook(id)}>{id}</span>
            <a onClick={() => copyText(id)}>复制</a>
          </>
        )
      }
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      fixed: 'left',
      width: 100,
      render: (title, record) => {
        return (
          <a className="link" href={`${scanUrl}book/${record.id}`} target="_blank">{title} {record.isComplete ? `（${record.isSpiderComplete ? '抓' : ''}完）` : ''}</a>
        )
      }
    },
    {
      title: '是否推荐',
      width: 80,
      dataIndex: 'isRecommend',
      render: (isRecommend, record) => {
        return (
          <>
            <span>{isRecommend ? '是' : '否'}</span>
          </>
        )
      }
    },
    {
      title: '上线否',
      width: 60,
      dataIndex: 'isOnline',
      render: (isOnline, record) => {
        return (
          <>
            <span>{isOnline ? '上了' : '没上'}</span>
          </>
        )
      }
    },
    {
      title: '所有index=0',
      width: 80,
      dataIndex: 'allIndexEq0',
    },
    {
      title: '抓取状态',
      width: 80,
      dataIndex: 'spiderStatus',
    },
    {
      title: '章节数',
      width: 60,
      dataIndex: 'menusLen',
    },
    {
      title: '来源',
      width: 80,
      dataIndex: 'from',
      render: (from, record) => {
        return (
          <>
            {record.spiderCode === 4 ? '没有' : <a data-href={from} onClick={onCopyHref}>复制链接</a>}
          </>
        )
      }
    },
    {
      title: '创建时间',
      width: 100,
      dataIndex: 'ctime',
      render: (ctime, record) => {
        return (
          moment(ctime).format('YYYY-MM-DD HH:mm')
        )
      }
    },
    {
      title: '更新时间',
      width: 100,
      dataIndex: 'updatetime',
      render: (updatetime, record) => {
        return (
          moment(updatetime).format('YYYY-MM-DD')
        )
      }
    },
    {
      title: '操作',
      width: 120,
      dataIndex: 'handler',
      render: (text, record) => {
        return (
          <>
            <a className="viewMenus" style={{ display: 'inline-block', marginRight: '15px' }} type="primary" shape="round" size={'middle'} onClick={onViewMenus(record)}>目录list</a>
            <a className="viewMenus" style={{ display: 'inline-block', marginRight: '15px', color: '#1ca9bb' }} href={`/menuList/${record.id}`} target="_blank">目录页</a>
            {record.spiderCode === 4 ? null :
              <>
                <div style={{ display: 'inline-block', marginRight: '15px' }}>
                  <ModifyAction id={record.id} name={"completeSpiderAllMenus"} modifyFnName={onCompleteMenusAll} html="全抓了" />
                </div>
                <ModifyAction id={record.from} name={"respider"} modifyFnName={onSpider} html="再抓" />
              </>
            }
            <div style={{ display: 'inline-block', marginRight: '15px' }}>
              <ModifyAction id={record.id} status={tumorList} name={"clearBookContents"} modifyFnName={onFixPagesContent} html="清理" />
            </div>
          </>
        )
      }
    }
  ]

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

  const getTumorList = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/getTumorList`,
        method: 'get',
        params: {
          useFix: 1,
          host: '',
        },
        errorTitle: '获取list错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
        }
        if (data && Array.isArray(data)) {
          const arr = Array.from(new Set(data.map(({ text }) => text)))
          setTumorList(arr.map((text) => ({
            label: text,
            value: text,
          })))
        } else {
          setTumorList(null)
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    getTumorList()
    getList(skip, size)
  }, [])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper>
      <GlobalStyle />
      <div className="chunk">
        <h2>小说list</h2>
        <div style={{ margin: '15px 0 0' }}>
          <Radio.Group
            options={descOptions}
            onChange={e => setDesc(e.target.value)}
            value={desc}
            optionType="button"
            buttonStyle="solid"
            style={{ marginRight: 10, marginBottom: 15 }}
          />
          <Radio.Group
            options={completeOptions}
            onChange={e => setComplete(e.target.value)}
            value={complete}
            optionType="button"
            buttonStyle="solid"
            style={{ marginRight: 10, marginBottom: 15 }}
          />
          <Radio.Group
            options={completeSpiderOptions}
            onChange={e => setCompleteSpider(e.target.value)}
            value={completeSpider}
            optionType="button"
            buttonStyle="solid"
            style={{ marginRight: 10, marginBottom: 15 }}
          />
          <Button disabled={loading} onClick={() => getList(skip, size)}>查询</Button>
        </div>
        <div className="content">
          <Table dataSource={data} pagination={pagination} onChange={onTableChange} loading={loading} columns={columns} rowKey={rowKey} scroll={{ x: 400 }} />
        </div>
      </div>
    </Wrapper>
  )
}

export default BookList