import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Input, Button, Tooltip } from 'antd';
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
  const onModifyFieldValue = (id, field, value) => () => {
    if (value !== undefined) {
      modifyFnName(id, field, value)()
      return;
    }
    if (fieldValue.trim().length) {
      modifyFnName(id, field, fieldValue)()
    }
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
  } else if (name === 'deleteLastMenuLostError') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >这就改好了？</Button>
    )
  } else if (name === 'batchModifyIndexs') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >确定要重排此目录之后的所有目录的index？</Button>
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
    <Wrapper title={htmlModifyBookField} placement="right" onVisibleChange={onVisibleChange} trigger="click" overlayStyle={{ maxWidth: 400 }}>
      <span className="btn">{html || <FormOutlined />}</span>
    </Wrapper>
  )
}

export default ModifyAction