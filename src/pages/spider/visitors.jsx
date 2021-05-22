import React, { useState, useEffect, useRef } from 'react';
import { Form, DatePicker, Input, Button, Table, Radio, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl, scanUrl, copyText } from '@/utils/index';
import { Spin } from 'antd';
import Menus from '@/components/Menu.jsx'
import moment from 'moment';

const { RangePicker } = DatePicker;

const Wrapper = styled.div`
  padding-bottom: 50px;
  .chunk {
    margin-bottom: 30px;
  }

  h2 {
    margin-bottom: 20px;
    padding-left: 10px;
    border-left: 3px solid #f7700f;
    height: 18px;
    line-height: 18px;
    font-size: 16px;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const NoWrap = styled.div`
  p {
    white-space: nowrap;
    margin: 0;
  }
`

const dateFormat = 'YYYY-MM-DD'
const startDate = moment().subtract(0, 'd')
const endDate = moment().add(1, 'd')
const hostOptions = [
  {
    label: '全部',
    value: '',
  },
  {
    label: 'm',
    value: 'm',
  },
  {
    label: 'admin',
    value: 'admin',
  },
]
const spiderOptions = [
  {
    label: '全部',
    value: '1',
  },
  {
    label: '只看spider',
    value: '2',
  },
  {
    label: '不看spider',
    value: '3',
  },
]

const Visitors = () => {
  const [loading, setLoading] = useState(false)
  const [collectLoading, setCollectLoading] = useState(false)
  const [date, setDate] = useState([moment(startDate, dateFormat), moment(endDate, dateFormat)])
  const [host, sethost] = useState('m')
  const [spider, setSpider] = useState('2')
  const [skip, setSkip] = useState(1)
  const [size, setSize] = useState(100)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState([])
  const [spiderFilters, setSpiderFilters] = useState([])
  const [ipFilters, setIpFilters] = useState([])
  const [noApi, setNoApi] = useState('1')
  const [responseStatus, setResponseStatus] = useState('1')

  const collectLogs = () => {
    if (collectLoading) {
      return
    }
    try {
      setCollectLoading(true)
      axios({
        url: `${baseUrl}fixdata/collectNginxLogs`,
        method: 'get',
        // params: {
        // },
        errorTitle: '获取错误',
      }).then((res) => {
        setCollectLoading(false)
        const data = res && res.data && res.data.data
        message.info(typeof data === 'string' ? data : '收集完成')
        getList(skip, size, host, spider)
      })
    } catch (e) {
      setCollectLoading(false)
      console.log(e)
    }
  }

  const getList = (_skip, _size, host, spider) => {
    if (loading) {
      return
    }
    setSkip(_skip)
    setSize(_size)
    try {
      setLoading(true)
      axios({
        url: `${baseUrl}fixdata/getVisitorsList`,
        method: 'get',
        params: {
          skip: (_skip - 1) * _size,
          size: _size,
          sDate: moment(date[0]).format(dateFormat),
          eDate: moment(date[1]).format(dateFormat),
          host,
          spider,
          responseStatus
        },
        errorTitle: '获取错误',
      }).then((res) => {
        setLoading(false)
        const [data, count] = res && res.data && Array.isArray(res.data.data) && res.data.data.length > 1 ? res.data.data : [[], 0];
        const fData = noApi === '1' ? data.filter(({ url }) => !url.includes('/scan/') && !url.includes('/fixdata/')) : data
        setData(fData)
        if (count.length) {
          setTotal(+count[0].total)
        }

        const _data = Array.from(new Set(fData.map(({ spider }) => spider))).map((spider) => ({
          text: spider,
          value: spider,
        }))
        setSpiderFilters(_data)
        const _data2 = Array.from(new Set(fData.map(({ ip }) => ip))).map((ip) => ({
          text: ip,
          value: ip,
        }))
        setIpFilters(_data2)
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 70,
      render(text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    // {
    //   title: 'id',
    //   dataIndex: 'id',
    // },
    {
      title: '访问时间',
      dataIndex: 'ctime',
      render: (ctime) => {
        return (
          <NoWrap>
            {ctime.split(' ').map((t, key) => <p key={key}>{t}</p>)}
          </NoWrap>
        )
      }
    },
    {
      title: 'host',
      dataIndex: 'host',
    },
    {
      title: '访问页面',
      dataIndex: 'url',
      render: (url) => {
        return (
          url.replace('GET ', '').replace(' HTTP/1.1', '')
        )
      }
    },
    {
      title: '爬虫',
      dataIndex: 'spider',
      filters: spiderFilters,
      onFilter: (value, record) => record.spider === value,
      sortDirections: ['descend'],
    },
    {
      title: 'ip',
      dataIndex: 'ip',
      filters: ipFilters,
      onFilter: (value, record) => record.ip === value,
      sortDirections: ['descend'],
    },
    {
      title: 'referer',
      dataIndex: 'referer',
    },
    {
      title: 'use_agent',
      dataIndex: 'use_agent',
    },
    {
      title: 'http_x_forwarded_for',
      dataIndex: 'http_x_forwarded_for',
    },
    {
      title: '响应状态',
      dataIndex: 'status',
    },
    {
      title: '主体长度',
      dataIndex: 'bytes',
    },
    {
      title: '后台user',
      dataIndex: 'user',
    },
  ]

  const pagination = {
    position: ['topLeft', 'bottomLeft'],
    pageSizeOptions: [50, 100, 500, 1000, 3000],
    current: skip,
    pageSize: size,
    total: total,
    showTotal: total => `共 ${total} 条`,
    showSizeChanger: true,
  };

  const onChange = (e) => {
    const host = e.target.value
    sethost(host)
    getList(1, size, host, spider)
  }

  const onChangeSpider = (e) => {
    const spider = e.target.value
    setSpider(spider)
    getList(1, size, host, spider)
  }

  const onChangeNoApi = (e) => {
    setNoApi(e.target.value)
  }

  const onChangeResponseStatus = (e) => {
    setResponseStatus(e.target.value)
  }

  const onTableChange = (pagination) => {
    if (pagination.current !== skip || pagination.pageSize !== size) {
      getList(pagination.current || 1, pagination.pageSize || size, host, spider);
    }
  };

  useEffect(() => {
    getList(skip, size, host, spider)
  }, [])

  const onSearch = () => {
    getList(skip, size, host, spider)
  }

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'visitors'} />
      <div className="chunk" style={{ marginBottom: 40 }}>
        <Button loading={collectLoading} type="primary" onClick={collectLogs} style={{ marginRight: 15 }}>收集日志到数据库里</Button>
      </div>
      <div className="chunk">
        <h2>查看用户访问设备信息</h2>
        <div className="content">
          <Form.Item label="查询">
            <RangePicker
              defaultValue={date}
              format={dateFormat}
              onChange={(date, dateString) => setDate(dateString)}
            />
            <Radio.Group
              options={hostOptions}
              onChange={onChange}
              value={host}
              optionType="button"
              buttonStyle="solid"
              style={{ marginLeft: 15 }}
            />
            <Radio.Group
              options={spiderOptions}
              onChange={onChangeSpider}
              value={spider}
              optionType="button"
              buttonStyle="solid"
              style={{ marginLeft: 15 }}
            />
            <Radio.Group
              options={[{ value: '0', label: '全看' }, { value: '1', label: '不看api' }]}
              onChange={onChangeNoApi}
              value={noApi}
              optionType="button"
              buttonStyle="solid"
              style={{ marginLeft: 15 }}
            />
            <Radio.Group
              options={[{ value: '0', label: '全看' }, { value: '1', label: '只看200' }]}
              onChange={onChangeResponseStatus}
              value={responseStatus}
              optionType="button"
              buttonStyle="solid"
              style={{ marginLeft: 15 }}
            />
            <Button loading={loading} type="primary" onClick={onSearch} style={{ marginLeft: 15 }}>查询</Button>
          </Form.Item>
          <Table
            dataSource={data}
            loading={loading}
            columns={columns}
            pagination={pagination}
            onChange={onTableChange}
            rowKey={rowKey}
          />
        </div>
      </div>
    </Wrapper >
  )
};

export default Visitors;