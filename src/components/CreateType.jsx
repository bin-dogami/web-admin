import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Modal, Form, Select, Input, Upload, message, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
const { Search } = Input;

const Wrapper = styled(Modal)`
  .ant-radio-button-wrapper {
    margin-bottom: 5px;
  }
`

const CreateType = ({ visible, setVisible }) => {
  const [creating, setCreating] = useState(false)

  const [typeName, setTypeName] = useState('')
  const [typeOptions, setTypeOptions] = useState([])
  const getTypes = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/getTypes`,
        method: 'get',
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (Array.isArray(data)) {
          setTypeOptions(data.map(({ id, name }) => ({
            value: `${id}`,
            label: name
          })))
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const closePop = () => {
    setVisible(false)
  }

  const createType = () => {
    setCreating(true)
    try {
      axios({
        url: `${baseUrl}fixdata/createType`,
        method: 'post',
        data: {
          typeName: typeName.trim()
        },
        errorTitle: '创建错误',
      }).then((res) => {
        setCreating(false)
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message[data === '' ? 'success' : 'error'](data === '' ? '创建成功' : data)
          if (data === '') {
            setTypeName('')
            getTypes()
          }
        } else {
          message.error('创建失败')
        }
      })
    } catch (e) {
      console.log(e)
      setCreating(false)
      message.error('创建失败: ' + e)
    }
  }

  const onOk = () => {
    if (typeName.trim().length) {
      createType()
    } else {
      message.error('分类名是必填的')
    }
  }

  useEffect(() => {
    visible && getTypes()
  }, [visible])

  return (
    <Wrapper
      width={500}
      title="增加一个分类"
      visible={visible}
      onCancel={closePop}
      onOk={onOk}
      confirmLoading={creating}
      okText="确定"
    >
      <Radio.Group
        options={typeOptions}
        optionType="button"
        buttonStyle="solid"
        style={{ marginBottom: 15 }}
      />
      <Form colon={false}>
        <Form.Item
          label="分类名"
        >
          <Input placeholder="请输入分类名" value={typeName} onChange={e => setTypeName(e.target.value)} />
        </Form.Item>
      </Form>
    </Wrapper>
  )
}

export default CreateType