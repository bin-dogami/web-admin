import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, Select, Radio, message } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';

const GetDatas = () => {
  const viewTotalBooks = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/viewTotalBooks`,
        method: 'get',
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const viewTotalMenus = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/viewTotalMenus`,
        method: 'get',
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="chunk" style={{ marginBottom: 20 }}>
      <div>
        <Button onClick={viewTotalBooks} style={{ marginRight: 15 }}>书本总数</Button>
        <Button onClick={viewTotalMenus} style={{ marginRight: 15 }}>目录总数</Button>
        <Button onClick={() => message.info('功能待开发')}>探查index异常的书</Button>
      </div>
    </div>
  )
}

export default GetDatas