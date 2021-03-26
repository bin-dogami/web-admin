import React, { useState, useEffect, useRef } from 'react';
import { Form, DatePicker, Input, Button, Table, Col, message, Modal } from 'antd';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { isDev, baseUrl, scanUrl, copyText } from '@/utils/index';
import { Spin } from 'antd';
import Menus from '@/components/Menu.jsx'
import moment from 'moment';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

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

const submitSeoKey = 'seo-submit-key'
const maxSubmitCountOneTime = 2000
const startDate = moment().subtract(1, 'd')
const endDate = moment().add(1, 'd')
const dateFormat = 'YYYY-MM-DD'

const SubmitSeo = () => {
  const [seoLinks, setSeoLinks] = useState('')
  // @TODO: 收录名额用完后（提交收录前要先确认有没有问题），然后把 还没上线的目录和书 都上了吧
  // 已提交完的记录下，下次再提交时去掉重复的
  const submitedIds = useRef({})

  // 查询出来的数据，table 的数据
  const [menuList, setMenuList] = useState([])
  // checkbox 选中的数据
  const [selectedMenuIds, setSelectedMenuIds] = useState([])
  // 添加添加按钮添加的数据，且会显示在 textarea 里
  const [addedMenuIds, setAddedMenuIds] = useState([])
  const _setAddedMenuIds = (list) => {
    if (!Object.keys(submitedIds.current).length) {
      setAddedMenuIds(list)
    }
    const _list = list.filter((id) => !(id in submitedIds.current))
    _list.length < list.length && message.warn(`有 ${list.length - _list.length} 个目录重复了～`)
    setAddedMenuIds(_list)
  }
  const [dateMenus, setDateMenus] = useState([moment(startDate, dateFormat), moment(endDate, dateFormat)])
  const [menusLoading, setmenusLoading] = useState(false)

  const [bookList, setBookList] = useState([])
  const [selectedBookIds, setSelectedBookIds] = useState([])
  const [addedBooksIds, setAddedBooksIds] = useState([])
  const _setAddedBooksIds = (list) => {
    if (!Object.keys(submitedIds.current).length) {
      setAddedBooksIds(list)
    }
    const _list = list.filter((id) => !(id in submitedIds.current))
    _list.length < list.length && message.warn(`有 ${list.length - _list.length} 本书重复了～`)
    setAddedBooksIds(_list)
  }
  const [dateBooks, setDateBooks] = useState([moment(startDate, dateFormat), moment(endDate, dateFormat)])
  const [booksLoading, setbooksLoading] = useState(false)

  // 选中的数据只在用户取消选中 或 清除选中的时候才会消失
  const onAddSelectedMenus = () => {
    _setAddedMenuIds(Array.from(new Set([...addedMenuIds, ...selectedMenuIds])))
  }

  const onAddSelectedAllMenus = () => {
    _setAddedMenuIds(Array.from(new Set([...addedMenuIds, ...menuList.map(({ id }) => id)])))
  }

  const onAddSelectedBooks = () => {
    _setAddedBooksIds(Array.from(new Set([...addedBooksIds, ...selectedBookIds])))
  }

  const onAddSelectedBooksAndMenus = () => {
    const bookIds = bookList.filter(({ isOnline }) => !isOnline).map(({ id }) => id)
    _setAddedBooksIds(Array.from(new Set([...addedBooksIds, ...bookIds])))
    try {
      if (!bookIds.length) {
        return
      }
      axios({
        url: `${baseUrl}fixdata/getLastTakeMenusByNovels`,
        method: 'get',
        params: {
          ids: bookIds
        },
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (Array.isArray(data)) {
          message.success(`成功获取了 ${data.length} 条目录`)
          _setAddedMenuIds(Array.from(new Set([...addedMenuIds, ...data])))
        } else {
          message.success(`获取失败`)
        }
      })
    } catch (error) {
      message.success(`获取失败`)
      console.log(error)
    }
  }

  const onSearchMenus = () => {
    if (dateMenus.length > 1) {
      try {
        setmenusLoading(true)
        axios({
          url: `${baseUrl}fixdata/getMenusByCreateDate`,
          method: 'get',
          params: {
            sDate: moment(dateMenus[0]).format(dateFormat),
            eDate: moment(dateMenus[1]).format(dateFormat)
          },
          errorTitle: '获取错误',
        }).then((res) => {
          setmenusLoading(false)
          const data = res && res.data && res.data.data
          if (Array.isArray(data)) {
            setMenuList(data)
          }
        })
      } catch (error) {
        setmenusLoading(false)
        console.log(error)
      }
    }
  }

  const onSearchBooks = () => {
    if (dateBooks.length > 1) {
      try {
        setbooksLoading(true)
        axios({
          url: `${baseUrl}fixdata/getBooksByCreateDate`,
          method: 'get',
          params: {
            sDate: moment(dateBooks[0]).format(dateFormat),
            eDate: moment(dateBooks[1]).format(dateFormat)
          },
          errorTitle: '获取错误',
        }).then((res) => {
          setbooksLoading(false)
          const data = res && res.data && res.data.data
          if (Array.isArray(data)) {
            setBookList(data)
          }
        })
      } catch (error) {
        setbooksLoading(false)
        console.log(error)
      }
    }
  }

  const onLinksChange = (e) => {
    setSeoLinks(e.target.value)
  }

  // 记录这个值主要是为了避免重复提交
  const storeSubmitedData = () => {
    addedMenuIds.map((id) => {
      submitedIds.current[id] = 1
    })

    addedBooksIds.map((id) => {
      submitedIds.current[id] = 1
    })
    localStorage.setItem(submitSeoKey, JSON.stringify({
      date: moment().startOf('day').format(dateFormat),
      value: submitedIds.current
    }))

    setSelectedMenuIds([])
    setAddedMenuIds([])

    setSelectedBookIds([])
    setAddedBooksIds([])
  }

  useEffect(() => {
    let cachedData = localStorage.getItem(submitSeoKey)
    if (cachedData) {
      cachedData = JSON.parse(cachedData)
      if (cachedData && cachedData.date) {
        if (cachedData.date === moment().startOf('day').format(dateFormat)) {
          // 获取已提交过收录的数据，避免重复提交
          submitedIds.current = cachedData.value || {}
        }
      }
    }
  }, [])

  const onSeoSubmit = () => {
    const _seoLinks = seoLinks.trim().replace('\n\n', '\n')
    if (_seoLinks.length) {
      try {
        axios({
          url: `${baseUrl}fixdata/curlBaiduSeo`,
          method: 'post',
          data: {
            links: _seoLinks,
            dev: isDev ? '1' : '',
          },
          errorTitle: '获取错误',
        }).then((res) => {
          const data = res && res.data && res.data.data
          if (data) {
            if (data.success) {
              storeSubmitedData()
              Modal.success({
                content: data.msg,
                onOk: () => {
                  message.info('记录把未上线的目录和书上线哦~~~')
                  message.info('记录把未上线的目录和书上线哦~~~')
                  message.info('记录把未上线的目录和书上线哦~~~')
                  return Promise.resolve()
                }
              })
            } else if (data.msg) {
              Modal.error({
                content: data.msg
              })
            }
          } else {
            Modal.error({
              title: '有未知错误'
            })
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const booksColumns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 60,
      render (text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    {
      title: '小说ID',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <>
            <span onClick={() => copyText(id)}>{id}</span>
          </>
        )
      }
    },
    {
      title: '小说名称',
      dataIndex: 'title',
      render: (title, record) => {
        return (
          <a className="link" href={`${scanUrl}book/${record.id}`} target="_blank">{title} {record.isComplete ? `（完本）` : ''}</a>
        )
      }
    },
    {
      title: '章节数',
      dataIndex: 'menusLen',
    },
    {
      title: '是否上线了',
      dataIndex: 'isOnline',
      render: (isOnline, record) => {
        return (
          isOnline ? '上线了' : '还没上线'
        )
      }
    },
    {
      title: '更新时间',
      dataIndex: 'updatetime',
      render: (updatetime, record) => {
        return (
          moment(updatetime).format('YYYY-MM-DD HH:mm')
        )
      }
    },
  ]

  const menusColumns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 60,
      render (text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    {
      title: '目录ID(书ID)',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <>
            <span onClick={() => copyText(id)}>{id}</span>
            <span onClick={() => copyText(record.novelId)}>（{record.novelId}）</span>
          </>
        )
      }
    },
    {
      title: 'index',
      dataIndex: 'index',
    },
    {
      title: '原目录名',
      dataIndex: 'moriginalname',
      render: (moriginalname, record) => {
        return (
          <>
            <a href={`${scanUrl}page/${record.id}`} target="_blank" style={{ marginRight: 10 }}>{moriginalname}</a>
            {/* <ModifyAction id={record.id} defaultValue={mname} name={"mname"} modifyFnName={onModifyMenu} /> */}
          </>
        )
      }
    },
    {
      title: '是否上线了',
      dataIndex: 'isOnline',
      render: (isOnline, record) => {
        return (
          isOnline ? '上线了' : '还没上线'
        )
      }
    },
    {
      title: '创建时间',
      dataIndex: 'ctime',
      render: (ctime, record) => {
        return (
          moment(ctime).format('YYYY-MM-DD HH:mm')
        )
      }
    },
  ]

  useEffect(() => {
    // 一次提交最多 maxSubmitCountOneTime(2000) 条数据，多的把目录的截断，因为书选不了那么多
    if (addedBooksIds.length + addedMenuIds.length > maxSubmitCountOneTime) {
      _setAddedMenuIds(addedMenuIds.slice(0, maxSubmitCountOneTime - addedBooksIds.length))
      return
    }
    const books = addedBooksIds.map(id => `https://m.zjjdxr.com/book/${id}`)
    let menus = addedMenuIds.map(id => `https://m.zjjdxr.com/page/${id}`)
    setSeoLinks(`${books.join('\n')}\n\n${menus.join('\n')}`.trim())
  }, [addedMenuIds, addedBooksIds])

  useEffect(() => {
    message.info(`已添加了 ${seoLinks.split('\n').length} 条待提交收录的数据`)
  }, [seoLinks])

  const rowKey = (record) => {
    return record.id
  }

  useEffect(() => {
    onSearchMenus()
    onSearchBooks()
  }, [])

  const onSetMenusOnline = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/setAllMnusOnline`,
        method: 'post',
        errorTitle: '设置错误',
      }).then((res) => {
        message.info('设置完成')
        // const data = res && res.data && res.data.data
      })
    } catch (error) {
      console.log(error)
    }
  }

  const onSetBooksOnline = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/setAllBooksOnline`,
        method: 'post',
        errorTitle: '设置错误',
      }).then((res) => {
        message.info('设置完成')
        // const data = res && res.data && res.data.data
      })
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Wrapper className="wrapper">
      <Menus name={'submitSeo'} />
      <div className="chunk" style={{ marginBottom: 20 }}>
        <div>
          <Button onClick={onSetMenusOnline} style={{ marginRight: 15 }}>上线所有目录</Button>
          <Button onClick={onSetBooksOnline} style={{ marginRight: 15 }}>上线所有书本</Button>
        </div>
      </div>
      <div className="chunk">
        <h2>提交百度收录</h2>
        <div className="content">
          <Form.Item label="目录查询">
            <RangePicker
              defaultValue={dateMenus}
              format={dateFormat}
              onChange={(date, dateString) => setDateMenus(dateString)}
            />
            <Button onClick={onSearchMenus} style={{ marginLeft: 15 }}>查询</Button>
            <Button onClick={onAddSelectedMenus} style={{ marginLeft: 15 }}>添加选中书</Button>
            <Button onClick={onAddSelectedAllMenus} style={{ marginLeft: 15 }}>添加全部目录</Button>
          </Form.Item>
          <Table
            rowSelection={{
              selectedRowKeys: selectedMenuIds,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedMenuIds(selectedRowKeys)
              }
            }}
            dataSource={menuList}
            loading={menusLoading}
            columns={menusColumns}
            rowKey={rowKey}
            style={{ marginBottom: 30 }}
          />
          <Form.Item label="书本查询">
            <RangePicker
              value={dateBooks}
              format={dateFormat}
              onChange={(date, dateString) => setDateBooks(dateString)}
            />
            <Button onClick={onSearchBooks} style={{ marginLeft: 15 }}>查询</Button>
            <Button onClick={onAddSelectedBooks} style={{ marginLeft: 15 }}>添加选中书</Button>
            <Button onClick={onAddSelectedBooksAndMenus} style={{ marginLeft: 15 }}>添加未上线书及其最新50个目录</Button>
          </Form.Item>
          <Table
            rowSelection={{
              selectedRowKeys: selectedBookIds,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelectedBookIds(selectedRowKeys)
              }
            }}
            dataSource={bookList}
            loading={booksLoading}
            columns={booksColumns}
            rowKey={rowKey}
            style={{ marginBottom: 30 }}
          />
          <TextArea value={seoLinks} rows={10} onChange={onLinksChange} />
          <Button type="primary" onClick={onSeoSubmit} style={{ marginTop: 15 }}>提交</Button>
        </div>
      </div>
    </Wrapper >
  );
};

export default SubmitSeo;