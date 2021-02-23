import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Empty, Tooltip } from 'antd';
import styled, { createGlobalStyle } from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl, BOOK_SEARCH_HISTORY_KEY, AUTHOR_SEARCH_HISTORY_KEY } from '@/utils/index';

const GlobalStyle = createGlobalStyle`
  .modifyField {
    padding: 8px;
    white-space: nowrap;
    input {
      margin-right: 15px;
      width: 180px;
    }
  }
  .historyList {
    white-space: nowrap;
    padding: 5px 10px;
    display: flex;
    align-items: center;
    margin: 0;

    span {
      display: inline-block;
    }

    & span:first-child {
      margin-right: 15px;
    }

    & span:last-child {
      max-width: 200px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  .ellipsis {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
  }
`;

const Wrapper = styled.div`
  max-width: 900px;
  margin: 50px;

  h1 {
    margin-bottom: 30px;
  }

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

  .search { margin-bottom: 20px;
  }

  .ant-input-number, .ant-input {
    width: 200px;
    margin-right: 30px;
  }

  button { margin-right: 30px; }

  .history {
    cursor: pointer;
  }

  .ant-input-number-handler-wrap {
    display: none;
  }


  .data {
    min-height: 100px;
    padding: 20px;
    border: 1px solid #D9D9D9;

    .ant-empty {
      margin: 10px 0;
    }
  }

  .list {
    line-height: 28px;

    strong, span {
      display: inline-block;
    }

    strong {
      width: 150px;
    }

    span {
      width: 250px;
      margin-right: 30px;
      vertical-align: top;
    }

    .btn {
      color: #1890ff;
      display: inline;
      cursor: pointer;
    }
  }
`;

const maxStoredBooks = 20
const ModifyAction = ({ id, name, status, modifyFnName }) => {
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
  if (name === 'isComplete') {
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
        <Input value={fieldValue} onChange={onChangeFieldValue} placeholder="输入值" />
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
    <Tooltip title={htmlModifyBookField} placement="right" onVisibleChange={onVisibleChange} trigger="click" overlayStyle={{ maxWidth: 300 }}>
      <span className="btn">修改</span>
    </Tooltip>
  )
}

