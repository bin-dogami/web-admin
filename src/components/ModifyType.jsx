import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Modal, Button, message, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';

const Wrapper = styled(Modal)`
  .ant-radio-button-wrapper {
    margin-bottom: 5px;
  }
`

const Modify = styled(Button)`
  span {
    margin-right: 0!important;
  }
`

const ModifyType = ({ id, type, onSearchBook }) => {
  const [loading, setLoading] = useState(false)

  const [value, setValue] = useState(`${type}`)
  const [typeOptions, setTypeOptions] = useState([])
  const [visible, setVisible] = useState(false)
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

  const modifyType = () => {
    if (loading) {
      return
    }
    setLoading(true)
    try {
      axios({
        url: `${baseUrl}fixdata/modifyType`,
        method: 'post',
        data: {
          id,
          typeid: value,
          typename: typeOptions.filter((item) => value === item.value)[0].label
        },
        errorTitle: '修改错误',
      }).then((res) => {
        setLoading(false)
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message[data === '' ? 'success' : 'error'](data === '' ? '修改成功' : data)
          if (data === '') {
            closePop()
            onSearchBook(id)
          }
        } else {
          message.error('修改失败')
        }
      })
    } catch (e) {
      console.log(e)
      setLoading(false)
      message.error('修改失败: ' + e)
    }
  }

  useEffect(() => {
    visible && getTypes()
  }, [visible])

  return (
    <>
      <Modify onClick={() => setVisible(true)}>修改</Modify>
      <Wrapper
        width={500}
        title="修改分类"
        visible={visible}
        onCancel={closePop}
        onOk={modifyType}
        confirmLoading={loading}
        okText="确定"
      >
        <Radio.Group
          options={typeOptions}
          value={value}
          onChange={e => setValue(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          style={{ marginBottom: 15 }}
        />
      </Wrapper>
    </>
  )
}

export default ModifyType