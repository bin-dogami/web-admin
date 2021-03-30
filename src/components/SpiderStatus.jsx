import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, Select, Radio, message } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
import styled, { createGlobalStyle } from 'styled-components';
import { SyncOutlined } from '@ant-design/icons';
import moment from 'moment'

const Wrapper = styled.div`

`

const all = {
  label: '全部',
  value: -1
}
const SpiderStatus = ({ onSearchBook }) => {
  const [popVisible, setPopVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(-1);
  const [statusList, setStatusList] = useState([]);
  const [statusList2, setStatusList2] = useState([]);
  const [data, setData] = useState([]);

  const onChangeStatus = id => e => {
    const status = e.target.value
    axios({
      url: `${baseUrl}fixdata/changeSpiderStatus`,
      method: 'post',
      data: {
        id,
        status
      },
      errorTitle: '删除错误',
    }).then((res) => {
      const result = res && res.data && res.data.data
      if (typeof result === 'string') {
        if (result === '') {
          const _data = JSON.parse(JSON.stringify(data))
          let _index = -1
          for (var index in _data) {
            if (_data[index].id === id) {
              _index = index
              break
            }
          }
          const item = _data[_index]
          const filter = statusList.filter(({ value }) => value == status)
          const statusText = filter.length ? filter[0].label : '出错了吧'
          const newItem = {}
          Object.assign(newItem, item, {
            status,
            statusText
          })
          _data[_index] = newItem
          setData(_data)
          message.success('设置成功')
        } else {
          message.success(result)
        }
      }
    })
  }

  const columns = [
    {
      title: '小说ID',
      dataIndex: 'id',
    },
    {
      title: '小说名称',
      width: 120,
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`${scanUrl}book/${record.id}`} target="_blank">{title}</a>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'statusText',
      render: (text, record) => {
        return (
          <span>{record.status} / {text}</span>
        )
      }
    },
    {
      title: '章i=0',
      dataIndex: 'allIndexEq0',
      render: (allIndexEq0, record) => {
        return (
          <span>{allIndexEq0 ? '是' : '否'}</span>
        )
      }
    },
    {
      title: '更改状态',
      width: 220,
      dataIndex: 'statusText',
      render: (text, record, index) => {
        const _statusList = JSON.parse(JSON.stringify(statusList))
        _statusList.pop()
        _statusList.forEach((item) => {
          item.disabled = item.id == record.id
        })
        return (
          <Radio.Group
            options={_statusList}
            onChange={onChangeStatus(record.id)}
            value={record.status}
            optionType="button"
            buttonStyle="solid"
            size="small"
          />
        )
      }
    },
    {
      title: '备注',
      width: 150,
      dataIndex: 'text',
    },
    {
      title: '更新时间',
      dataIndex: 'updatetime',
      render: (updatetime, record) => {
        return (
          moment(updatetime).format('YYYY-MM-DD HH:mm:ss')
        )
      }
    },
  ];

  const getList = (_status) => {
    try {
      setLoading(true)
      axios({
        url: `${baseUrl}fixdata/getSpiderList`,
        method: 'get',
        params: {
          status: _status || status
        },
        errorTitle: '获取错误',
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

  const getStatus = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/getSpiderStatus`,
        method: 'get',
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && Array.isArray(res.data.data) ? res.data.data : [];
        const data2 = JSON.parse(JSON.stringify(data))
        data2.unshift(all)
        setStatusList2(data2);
        data.forEach((item) => {
          item.value = +item.value
        })
        setStatusList(data);
      })
    } catch (e) {
      console.log(e)
    }
  };

  const onSwitchStatus = (e) => {
    setStatus(e.target.value)
  }


  useEffect(() => {
    getStatus()
  }, [])

  useEffect(() => {
    getList(status)
  }, [status])

  const rowKey = (record) => {
    return record.id
  }

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

  return (
    <Wrapper className="chunk" style={{ marginBottom: 30 }}>
      <div>
        <Button type="primary" onClick={() => setPopVisible(true)} style={{ marginRight: 15 }}>抓取状态</Button>
        <Button type="primary" style={{ marginRight: 15 }} onClick={onDetectIsSpidering}>在抓取?</Button>
        <Button type="primary" style={{ marginRight: 15 }} onClick={onSpiderAll}>抓取all</Button>
        <Button type="primary" style={{ marginRight: 15 }} onClick={onCancelIsSpidering}>中断抓取</Button>
      </div>
      <Modal width={1000} title="抓取状态列表" visible={popVisible} onOk={() => setPopVisible(false)} onCancel={() => setPopVisible(false)}>
        <Radio.Group
          options={statusList2}
          onChange={onSwitchStatus}
          value={status}
          optionType="button"
          buttonStyle="solid"
          style={{ marginBottom: 15, marginRight: 15 }}
        />
        <Button type="primary" onClick={() => getList()}><SyncOutlined spin={loading} /></Button>
        <Table dataSource={data} columns={columns} rowKey={rowKey} loading={loading} />
      </Modal>
    </Wrapper>
  )
}

export default SpiderStatus