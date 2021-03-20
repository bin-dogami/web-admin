import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Form, Input, InputNumber, Button, message, Modal, Empty, Tooltip, Table } from 'antd';

import styled, { createGlobalStyle } from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, BOOK_SEARCH_HISTORY_KEY, AUTHOR_SEARCH_HISTORY_KEY, onCopyHref } from '@/utils/index';

import Menus from '@/components/Menu.jsx'
import ModifyAction from '@/components/ModifyAction.jsx'
import Last100Books from '@/components/Last100Books.jsx'
import SpiderStatus from '@/components/SpiderStatus.jsx'
import MenuList from '@/components/MenuList.jsx'

const GlobalStyle = createGlobalStyle`
  .modifyField {
    padding: 8px;
    white-space: nowrap;
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

  .search {
    margin-bottom: 20px;
  }

  .searchedBookList {
    background: #fff;
    position: absolute;
    left: 0px;
    top: 31px;
    width: 200px;
    border: 1px solid #ddd;
    list-style: none;
    padding: 5px 15px;
    max-height: 180px;
    overflow-y: auto;

    li {
      line-height: 20px;
      cursor: pointer;
      margin-bottom: 10px;
    }
  }

  .ant-input-number, .ant-input-affix-wrapper {
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

    strong, span, a {
      display: inline-block;
    }

    strong {
      width: 150px;
    }

    .red {
      color: red;
    }

    span, a {
      min-width: 50px;
      margin-right: 30px;
      vertical-align: top;

      @media (min-width:1000px){
        width: 250px;
        max-width: auto;
      }
    }

    .viewMenus span {
      min-width: auto;
      width: auto;
      margin-right: 0;
    }

    .anticon {
      line-height: 30px;
      min-width: 0;
    }

    a {
      max-width: 200px;
      text-overflow: ellipsis;
      display: inline-block;
      overflow: hidden;
      white-space: nowrap;
    }

    .btn {
      color: #1890ff;
      display: inline;
      cursor: pointer;
    }
  }
`;

const maxStoredBooks = 20

