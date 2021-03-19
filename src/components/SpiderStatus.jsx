import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, Select, Radio } from 'antd';
import axios from '@/utils/axios';
import { baseUrl } from '@/utils/index';

const all = {
  label: '全部',
  value: -1
}
const SpiderStatus = () => {
  const [popVisible, setPopVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(-1);
  const [statusList, setStatusList] = useState([]);
  const [statusList2, setStatusList2] = useState([]);
  const [data, setData] = useState([]);

  console.log(status, statusList)

  const onChangeStatus = id => status => {
    axios({
      url: `${baseUrl}fixdata/changeSpiderStatus`,
      method: 'post',
      data: {
        id,
        status
      },
      errorTitle: '删除错误',
    }).then((res) => {
      const data = res && res.data && res.data.data
      if (typeof data === 'string') {
        if (data === '') {
          getList()
          return
        }
        Modal.info({ content: data })
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
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a href={`http://m.zjjdxr.com/book/${record.id}`} target="_blank">{title}</a>
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
      title: '更改状态',
      dataIndex: 'statusText',
      render: (text, record, index) => {
        return (
          <Select style={{ width: 100 }} value={record.status} options={statusList} onChange={onChangeStatus(record.id)} />
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

  return (
    <div className="chunk" style={{ minHeight: 30 }}>
      <h2><Button type="primary" shape="round" size={'small'} onClick={() => setPopVisible(true)}>抓取状态</Button></h2>
      <Modal width={800} title="抓取状态列表" visible={popVisible} onOk={() => setPopVisible(false)} onCancel={() => setPopVisible(false)}>
        <Radio.Group
          options={statusList2}
          onChange={onSwitchStatus}
          value={status}
          optionType="button"
          buttonStyle="solid"
          style={{ marginBottom: 15 }}
        />
        <Table dataSource={data} columns={columns} rowKey={rowKey} loading={loading} />
      </Modal>
    </div>
  )
}

export default SpiderStatus