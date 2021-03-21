import React, { useEffect, useState } from 'react';
import { Form, Radio, Input, Table, Button, message, Tooltip, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl, getHost } from '@/utils/index';
import ModifyAction from '@/components/ModifyAction.jsx'

import Menus from '@/components/Menu.jsx'

const Wrapper = styled.div`

  h2 {
    margin-bottom: 30px;
  }

  .search {
    margin-bottom: 20px;
  }

  .ant-input-number, .ant-input-affix-wrapper {
    width: 200px;
    margin-right: 30px;
  }

  button {
    margin-right: 30px;
  }
`;

const TumorClear = () => {
  const [useFix, setUseFix] = useState(1)
  const [types, setTypes] = useState([])
  const [host, setHost] = useState('')
  const [list, setList] = useState(null)
  const [type, setType] = useState('')
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [addUseFix, setAddUseFix] = useState(0)
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onShowCreate = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    try {
      setList(null)
      axios({
        url: `${baseUrl}fixdata/addTumor`,
        method: 'post',
        data: {
          type,
          text: text.trim(),
          host: getHost(url).trim(),
          useFix: addUseFix
        },
        errorTitle: '获取list错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (data) {
          message.error(data)
        } else {
          message.success('添加成功')
          onSearch(addUseFix)
        }
      })

    } catch (e) {
      console.log(e)
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onSearch = (useFix) => {
    setUseFix(useFix)
    try {
      setList(null)
      axios({
        url: `${baseUrl}fixdata/getTumorList`,
        method: 'get',
        params: {
          useFix,
          host: getHost(host),
        },
        errorTitle: '获取list错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
        }
        if (data && typeof data === 'object') {
          setList(data)
        } else {
          setList(null)
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onDelete = id => e => {
    try {
      setList(null)
      axios({
        url: `${baseUrl}fixdata/deleteTumor`,
        method: 'Post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (data) {
          message.error(data)
        } else {
          message.success('删除成功')
          onSearch(useFix)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onFixPagesContent = (text, name, novelId) => () => {
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
          message.success('修复成功')
        } else {
          message.error(typeof data === 'string' ? data : '有未知错误')
        }
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
      title: '类型',
      dataIndex: 'type',
      width: 180,
      render: (type, record) => {
        const _t = types.filter(({ value }) => value === type)
        return type.length ? (_t.length ? _t[0].label : '类型列表没获取到') : '没有类型，数据有问题'
      }
    },
    {
      title: '文本',
      dataIndex: 'text',

    },
    {
      title: '域名',
      dataIndex: 'host',
    },
    {
      title: '操作',
      dataIndex: 'handler',
      width: 160,
      render: (text, record) => {
        return (
          <>
            <Tooltip title={<Button type="primary" onClick={onDelete(record.id)} >删除</Button>} placement="right" trigger="click">
              <a style={{ display: 'inline-block', marginRight: 15 }}>删除</a>
            </Tooltip>
            {/* 暂时只支持文本直接替换的 */}
            {useFix && record.type === 'just_replace' ? (
              <span style={{ color: '#1890ff', cursor: 'pointer' }}>
                <ModifyAction id={record.text} html="修复章节内容" name={"fixPagesContent"} modifyFnName={onFixPagesContent} />
              </span>
            ) : null}
          </>
        )
      }
    },
  ];

  const onGetTypes = () => {
    try {
      setList(null)
      axios({
        url: `${baseUrl}fixdata/getTumorTypes`,
        method: 'get',
        errorTitle: '获取types错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        const _types = !data ? [] : Object.keys(data).map((type) => {
          return {
            label: data[type],
            value: type
          }
        })
        setTypes(_types)
        _types.length && setType(_types[0].value)
      })

    } catch (e) {
      console.log(e)
    }
  }
  useEffect(() => {
    onGetTypes()
  }, [])

  useEffect(() => {
    onSearch(useFix)
    setAddUseFix(useFix)
  }, [useFix])

  const rowKey = (record) => {
    return record.id
  }

  const options = [
    {
      label: '修复的时候用',
      value: 1
    },
    {
      label: '抓取的时候用',
      value: 0
    },
  ]

  const onChange = (e) => {
    const value = e.target.value
    setUseFix(value)
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'tumorClear'} />
      <h1>内容清理器</h1>
      <div className="search">
        <Form.Item label="查询">
          <Input allowClear value={host} onChange={e => setHost(e.target.value)} style={{ marginBottom: 20 }} placeholder="输入url" />
          <Button type="primary" onClick={onSearch} >查询</Button>
          <Button type="primary" onClick={onShowCreate} >添加</Button>
          <Radio.Group
            options={options}
            onChange={onChange}
            value={useFix}
            optionType="button"
            buttonStyle="solid"
            style={{ marginLeft: 20 }}
          />
        </Form.Item>
      </div>
      <Table dataSource={list} columns={columns} rowKey={rowKey} pagination={{ pageSize: 100 }} />
      <Modal title="添加" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form.Item label="类型">
          <Radio.Group value={type} onChange={e => setType(e.target.value)} options={types} optionType="button" />
        </Form.Item>
        <Form.Item label="文本">
          <Input allowClear value={text} onChange={e => setText(e.target.value)} placeholder="输入文本" />
        </Form.Item>
        <Form.Item label="url">
          <Input allowClear value={url} onChange={e => setUrl(e.target.value)} placeholder="输入url" />
        </Form.Item>
        <Form.Item label="是否用于修复">
          <Radio.Group
            options={options}
            onChange={e => setAddUseFix(e.target.value)}
            value={addUseFix}
            optionType="button"
            buttonStyle="solid"
            style={{ marginLeft: 20 }}
          />
        </Form.Item>
      </Modal>
    </Wrapper>
  );
};

export default TumorClear;