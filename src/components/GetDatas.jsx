import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, Select, Radio, message } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref } from '@/utils/index';
import ModifyAction from '@/components/ModifyAction.jsx'

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

  // const onClearAllBooks = () => () => {
  //   try {
  //     axios({
  //       url: `${baseUrl}fixdata/clearAllBooks`,
  //       method: 'get',
  //       errorTitle: '获取错误',
  //     }).then((res) => {
  //       const data = res && res.data && res.data.data;
  //       if (typeof data === 'string') {
  //         message.info(data)
  //       }
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // const onFindAllBooksIndexEq0 = () => {
  //   try {
  //     axios({
  //       url: `${baseUrl}fixdata/findAllBooksIndexEq0`,
  //       method: 'get',
  //       errorTitle: '获取错误',
  //     }).then((res) => {
  //       const data = res && res.data && res.data.data;
  //       if (typeof data === 'string') {
  //         message.info(data || '都找过完了')
  //       }
  //     })
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  return (
    <div className="chunk" style={{ marginBottom: 20 }}>
      <div>
        <Button onClick={viewTotalBooks} style={{ marginRight: 15 }}>书本总数</Button>
        <Button onClick={viewTotalMenus} style={{ marginRight: 15 }}>目录总数</Button>
        {/* <Button onClick={() => message.info('功能待开发')}>探查index异常的书</Button> */}
        {/* <Button onClick={() => message.info('功能待开发')}>域名替换</Button> */}
        {/* 用完了记得注释掉 */}
        {/* <Button onClick={onFindAllBooksIndexEq0}>找出所有index=0的书</Button> */}
        {/* <ModifyAction name={"clearAllBooks"} modifyFnName={onClearAllBooks} html={<Button>所有书内容清理</Button>} /> */}
      </div>
    </div>
  )
}

export default GetDatas