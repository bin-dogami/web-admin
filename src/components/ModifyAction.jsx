import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Input, Button, Tooltip } from 'antd';
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
      margin-right: 15px;
      width: 180px;
    }
  }
`

const ModifyAction = ({ id, name, html, status, modifyFnName }) => {
  const [fieldValue, setFieldValue] = useState('')
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
  if (name === 'deleteBook') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, '', '')} >确认要删除</Button>
    )
  } else if (name === 'isComplete') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, name, !status)} >{status ? '更改为#连载#' : '更改为#完本#'}</Button>
    )
  } else if (name === 'isSpiderComplete') {
    dom = (
      <Button type="primary" onClick={onModifyFieldValue(id, name, !status)} >{status ? '更改为#未抓取完成#' : '更改为#已抓取完成#'}</Button>
    )
  } else {
    dom = (
      <>
        <Input allowClear value={fieldValue} onChange={onChangeFieldValue} placeholder="输入值" />
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
    <Wrapper title={htmlModifyBookField} placement="right" onVisibleChange={onVisibleChange} trigger="click" overlayStyle={{ maxWidth: 300 }}>
      <span className="btn">{html || '修改'}</span>
    </Wrapper>
  )
}

export default ModifyAction