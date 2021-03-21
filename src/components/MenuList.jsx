import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, message, Radio } from 'antd';
import { SortAscendingOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
import ModifyAction from '@/components/ModifyAction.jsx'
import styled, { createGlobalStyle } from 'styled-components';

const AbNormals = styled.div`
  margin-bottom: 20px;

  ul {
  }

  li {
    line-height: 30px;

    span {
      padding-right: 20px;
      min-width: 40%;
      display: inline-block;
    }
  }
`

const MenuList = ({ book }) => {
  const [popVisible, setPopVisible] = useState(false)
  const [isDesc, setIsDesc] = useState(false)
  const [skip, setSkip] = useState(1)
  const [size, setSize] = useState(100)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [abNormalIndexs, setAbNormalIndexs] = useState([])

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
          getList(skip, size, isDesc)
        } else {
          message.error(typeof data === 'string' && data.length ? data : '修改错误')
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
          getList(skip, size, isDesc)
        } else {
          message.error(typeof data === 'string' && data.length ? data : '删除错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  // 重排此目录之后的所有目录的index
  const batchModifyIndexs = (mId, fieldName, fieldValue) => () => {
    try {
      axios({
        url: `${baseUrl}fixdata/batchModifyIndexs`,
        method: 'post',
        data: {
          mId,
          nId: book.id
        },
        errorTitle: '修改错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('修改成功')
          getList(skip, size, isDesc)
        } else {
          message.error(typeof data === 'string' && data.length ? data : '修改错误')
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const onDetectIndexAbnormal = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/detectBookIndexAbnormal`,
        method: 'get',
        params: {
          id: book.id,
        },
        errorTitle: '探查错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string' && !data.length) {
          message.success('没有问题')
        } else {
          message.error(typeof data === 'string' && data.length ? data : '有错误哦')
          Array.isArray(data) && setAbNormalIndexs(data)
        }
      })

    } catch (e) {
      console.log(e)
    }
  }

  const getList = (_skip, _size, isDesc) => {
    setSkip(_skip)
    setSize(_size)
    try {
      setLoading(true)
      axios({
        url: `${baseUrl}fixdata/getMenuList`,
        method: 'get',
        params: {
          id: book.id,
          skip: (_skip - 1) * _size,
          size: _size,
          desc: +isDesc
        },
        errorTitle: '获取错误',
      }).then((res) => {
        setLoading(false)
        const [data, total] = res && res.data && Array.isArray(res.data.data) && res.data.data.length > 1 ? res.data.data : [[], 0];
        setData(data);
        setTotal(total)
      })
    } catch (e) {
      setLoading(false)
      console.log(e)
    }
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: 50,
      render (text, record, index) {
        return (
          <span>{index + 1}</span>
        )
      }
    },
    {
      title: '目录ID',
      dataIndex: 'id',
      render: (id, record) => {
        return (
          <>
            <a href={`${scanUrl}page/${record.id}`} target="_blank" style={{ marginRight: 10 }}>{id}</a>
            <ModifyAction id={id} html="删除目录" name={"deleteMenu"} modifyFnName={onDeleteMenu} html={<DeleteOutlined />} />
          </>
        )
      }
    },
    {
      title: 'mname',
      dataIndex: 'mname',
      render: (mname, record) => {
        return (
          <>
            <a href={`${scanUrl}page/${record.id}`} target="_blank" style={{ marginRight: 10 }}>{mname}</a>
            <ModifyAction id={record.id} defaultValue={mname} name={"mname"} modifyFnName={onModifyMenu} />
          </>
        )
      }
    },
    {
      title: 'index',
      dataIndex: 'index',
      width: 100,
      render: (index, record) => {
        return (
          <>
            <span style={{ marginRight: 10 }}>{index}</span>
            <div style={{ display: 'inline-block', marginRight: 10 }}>
              <ModifyAction id={record.id} defaultValue={index} name={"index"} modifyFnName={onModifyMenu} />
            </div>
            <ModifyAction id={record.id} name={"batchModifyIndexs"} modifyFnName={batchModifyIndexs} html={<SortAscendingOutlined />} />
          </>
        )
      }
    },
    {
      title: '原标题',
      dataIndex: 'moriginalname',
      render: (moriginalname, record) => {
        return (
          <>
            <a data-href={record.from} onClick={onCopyHref}>{moriginalname}</a>
          </>
        )
      }
    },
  ]

  const pagination = {
    current: skip,
    pageSize: size,
    total: total,
    showTotal: total => `共 ${total} 条`,
    showSizeChanger: true,
  };

  const onChange = (e) => {
    const desc = e.target.value
    setIsDesc(desc)
    getList(1, size, desc)
  }

  const onTableChange = (pagination) => {
    getList(pagination.current || 1, pagination.pageSize || size, isDesc);
  };

  useEffect(() => {
    popVisible && getList(1, size, isDesc)
  }, [popVisible])

  const rowKey = (record) => {
    return record.id
  }

  return (
    <>
      <Button className="viewMenus" type="primary" shape="round" size={'middle'} onClick={() => setPopVisible(true)}>查看目录list</Button>
      <Modal width={800} title="目录列表" visible={popVisible} onOk={() => setPopVisible(false)} onCancel={() => setPopVisible(false)}>
        <div style={{ marginBottom: 20 }}>
          <Radio.Group onChange={onChange} value={isDesc} style={{ marginRight: 30 }}>
            <Radio value={true}>倒序</Radio>
            <Radio value={false}>正序</Radio>
          </Radio.Group>
          <Button type="primary" size={'middle'} onClick={onDetectIndexAbnormal} style={{ marginRight: 20 }}>index是否异常</Button>
          <a data-href={book.from} onClick={onCopyHref}>{book.title}</a>
        </div>
        {abNormalIndexs.length ? (
          <AbNormals>
            <h3>有问题的index目录: </h3>
            <ul>
              {abNormalIndexs.map(({ id, index, mname, lastId, lastIndex, lastMname, }) => (
                <li key={id}><span>第{index}章 {mname} 【{id}】</span> (上一章：{lastIndex} {lastMname} 【{lastId}】)</li>
              ))}
            </ul>
          </AbNormals>
        ) : null}
        <Table dataSource={data} size={'small'} pagination={pagination} onChange={onTableChange} loading={loading} columns={columns} rowKey={rowKey} />
      </Modal>
    </>
  )
}

export default MenuList