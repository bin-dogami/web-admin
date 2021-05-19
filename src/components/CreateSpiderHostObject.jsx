import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Modal, Table, Form, Select, Input, Upload, message, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, getHost, onCopyHref } from '@/utils/index';
const { Search } = Input;

const Wrapper = styled(Modal)`
  .ant-radio-button-wrapper {
    margin-bottom: 5px;
  }
`

const CreateSpiderHostObject = ({ visible, setVisible }) => {
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false)
  // const [host, sethost] = useState('')
  // const [title, settitle] = useState('')
  // const [description, setdescription] = useState('')
  // const [author, setauthor] = useState('')
  // const [thumb, setthumb] = useState('')
  // const [type, settype] = useState('')
  const initialValues = {
    host: '',
    title: '',
    description: '',
    author: '',
    thumb: '',
    type: '',
    menus: '',
    mname: '',
    content: '',
  }

  const [data, setData] = useState([])

  const onChangeHost = e => {
    const host = getHost(e.target.value)
    // sethost(host)
    form.setFieldsValue({ host })
  }

  const getAllStructors = () => {
    try {
      axios({
        url: `${baseUrl}fixdata2/getAllSpiderHostObj`,
        method: 'get',
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (Array.isArray(data)) {
          setData(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const closePop = () => {
    setVisible(false)
  }

  const onOk = () => {
    form.validateFields().then(values => {
      console.log(values)
      try {
        axios({
          url: `${baseUrl}fixdata2/addSpiderHostObj`,
          method: 'post',
          data: values,
          errorTitle: '添加错误',
        }).then((res) => {
          const data = res && res.data && res.data.data;
          if (typeof data === 'object') {
            if ('message' in data) {
              message.error(`添加错误：${data.message}`)
            } else {
              message.success('添加成功')
              getAllStructors()
            }
          } else {
            message.error('添加错误')
          }
        })
      } catch (e) {
        console.log(e)
      }
    }).catch(() => {
      //
    })
  }

  useEffect(() => {
    visible && getAllStructors()
  }, [visible])

  const modify = (record) => {
    const o = {}
    Object.keys(initialValues).forEach((key) => {
      key in record && (o[key] = record[key])
    })
    form.setFieldsValue(o)
  }

  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: 'host',
      dataIndex: 'host',
    },
    {
      title: 'author',
      dataIndex: 'author',
    },
    {
      title: 'description',
      dataIndex: 'description',
    },
    {
      title: 'type',
      dataIndex: 'type',
    },
    {
      title: 'thumb',
      dataIndex: 'thumb',
    },
    {
      title: '章节标题',
      dataIndex: 'mname',
    },
    {
      title: '章节内容',
      dataIndex: 'content',
    },
    {
      title: '操作',
      width: 100,
      render: (k, record) => {
        return (
          <>
            <a onClick={() => modify(record)}>修改/复制</a>
          </>
        )
      }
    },
  ]

  const rowKey = (record) => {
    return record.id
  }

  return (
    <Wrapper
      width={800}
      title="添加要抓取的网站的dom结构"
      visible={visible}
      onCancel={closePop}
      onOk={onOk}
      confirmLoading={creating}
      okText="确定"
    >
      <Form colon={false} form={form} initialValues={initialValues} labelCol={{ span: 4 }}>
        <Form.Item
          label="host"
          name="host"
          rules={[{ required: true }]}
        >
          <Input placeholder="请输入url" onChange={onChangeHost} />
        </Form.Item>
        <Form.Item
          label="title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input placeholder="title selector" />
        </Form.Item>
        <Form.Item
          label="author"
          name="author"
          rules={[{ required: true }]}
        >
          <Input placeholder="author selector" />
        </Form.Item>
        <Form.Item
          label="type"
          name="type"
          rules={[{ required: true }]}
        >
          <Input placeholder="type selector" />
        </Form.Item>
        <Form.Item
          label="description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input placeholder="description selector" />
        </Form.Item>
        <Form.Item
          label="thumb"
          name="thumb"
          rules={[{ required: true }]}
        >
          <Input placeholder="thumb selector" />
        </Form.Item>
        <Form.Item
          label="menus"
          name="menus"
          rules={[{ required: true }]}
        >
          <Input placeholder="menus selector" />
        </Form.Item>
        <Form.Item
          label="mname"
          name="mname"
          rules={[{ required: true }]}
        >
          <Input placeholder="mname selector" />
        </Form.Item>
        <Form.Item
          label="content"
          name="content"
          rules={[{ required: true }]}
        >
          <Input placeholder="content selector" />
        </Form.Item>
      </Form>
      <Table dataSource={data} columns={columns} rowKey={rowKey} />
    </Wrapper >
  )
}

export default CreateSpiderHostObject