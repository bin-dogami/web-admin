import React, { useEffect, useState } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { baseUrl, isDev, onCopyHref } from '@/utils/index';
import styled from 'styled-components';

const Wapper = styled.div`
  display: inline-block;
  margin-top: 10px;

  .ant-upload-picture-card-wrapper {
    width: auto;
  }

  .ant-upload-list-picture-card-container {
    height: auto;
  }

  .ant-upload-list-picture-card .ant-upload-list-item {
    width: 100px!important;
  }

  img {
    width: 100px!important;
  }

  span {
    margin-right: 0!important;
  }
`

const UploadImg = ({ id, thumb }) => {
  const [imgList, setImgList] = useState([{
    uid: id,
    name: thumb,
    status: 'done',
    url: `https://m.zjjdxr.com/${thumb}`
  }])
  // 0 是还没上传，1是上传完了且是 url 上传图片的，2 是上传完了 但是是 通过文件上传的
  const [uploadedByUrl, setUploadedByUrl] = useState(0)
  const [uploadedImagePath, setUploadedImagePath] = useState(thumb)
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
    setUploadedImagePath(thumb)
    return true
  }

  const onChangeImg = (info) => {
    console.log(info)
    if (info.file.status === 'uploading') {
      const { fileList } = info
      setImgList(fileList)
    } else if (info.file.status === 'done') {
      const { fileList, file: { response: { data } } } = info
      // fileList[0].thumbUrl = isDev ? data :
      setImgList(isDev ? fileList : [{
        uid: id,
        name: data,
        status: 'done',
        url: `https://m.zjjdxr.com/${data}`
      }])
      setUploadedImagePath(data)
      setUploadedByUrl(2)
    } else {
      info.file.status !== 'removed' && message.error('上传图片失败')
      setImgList([])
    }
  }

  useEffect(() => {
    console.log(imgList)
  }, [imgList])

  return (
    <Wapper>
      <Upload
        action={`${baseUrl}fixdata/uploadImages`}
        listType="picture-card"
        fileList={imgList}
        data={{ id }}
        onPreview={onPreview}
        onChange={onChangeImg}
        onRemove={onRemoveImg}
      >
        {imgList.length >= 1 ? null : uploadButton}
      </Upload>
      { uploadedImagePath.length ? <div style={{ display: 'inline-block' }}>{uploadedImagePath}</div> : null}
    </Wapper>
  )
}

export default UploadImg