import React, { Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loading from '@/components/Loading';

import Book from '../pages/spider/book'
import FieldsSetting from '../pages/spider/fieldsSetting'
import SpiderError from '../pages/spider/spiderError'
import TumorClear from '../pages/spider/tumorClear'
import SubmitSeo from '../pages/spider/submitSeo'
import Visitors from '../pages/spider/visitors'
import MenuList from '../pages/spider/menuList'
import FragmentFunctions from '../pages/spider/fragmentFunctions'

const Routes = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      < Route exact path='/' component={Book} />
      < Route exact path='/fieldsSetting' component={FieldsSetting} />
      < Route exact path='/spiderError' component={SpiderError} />
      {/* < Route exact path='/repeatsMenu' component={RepeatsMenu} /> */}
      {/* < Route exact path='/failedPages' component={FailedPages} /> */}
      < Route exact path='/tumorClear' component={TumorClear} />
      < Route exact path='/submitSeo' component={SubmitSeo} />
      < Route exact path='/visitors' component={Visitors} />
      < Route exact path='/menuList/:id' component={MenuList} />
      < Route exact path='/fragmentFunctions' component={FragmentFunctions} />
      <Redirect from="*" to='/' />
    </Switch>
  </Suspense>
);

export default Routes;
