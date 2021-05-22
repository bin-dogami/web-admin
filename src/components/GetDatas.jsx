import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { Button, Modal, Table, Select, Radio, message } from 'antd';
import axios from '@/utils/axios';
import { baseUrl, scanUrl, onCopyHref, isDev } from '@/utils/index';
import ModifyAction from '@/components/ModifyAction.jsx'
import CreateBook from './CreateBook'
import CreateType from './CreateType'
import CreateSpiderHostObject from './CreateSpiderHostObject'

const GetDatas = ({ onSearchBook }) => {
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

  const fixAllLostMenus = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/fixLostMenus`,
        method: 'post',
        errorTitle: '修复错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          data && message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const fixPageInvalid = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/fixPageInvalid`,
        method: 'post',
        errorTitle: '修复错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          data && message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const fixBoosFrom = () => {
    try {
      axios({
        url: `${baseUrl}fixdata2/fixBoosFrom`,
        method: 'post',
        errorTitle: '修复错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          data && message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  // 修复所有的推荐表里的书的字段（和novel表里的同一名的字段），比如title,thumb
  const fixRecommends = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/fixRecommends`,
        method: 'post',
        errorTitle: '修复错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          data && message.info(data)
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const [createBookVisible, setCreateBookVisible] = useState(false)
  const [createType, setCreateType] = useState(false)

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

  const testGetKeywordPos = () => {
    try {
      axios({
        url: `${baseUrl}fixdata/queryKeywords`,
        method: 'get',
        params: {
          id: '28459',
          keywords: ['境界划分', '武道境界', '武道修炼'].join(','),
        },
        errorTitle: '获取错误',
      }).then((res) => {
        const data = res && res.data && res.data.data;
        if (typeof data === 'string') {
          message.info(data || '有错误了')
        }
      })
    } catch (e) {
      console.log(e)
    }
  }

  const [addSpiderHostObject, setAddSpiderHostObject] = useState(false)

  return (
    <div className="chunk" style={{ marginBottom: 20 }}>
      <div>
        <Button onClick={viewTotalBooks} style={{ marginRight: 15 }}>书本总数</Button>
        <Button onClick={viewTotalMenus} style={{ marginRight: 15 }}>目录总数</Button>
        <Button onClick={() => setCreateBookVisible(true)} style={{ marginRight: 15 }}>添加书</Button>
        <Button onClick={() => setCreateType(true)} style={{ marginRight: 15 }}>增加分类</Button>
        <Button onClick={fixAllLostMenus} style={{ marginRight: 15 }}>修复所有缺失目录</Button>
        <Button onClick={fixPageInvalid} style={{ marginRight: 15 }}>修复内容正在手打中</Button>
        <Button onClick={fixRecommends} style={{ marginRight: 15 }}>修复所有推荐</Button>
        {isDev ?
          <Button onClick={testGetKeywordPos} style={{ marginRight: 15 }}>获取某本书关键词出现的位置</Button>
          : null
        }
        <Button onClick={() => setAddSpiderHostObject(true)} style={{ marginRight: 15 }}>添加抓取结构</Button>
        <Button onClick={fixBoosFrom} style={{ marginRight: 15 }}>paoshuzw.com => xbiquge.la</Button>
        {/* <Button onClick={() => message.info('功能待开发')}>探查index异常的书</Button> */}
        {/* <Button onClick={() => message.info('功能待开发')}>域名替换</Button> */}
        {/* 用完了记得注释掉 */}
        {/* <Button onClick={onFindAllBooksIndexEq0}>找出所有index=0的书</Button> */}
        {/* <ModifyAction name={"clearAllBooks"} modifyFnName={onClearAllBooks} html={<Button>所有书内容清理</Button>} /> */}
        <CreateBook visible={createBookVisible} setVisible={setCreateBookVisible} onSearchBook={onSearchBook} />
        <CreateType visible={createType} setVisible={setCreateType} />
        <CreateSpiderHostObject visible={addSpiderHostObject} setVisible={setAddSpiderHostObject} />
      </div>
    </div>
  )
}

export default GetDatas