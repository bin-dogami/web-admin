import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, message, Form, Input } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';

import Menus from '@/components/Menu.jsx'
import MenuList from '@/components/MenuList.jsx'
import ModifyAction from '@/components/ModifyAction.jsx'

const Wrapper = styled.div`
  h3 {
    margin: 0 0 30px 20px;
  }

  .btn {
    color: #1890ff;
  }
`;

const UL = styled.ul`
  strong {
    width: 100px;
    display: inline-block;
  }
`

const Content = styled.div`
  margin-top: 15px;
  border: 1px solid #ececec;
  padding: 15px;
`

const MenuPage = (props) => {
  const id = props.match && props.match.params && props.match.params.id || 0
  const [bookInfo, setBookInfo] = useState(null)
  const [prevMenuId, setPrevMenuId] = useState(0)
  const [visible, setVisible] = useState(false)

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false)
  const contentRef = useRef(null)

  const [triggerReLoading, setTriggerReLoading] = useState(0)

  const closePop = () => {
    setVisible(false)
  }

  const onOk = () => {
    form.submit()
  }

  const createMenu = (data) => {
    setLoading(true)
    try {
      axios({
        url: `${baseUrl}fixdata/createMenu`,
        method: 'post',
        data: {
          ...data,
          prevMenuId,
          novelId: id
        },
        errorTitle: '创建错误',
      }).then((res) => {
        setLoading(false)
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message.error(data || '创建失败')
        } else {
          if (data && 'id' in data) {
            message.success(data.msg)
            form.resetFields()
            // closePop()
            setTriggerReLoading(triggerReLoading + 1)
          } else {
            message.error('创建失败')
          }
        }
      })
    } catch (e) {
      console.log(e)
      setLoading(false)
      message.error('创建失败: ' + e)
    }
  }

  const setContentToHtml = (content) => {
    return content.split('\n').map((text) => text.trim().length ? `<p>${text}</p>` : '').join('')
  }

  // 同后端处理的情况一样，一个 content 字数不能超过 16000
  const maxContentLength = 16000
  const dealContent = (content) => {
    if (content.length < maxContentLength) {
      return [setContentToHtml(content)]
    }

    let index = 0
    const res = ['']
    const _content = content.split('\n').map((text) => text.trim().length ? `<p>${text}</p>` : '')
    while (_content.length) {
      const text = _content.splice(0, 10).join('')
      if (text.length >= maxContentLength) {
        Modal.info({ content: '10 段文字就有 ${maxContentLength} 个字？？？有毛病吧，都不分段' })
        return []
      }
      if (res[index].length + text.length > maxContentLength) {
        res.push(text)
        index++
      } else {
        res[index] += text
      }
    }
    return res
  }

  const onFinish = async (values) => {
    if (loading) {
      return
    }
    values.content = dealContent(values.content)
    if (!values.content.length) {
      return
    }
    if (!values.content[0].length) {
      Modal.info({ content: '内容都没有？' })
      return
    }
    Modal.info({
      title: '确定要创建么?',
      onOk: () => {
        createMenu(values)
        return Promise.resolve()
      }
    })
  }

  const numMap = {
    '零': 0,
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9,
    '两': 2
  }
  // const powMap = {
  //   '十': '',
  //   '百': '',
  //   '千': '',
  //   '万': '',
  // }

  const onValuesChange = (changedValues, allValues) => {
    if ('mname' in changedValues) {
      // nothing
    }
  }

  const onNameChange = () => {
    setTimeout(() => {
      const mname = form.getFieldValue('mname')
      let match = null
      if (/第[^章\s]+章.*/.test(mname)) {
        match = mname.match(/第([^章\s]+)章/)

      } else if (/^[^章\s]+章.*/.test(mname)) {
        match = mname.match(/([^章\s]+)章/)
      }

      if (match && match.length > 1) {
        let index = match[1].replace(/[零一二两三四五六七八九十百千万]/g, ($1) => {
          return $1 in numMap ? numMap[$1] : ''
        })
        try {
          index = +index
          form.setFieldsValue({ index })
        } catch (error) {

        }
      }
      contentRef.current.focus()
    }, 300);
  }

  const getBookInfo = (id) => {
    if (!props.match.params.id) {
      message.error('书ID 未知')
      return
    }
    try {
      axios({
        url: `${baseUrl}fixdata/getBookInfo`,
        method: 'get',
        params: {
          id
        },
        errorTitle: '获取书本错误',
      }).then((res) => {
        const data = res && res.data && res.data.data
        if (typeof data === 'string') {
          message.error(data)
          return
        }
        if (data && typeof data === 'object') {
          setBookInfo(data)
        } else {
          message.error('获取书本失败')
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const [contentPopData, setContentPopData] = useState(null)
  const viewContent = (menu) => () => {
    if (menu.id) {
      try {
        axios({
          url: `${baseUrl}fixdata/getContent`,
          method: 'get',
          params: {
            id: menu.id
          },
          errorTitle: '获取内容错误',
        }).then((res) => {
          const data = res && res.data && res.data.data
          if (typeof data === 'string') {
            message.error(data)
            return
          }
          if (data && typeof data === 'object') {
            menu.content = data.content
            setContentPopData(menu)
          } else {
            message.error('获取内容失败')
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
  }

  const onAddMenu = (mId) => () => {
    if (!id) {
      message.error('id 呢')
      return
    }
    setPrevMenuId(mId)
    setVisible(true)
  }

  useEffect(() => {
    id && getBookInfo(id)
  }, [id])

  const initialValues = {
    mname: '',
    index: '',
    content: '',
  };

  const [toPrevOrNext, setToPrevOrNext] = useState(null)
  const toPrev = (id) => {
    setToPrevOrNext({
      id: id || contentPopData.id,
      plus: -1
    })
  }

  const toNext = (id) => {
    setToPrevOrNext({
      id: id || contentPopData.id,
      plus: 1
    })
  }

  const contentPopDataRef = useRef(contentPopData)
  useEffect(() => {
    contentPopDataRef.current = contentPopData
  }, [contentPopData])

  const keydownEvent = (e) => {
    if (contentPopDataRef.current) {
      if ([39, 40].includes(e.keyCode)) {
        toNext(contentPopDataRef.current.id)
      } else if ([37, 38].includes(e.keyCode)) {
        toPrev(contentPopDataRef.current.id)
      }
    }
  }
  useEffect(() => {
    document.documentElement.addEventListener('keydown', keydownEvent)

    return () => {
      document.documentElement.removeEventListener('keydown', keydownEvent)
    }
  }, [])

  return (
    <Wrapper className="wrapper">
      <Menus />
      <Button type="primary" onClick={onAddMenu(0)} style={{ margin: '0 15px 15px 0' }}>(第1章之前)添加第一章</Button>
      {bookInfo ? <MenuList book={bookInfo} visible={true} isPage={true} onAddMenu={onAddMenu} triggerReLoading={triggerReLoading} viewContent={viewContent} toPrevOrNext={toPrevOrNext} /> : null}
      {bookInfo ? <Modal width={800} title="目录列表" visible={visible} onOk={onOk} onCancel={() => setVisible(false)}>
        <Form name="form" form={form} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={initialValues} colon={false}>
          <Form.Item
            label="目录名称"
            name="mname"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input onPaste={onNameChange} onBlur={onNameChange} />
          </Form.Item>
          <Form.Item
            label="index"
            name="index"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="章节内容"
            name="content"
            rules={[{ required: true, message: '必填' }]}
          >
            <Input.TextArea ref={contentRef} showCount autoSize={{ minRows: 10 }} />
          </Form.Item>
        </Form>
      </Modal> : null}
      {contentPopData ? <Modal width={800} title="章节内容" visible={true} onOk={() => setContentPopData(null)} onCancel={() => setContentPopData(null)}>
        <div>
          <UL>
            <li>
              <strong>id：</strong>
              {contentPopData.id}
            </li>
            <li style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><strong>名称：</strong>{contentPopData.index}章 {contentPopData.mname}</div>
              <div>
                <Button icon={<LeftOutlined />} onClick={() => toPrev()} />
                <Button icon={<RightOutlined />} onClick={() => toNext()} />
              </div>
            </li>
            <li>
              <strong>内容：</strong>
              <Content dangerouslySetInnerHTML={{ __html: contentPopData.content }}></Content>
            </li>
          </UL>
        </div>
      </Modal> : null}
    </Wrapper>
  );
};

export default MenuPage;