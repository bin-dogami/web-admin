import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Input, Button, Tooltip, Select } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import styled, { createGlobalStyle } from 'styled-components';

const Wrapper = styled(Tooltip)`
  .btn {
    color: #1890ff;
    display: inline;
    cursor: pointer;
  }

  .modifyField {
    padding: 8px;
    white-space: nowrap;

    input {
      margin-right: 0;
      width: auto;
    }
  }
`

const ModifyAction = ({ id, name, html, status, defaultValue, modifyFnName }) => {
  const [fieldValue, setFieldValue] = useState(defaultValue || '')
  const onChangeFieldValue = e => {
    const { value } = e.target;
    setFieldValue(value)
  }
  const onVisibleChange = (visible) => {
    !visible && setFieldValue('')
  }
  // value 不传就用 fieldValue，所以一般不需要传
  const onModifyFieldValue = (id, field, value) => () => {
    if (value !== undefined) {
      modifyFnName(id, field, value)()
    } else {
      if (fieldValue.trim().length) {
        modifyFnName(id, field, fieldValue)()
      }
    }
  }

  // 小说list 里内容清理
  const [privateValue, setPrivateValue] = useState('')
  const onClearAllContents = () => {
    modifyFnName(id, privateValue)()
  }

  let dom = null
  if (['deleteMenu', 'deleteBook'].includes(name)) {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >确认要删除</Button>
    )
  } else if (name === 'isComplete') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, name, !status)} >{status ? '更改为#连载#' : '更改为#完本#'}</Button>
    )
  } else if (name === 'setRecommend') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, name, !status)} >{status ? '取消推荐' : '设置为推荐'}</Button>
    )
  } else if (name === 'isSpiderComplete') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, name, !status)} >{status ? '更改为#未抓取完成#' : '更改为#已抓取完成#'}</Button>
    )
  } else if (name === 'deleteErrorData') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >这就改好了？</Button>
    )
  } else if (name === 'batchModifyIndexs') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >确定要重排此目录之后的所有目录的index？</Button>
    )
  } else if (name === 'completeSpiderAllMenus') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >设置全本且全部抓完了？</Button>
    )
  } else if (name === 'respider') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >再次抓取</Button>
    )
  } else if (name === 'clearBookContents') {
    dom = (
      <>
        <Select options={status} value={privateValue} onChange={value => setPrivateValue(value)} style={{ width: 500 }} dropdownClassName="clearDropper" dropdownStyle={{ zIndex: 10000 }} />
        <Button type="primary" onClick={onClearAllContents} >清理所有章节内容</Button>
      </>
    )
  } else if (name === 'fixPagesContent') {
    dom = (
      <>
        <Input allowClear value={fieldValue} style={{ width: 'auto' }} onChange={onChangeFieldValue} placeholder="输入书本id" />
        <Button type="primary" onClick={onModifyFieldValue(id)} >确定要修复这本书的所有章节内容？</Button>
      </>
    )
  } else {
    dom = (
      <>
        <Input allowClear value={fieldValue} style={{ width: 'auto' }} onChange={onChangeFieldValue} placeholder="输入值" />
        <Button type="primary" onClick={onModifyFieldValue(id, name)} >更改</Button>
      </>
    )
  }

  const htmlModifyBookField = (
    <div className="modifyField">
      {dom}
    </div>
  )

  return (
    <Wrapper title={htmlModifyBookField} placement={["clearBookContents"].includes(name) ? "left" : "right"} onVisibleChange={onVisibleChange} trigger="click" overlayStyle={{ maxWidth: 800 }}>
      <span className="btn" style={{ color: '#1890ff', cursor: 'pointer' }}>{html || <FormOutlined />}</span>
    </Wrapper>
  )
}

export default ModifyAction