const FailedPages = () => {
  const [bookValue, setBookValue] = useState('');
  const [bookInfo, setBookInfo] = useState(null)
  const [historyBooks, setHistoryBooks] = useState([])
  const [searchedBookList, setSearchedBookList] = useState([])

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

  const getBookByName = (name) => {
    if (!name.trim()) {
      return
    }
    try {
      axios({
        url: `${baseUrl}fixdata/getBookByName`,
        method: 'get',
        params: {
          name: name.trim()
        },
        errorTitle: '获取书本错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
        }
        if (Array.isArray(data)) {
          setSearchedBookList(data)
        } else {
          setSearchedBookList([])
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onChangeBookId = (e) => {
    const { value } = e.target;
    !/^[\d\s]+$/.test(value) && getBookByName(value)
    setBookValue(value)
  }

  useEffect(() => {
    if (!bookValue.length) {
      setSearchedBookList([])
    }
  }, [bookValue])

  const onSearchBook = id => {
    setBookValue(typeof id === 'number' ? `${id}` : bookValue)
    const domNovel = document.querySelector('#novel')
    domNovel && domNovel.scrollIntoView({ behavior: 'smooth' })
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
          if (data.authorId) {
            onSearchAuthor(data.authorId)
          }
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

  const _onSearchBook = id => {
    setSearchedBookList([])
    onSearchBook(id)
  }

  const onSelectHistoryBook = id => () => {
    // setBookValue(`${id}`)
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

  const onDeleteBook = (id) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/deleteBook`,
        method: 'post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          Modal.info({ content: data })
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onSetRecommend = (id, fieldName, fieldValue) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/setRecommend`,
        method: 'post',
        data: {
          id,
          toRec: fieldValue
        },
        errorTitle: '修改错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('设置成功')
          onSearchBook()
        } else {
          message.error(typeof data === 'string' && data.length ? data : '修改错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

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
  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------

  // 目录处理
  const [menuValue, setMenuValue] = useState('')
  const [menuInfo, setMenuInfo] = useState(null)

  const onChangeMenuId = e => {
    const { value } = e.target
    setMenuValue(value)
  }

  function onSearchMenu (v) {
    try {
      axios({
        url: `${baseUrl}fixdata/getMenuInfo`,
        method: 'get',
        params: {
          id: menuValue || v
        },
        errorTitle: '获取目录错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (data && typeof data === 'object') {
          let list = data
          setMenuInfo(list)
        } else {
          setMenuInfo(null)
          message.error(typeof data === 'string' ? data : '获取目录错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onDeleteMenu = (id) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/deleteMenu`,
        method: 'post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('删除成功')
          onSearchMenu()
        } else {
          message.error(typeof data === 'string' && data.length ? data : '删除错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onDeleteGtMenus = (id) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/batchDeleteGtMenu`,
        method: 'post',
        data: {
          id,
        },
        errorTitle: '删除错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('删除成功')
          onSearchMenu()
        } else {
          message.error(typeof data === 'string' && data.length ? data : '删除错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onModifyMenu = (id, fieldName, fieldValue) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/modifyMenuInfo`,
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
          onSearchMenu()
        } else {
          message.error(typeof data === 'string' && data.length ? data : '修改错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------
  // ----------------------------------------- 分割线 -----------------------------------------
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

  function onSearchAuthor (id) {
    setAuthorValue(typeof id === 'number' ? `${id}` : authorValue.trim())
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
    // setAuthorValue(`${id}`)
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

  const onClearHistory = (key) => () => {
    localStorage.removeItem(key)
    if (key === BOOK_SEARCH_HISTORY_KEY) {
      setHistoryBooks([])
    } else if (key === AUTHOR_SEARCH_HISTORY_KEY) {
      setHistoryAuthors([])
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

  const onSpider = (url) => () => {
    if (!Array.isArray(url) || !url.length) {
      return
    }
    try {
      message.info('开始抓取')
      axios({
        url: `${baseUrl}getbook/spider`,
        method: 'post',
        data: {
          url: url[url.length - 1].trim(),
          mnum: '',
          recommend: ''
        },
        errorTitle: '抓取错误',
      }).then((res) => {
        //
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Wrapper className="wrapper">
      <GlobalStyle />
      <Menus name={'fieldsSetting'} />
      <SpiderStatus />
      <Last100Books onSearchBook={onSearchBook} onSpider={onSpider} />
      <div className="chunk" id="novel">
        <h2>novel字段</h2>
        <div className="content">
          <div className="search">
            <Form.Item label="查询">
              <Input allowClear value={bookValue} onChange={onChangeBookId} placeholder="输入id" />
              <Button type="primary" onClick={onSearchBook} >查询</Button>
              {!searchedBookList.length ? null : (
                <ul className="searchedBookList">
                  {searchedBookList.map((item) => {
                    return (
                      <li key={item.id} onClick={() => _onSearchBook(item.id)}>{item.title}</li>
                    )
                  })}
                </ul>
              )}

              <Tooltip title={htmlHistoryBooks} color="gold" placement="bottom" overlayStyle={{ maxWidth: 300 }}>
                <span className="history">历史查找(<span onClick={onClearHistory(BOOK_SEARCH_HISTORY_KEY)}>清除</span>)</span>
              </Tooltip>
            </Form.Item>
          </div>
          <div className="data">
            {!bookInfo ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
              <ul className="list">
                <li>
                  <strong>小说Id: </strong><span>{bookInfo.id}</span>
                  <ModifyAction id={bookInfo.id} html="删除本书" name={"deleteBook"} modifyFnName={onDeleteBook} />
                  <MenuList book={bookInfo} />
                </li>
                <li>
                  <strong>是否热门推荐: </strong>
                  <span>{bookInfo.isRecommend ? '是' : '否'}</span>
                  <ModifyAction id={bookInfo.id} status={bookInfo.isRecommend} name={"setRecommend"} modifyFnName={onSetRecommend} />
                </li>
                <li>
                  <strong>小说名: </strong>
                  <a href={`${scanUrl}book/${bookInfo.id}`} target="_blank">{bookInfo.title}</a>
                  <ModifyAction id={bookInfo.id} defaultValue={bookInfo.title} name={"title"} modifyFnName={onModifyBook} />
                </li>
                <li>
                  <strong>来源: </strong>
                  <a data-href={bookInfo.from} onClick={onCopyHref}>{bookInfo.from}</a>
                  <span className="btn" onClick={onSpider(bookInfo.from)}>再次抓取</span>
                </li>
                <li><strong>访问量: </strong><span>{bookInfo.viewnum}</span></li>
                <li><strong>章节总数: </strong><span>{bookInfo.menusLen} 章</span></li>
                <li><strong>类型: </strong><span>{bookInfo.typename}</span></li>
                <li>
                  <strong>类型Id: </strong><span>{bookInfo.typeid}</span>
                  <ModifyAction id={bookInfo.id} name={"typeid"} modifyFnName={() => { }} />
                </li>
                <li><strong>作者: </strong><span>{bookInfo.author}</span></li>
                <li>
                  <strong>作者Id: </strong><span onClick={() => onSearchAuthor(bookInfo.authorId)}>{bookInfo.authorId}</span>
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
        <h2>目录处理</h2>
        <div className="content">
          <div className="search">
            <Form.Item label="查询">
              <Input allowClear value={menuValue} onChange={onChangeMenuId} placeholder="输入id" />
              <Button type="primary" onClick={onSearchMenu} >查询</Button>
            </Form.Item>
          </div>
          <div className="data authData">
            {!menuInfo ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
              <ul className="list">
                <li>
                  <strong>id: </strong>
                  <span>{menuInfo.id}</span>
                  <ModifyAction id={menuInfo.id} html="删除目录" name={"deleteMenu"} modifyFnName={onDeleteMenu} />
                  <ModifyAction id={menuInfo.id} html="删除>=此目录id的目录" name={"deleteMenu"} modifyFnName={onDeleteGtMenus} />
                </li>
                <li><strong>书id: </strong><span onClick={() => onSearchBook(menuInfo.novelId)}>{menuInfo.novelId}</span></li>
                <li>
                  <strong>mname: </strong>
                  <a href={`${scanUrl}page/${menuInfo.id}`} target="_blank">{menuInfo.mname}</a>
                  <ModifyAction id={menuInfo.id} defaultValue={menuInfo.mname} name={"mname"} modifyFnName={onModifyMenu} />
                </li>
                <li>
                  <strong>index: </strong>
                  <span>{menuInfo.index}</span>
                  <ModifyAction id={menuInfo.id} defaultValue={menuInfo.index} name={"index"} modifyFnName={onModifyMenu} />
                </li>
                <li><strong>moriginalname: </strong><span>{menuInfo.moriginalname}</span></li>
                <li><strong>page缺失否: </strong><span className={menuInfo.page ? '' : 'red'}>{menuInfo.page ? '不缺失' : 'page内容缺失'}</span></li>
                <li><strong>字数: </strong><span>{menuInfo.wordsnum}</span></li>
                <li><strong>content: </strong><span>{menuInfo.content}</span></li>
                <li><strong>错误类型: </strong><span>{menuInfo.ErrorType == '1' ? '目录插入失败' : '没错'}</span></li>
                <li><strong>来源: </strong><a data-href={menuInfo.from} onClick={onCopyHref}>{menuInfo.from}</a></li>
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
              <Input allowClear value={authorValue} onChange={onChangeAuthorId} placeholder="输入id or 名称" />
              <Button type="primary" onClick={onSearchAuthor} >查询</Button>
              <Tooltip title={htmlHistoryAuthors} color="gold" placement="bottom" overlayStyle={{ maxWidth: 300 }}>
                <span className="history">历史查找(<span onClick={onClearHistory(AUTHOR_SEARCH_HISTORY_KEY)}>清除</span>)</span>
              </Tooltip>
            </Form.Item>
          </div>
          <div className="data authData">
            {!authorInfo ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
              <ul className="list">
                <li><strong>作者Id: </strong><span>{authorInfo.id}</span></li>
                <li><strong>名称: </strong><span>{authorInfo.name}</span></li>
                <li><strong>等级: </strong><span>{authorInfo.level}{authorInfo.levelName.includes(',') ? '' : `（${authorInfo.levelName}）`}</span></li>
                <li><strong>作品: </strong><span>共 {authorInfo.novelIds.trim().length ? authorInfo.novelIds.split(',').length : 0} 本: {
                  authorInfo.novelIds.split(',').map((id) => (
                    <span key={id} onClick={() => onSearchBook(+id)}>{id}</span>
                  ))
                }</span></li>
              </ul>
            }
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default FailedPages;