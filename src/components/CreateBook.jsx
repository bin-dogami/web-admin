import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Modal, Form, Select, Input, Upload, message, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
const { Search } = Input;

const Wrapper = styled.div`
  .chunk h2 {
    margin-bottom: 0;
  }
`

const CreateBook = ({ visible, setVisible, onSearchBook }) => {
  const [form] = Form.useForm();
  const [creating, setCreating] = useState(false)

  const [typeOptions, setTypeOptions] = useState([])
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

  const onOk = () => {
    form.submit()
  }

  const createBook = (data) => {
    setCreating(true)
    try {
      axios({
        url: `${baseUrl}fixdata/createBook`,
        method: 'post',
        data,
        errorTitle: '创建错误',
      }).then((res) => {
        setCreating(false)
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message.error(data || '创建失败')
        } else {
          if (data && 'id' in data) {
            onSearchBook(data.id)
            message[data.success ? 'success' : 'error'](data.msg)
            form.resetFields()
            closePop()
          } else {
            message.error('创建失败')
          }
        }
      })
    } catch (e) {
      console.log(e)
      setCreating(false)
      message.error('创建失败: ' + e)
    }
  }

  const onFinish = async (values) => {
    if (creating) {
      return
    }
    // console.log(values)
    if (!values.typename) {
      message.error('typename 不能为空，看看怎么回事')
      return
    }
    Modal.info({
      title: '确定要创建么?',
      content: values.thumb ? '' : '图片确定没有么',
      onOk: () => {
        createBook(values)
        return Promise.resolve()
      }
    })
  }

  const onValuesChange = (changedValues, allValues) => {
    if ('typeid' in changedValues) {
      form.setFieldsValue({ typename: typeOptions.filter(({ value }) => value == changedValues.typeid)[0].label })
    }
  }

  useEffect(() => {
    visible && getTypes()
  }, [visible])

  const initialValues = {
    title: '',
    author: '',
    description: [],
    typeid: '',
    typename: '',
    thumb: '',
    recommend: '1',
  };


  const [imgList, setImgList] = useState([])
  // 0 是还没上传，1是上传完了且是 url 上传图片的，2 是上传完了 但是是 通过文件上传的
  const [uploadedByUrl, setUploadedByUrl] = useState(0)
  const [uploadedImagePath, setUploadedImagePath] = useState('')
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传</div>
    </div>
  );
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  const onPreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setImgList(file.url || file.preview)
  };

  const onRemoveImg = () => {
    setUploadedImagePath('')
    form.setFieldsValue({ thumb: '' })
    return true
  }

  const onChangeImg = (info) => {
    if (info.file.status === 'uploading') {
      const { fileList } = info
      setImgList(fileList)
    } else if (info.file.status === 'done') {
      const { fileList, file: { response: { data } } } = info
      setImgList(fileList)
      form.setFieldsValue({ thumb: data })
      setUploadedImagePath(data)
      setUploadedByUrl(2)
    } else {
      info.file.status !== 'removed' && message.error('上传图片失败')
      setImgList([])
    }
  }

  const onUploadImage = (url) => {
    if (!url.trim().length) {
      return
    }
    try {
      axios({
        url: `${baseUrl}fixdata/uploadImagesByUrl`,
        method: 'post',
        data: {
          url
        },
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (data && typeof data === 'string') {
          form.setFieldsValue({ thumb: data })
          setUploadedImagePath(data)
          setUploadedByUrl(1)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!uploadedImagePath.length) {
      setUploadedByUrl(0)
    }
  }, [uploadedImagePath])

  return (
    <Wrapper>
      <Modal
        width={500}
        title="抓取状态列表"
        visible={visible}
        onCancel={closePop}
        onOk={onOk}
        confirmLoading={creating}
        okText="确定"
      >
        <Form name="form" form={form} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={initialValues} colon={false}>
          <Form.Item
            label="书名"
            name="title"
            rules={[{ required: true, message: '书名得有啊' }]}
          >
            <Input placeholder="请输入书名" />
          </Form.Item>
          <Form.Item
            label="作者"
            name="author"
            rules={[{ required: true, message: '作者得有啊' }]}
          >
            <Input placeholder="请输入作者名" />
          </Form.Item>
          <Form.Item
            label="简介"
            name="description"
            rules={[{ required: true, message: '简介得有啊' }]}
          >
            <Input placeholder="请输入简介" />
          </Form.Item>
          <Form.Item
            label="分类id"
            name="typeid"
            rules={[{ required: true, message: '分类id必选' }]}
          >
            <Select
              placeholder="选择分类"
              // options 为8 条时会导致错误，笑死了，垃圾 ant-design https://github.com/ant-design/ant-design/issues/27282
              options={typeOptions}
            />
          </Form.Item>
          <Form.Item
            label="上传图片"
          >
            {uploadedByUrl === 2 ? null :
              <Search
                placeholder="通过输入图片地址进行上传"
                allowClear
                enterButton="上传"
                style={{ marginBottom: 15 }}
                onSearch={onUploadImage}
              />
            }

            {uploadedByUrl === 1 ? null :
              <Upload
                action={`${baseUrl}fixdata/uploadImages`}
                listType="picture-card"
                fileList={imgList}
                onPreview={onPreview}
                onChange={onChangeImg}
                onRemove={onRemoveImg}
              >
                {imgList.length >= 1 ? null : uploadButton}
              </Upload>
            }
            {uploadedImagePath.length ? <div>{uploadedImagePath}<span style={{ color: 'blue', marginLeft: 15, cursor: 'pointer' }} onClick={onRemoveImg}>删除</span></div> : null}
          </Form.Item>
          <Form.Item
            label="推荐"
            name="recommend"
          >
            <Radio.Group
              options={[{ value: '1', label: '设为推荐' }, { value: '', label: '不设为推荐', }]}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
          <Form.Item
            label="分类中文名"
            hidden={true}
            name="typename"
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="图片"
            hidden={true}
            name="thumb"
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  )
}

export default CreateBook