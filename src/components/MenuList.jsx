import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, message, Radio } from 'antd';
import { SortAscendingOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
import ModifyAction from '@/components/ModifyAction.jsx'

const MenuList = ({ book }) => {
  const [popVisible, setPopVisible] = useState(false)
  const [isDesc, setIsDesc] = useState(true)
  const [skip, setSkip] = useState(1)
  const [size, setSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([]);

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
          <a data-href={book.from} onClick={onCopyHref}>{book.title}</a>
        </div>
        <Table dataSource={data} size={'small'} pagination={pagination} onChange={onTableChange} loading={loading} columns={columns} rowKey={rowKey} />
      </Modal>
    </>
  )
}

export default MenuList