const FailedPages = () => {
  const [bookValue, setBookValue] = useState('');
  const [bookInfo, setBookInfo] = useState(null)
  const [historyBooks, setHistoryBooks] = useState([])

  const _setHistoryBooks = (item) => {
    let _historyBooks = historyBooks.filter(({ id }) => id !== item.id)
    _historyBooks = [item, ..._historyBooks]
    if (_historyBooks.length > maxStoredBooks) {
      _historyBooks = _historyBooks.slice(0, maxStoredBooks)
    }
    setHistoryBooks(_historyBooks)
  }

  useEffect(() => {
    historyBooks.length && localStorage.setItem(BOOK_SEARCH_HISTORY_KEY, JSON.stringify(historyBooks))
  }, [historyBooks])

  const onChangeBookId = (value) => {
    setBookValue(value)
  }

  const onSearchBook = id => {
    try {
      setBookInfo(null)
      axios({
        url: `${baseUrl}fixdata/getBookInfo`,
        method: 'get',
        params: {
          id: typeof id === 'number' ? id : bookValue,
        },
        errorTitle: '获取书本错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
        }
        if (data && typeof data === 'object') {
          setBookInfo(data)
          _setHistoryBooks({
            id: data.id,
            title: data.title
          })
        } else {
          setBookInfo(null)
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onSelectHistoryBook = id => () => {
    setBookValue(`${id}`)
    onSearchBook(id)
  }
  const htmlHistoryBooks = useMemo(() => {
    return (
      <>
        {historyBooks.map(({ id, title }) => (
          <p className="historyList" key={`${id}`} onClick={onSelectHistoryBook(id)}><span>{id}</span><span className="ellipsis">{title}</span></p>
        ))}
      </>
    )
  }, [historyBooks])

  const onModifyBook = (id, fieldName, fieldValue) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/modifyBookInfo`,
        method: 'post',
        data: {
          id,
          fieldName,
          fieldValue
        },
        errorTitle: '修改错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('修改成功')
          onSearchBook()
        } else {
          message.error(typeof data === 'string' && data.length ? data : '修改错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  // 作者
  const [authorValue, setAuthorValue] = useState('')
  const [authorInfo, setAuthorInfo] = useState(null)
  const [historyAuthors, setHistoryAuthors] = useState([])

  const _setHistoryAuthors = (item) => {
    const _item = Array.isArray(item) ? item : [item]
    let _historyAuthors = [...historyAuthors]
    _item.forEach(({ id }) => {
      _historyAuthors = _historyAuthors.filter((item) => id !== item.id)
    })

    _historyAuthors = [..._item, ..._historyAuthors]
    if (_historyAuthors.length > maxStoredBooks) {
      _historyAuthors = _historyAuthors.slice(0, maxStoredBooks)
    }
    setHistoryAuthors(_historyAuthors)
  }

  useEffect(() => {
    historyAuthors.length && localStorage.setItem(AUTHOR_SEARCH_HISTORY_KEY, JSON.stringify(historyAuthors))
  }, [historyAuthors])

  const onChangeAuthorId = e => {
    const { value } = e.target;
    setAuthorValue(value)
  }

  const onSearchAuthor = (id) => {
    try {
      axios({
        url: `${baseUrl}fixdata/getAuthorInfo`,
        method: 'get',
        params: {
          id: typeof id === 'number' ? id : authorValue.trim(),
        },
        errorTitle: '获取作者错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
        }
        if (data && typeof data === 'object') {
          let list = data
          if (Array.isArray(data)) {
            Object.keys(data[0]).forEach((key) => {
              const arr = data.map((item) => item[key])
              list[key] = key === 'novelIds' ? arr.toString() : arr.join(', ')
            })
            _setHistoryAuthors(data.map(({ id, name }) => ({ id, name })))
          } else {
            list.novelIds = list.novelIds.join(',')
            _setHistoryAuthors({ id: data.id, name: data.name })
          }
          setAuthorInfo(list)
        } else {
          setAuthorInfo(null)
        }
        setAuthorInfo(data || null)
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onSelectHistoryAuthor = id => () => {
    setAuthorValue(`${id}`)
    onSearchAuthor(id)
  }
  const htmlHistoryAuthors = useMemo(() => {
    return (
      <>
        {historyAuthors.map(({ id, name }) => (
          <p className="historyList" key={`${id}`} onClick={onSelectHistoryAuthor(id)}><span>{id}</span><span className="ellipsis">{name}</span></p>
        ))}
      </>
    )
  }, [historyAuthors])

  const onReGet = (id) => {
    try {
      axios({
        url: `${baseUrl}fixdata/reGetPages`,
        method: 'get',
        params: {
          id,
        },
        errorTitle: '抓取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        message.success(data)
      })

    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    const storaged = localStorage.getItem(BOOK_SEARCH_HISTORY_KEY)
    if (storaged) {
      setHistoryBooks(JSON.parse(storaged))
    }

    const storaged2 = localStorage.getItem(AUTHOR_SEARCH_HISTORY_KEY)
    if (storaged2) {
      setHistoryAuthors(JSON.parse(storaged2))
    }


  }, [])

  return (
    <Wrapper>
      <GlobalStyle />
      <h1>字段更改</h1>
      <div className="chunk">
        <h2>novel字段</h2>
        <div className="content">
          <div className="search">
            <Form.Item label="查询">
              <InputNumber value={bookValue} onChange={onChangeBookId} placeholder="输入id" />
              <Button type="primary" onClick={onSearchBook} >查询</Button>
              <Tooltip title={htmlHistoryBooks} color="gold" placement="bottom" overlayStyle={{ maxWidth: 300 }}>
                <span className="history">历史查找</span>
              </Tooltip>
            </Form.Item>
          </div>
          <div className="data">
            {!bookInfo ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
              <ul className="list">
                <li><strong>小说Id: </strong><span>{bookInfo.id}</span></li>
                <li><strong>小说名: </strong><span>{bookInfo.title}</span></li>
                <li><strong>访问量: </strong><span>{bookInfo.viewnum}</span></li>
                <li><strong>章节总数: </strong><span>{bookInfo.menusLen} 章</span></li>
                <li><strong>类型: </strong><span>{bookInfo.typename}</span></li>
                <li>
                  <strong>类型Id: </strong><span>{bookInfo.typeid}</span>
                  <ModifyAction id={bookInfo.id} name={"typeid"} modifyFnName={() => { }} />
                </li>
                <li><strong>作者: </strong><span>{bookInfo.author}</span></li>
                <li>
                  <strong>作者Id: </strong><span>{bookInfo.authorId}</span>
                  <ModifyAction id={bookInfo.id} name={"authorId"} modifyFnName={onModifyBook} />
                </li>
                <li>
                  <strong>是否完本: </strong><span>{bookInfo.isComplete ? '已完本' : '连载中'}</span>
                  <ModifyAction id={bookInfo.id} name={"isComplete"} status={bookInfo.isComplete} modifyFnName={onModifyBook} />
                </li>
                <li>
                  <strong>完本且抓取完了: </strong><span>{bookInfo.isSpiderComplete ? '已抓取完' : '未完'}</span>
                  <ModifyAction id={bookInfo.id} name={"isSpiderComplete"} status={bookInfo.isSpiderComplete} modifyFnName={onModifyBook} />
                </li>
              </ul>
            }
          </div>
        </div>
      </div>
      <div className="chunk">
        <h2>author字段</h2>
        <div className="content">
          <div className="search">
            <Form.Item label="查询">
              <Input value={authorValue} onChange={onChangeAuthorId} placeholder="输入id or 名称" />
              <Button type="primary" onClick={onSearchAuthor} >查询</Button>
              <Tooltip title={htmlHistoryAuthors} color="gold" placement="bottom" overlayStyle={{ maxWidth: 300 }}>
                <span className="history">历史查找</span>
              </Tooltip>
            </Form.Item>
          </div>
          <div className="data authData">
            {!authorInfo ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
              <ul className="list">
                <li><strong>作者Id: </strong><span>{authorInfo.id}</span></li>
                <li><strong>名称: </strong><span>{authorInfo.name}</span></li>
                <li><strong>等级: </strong><span>{authorInfo.level}{authorInfo.levelName.includes(',') ? '' : `（${authorInfo.levelName}）`}</span></li>
                <li><strong>作品: </strong><span>共 {authorInfo.novelIds.trim().length ? authorInfo.novelIds.split(',').length : 0} 本: {authorInfo.novelIds}</span></li>
              </ul>
            }
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default FailedPages;