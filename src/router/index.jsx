import React, { Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loading from '@/components/Loading';

import Book from '../pages/spider/book'
import FailedPages from '../pages/spider/failedPages'
import FieldsSetting from '../pages/spider/fieldsSetting'
import TumorClear from '../pages/spider/tumorClear'
import Page from '../pages/spider/page'

const Routes = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      < Route exact path='/' component={Book} />
      < Route exact path='/failedPages' component={FailedPages} />
      < Route exact path='/fieldsSetting' component={FieldsSetting} />
      < Route exact path='/tumorClear' component={TumorClear} />
      < Route exact path='/page' component={Page} />
      <Redirect from="*" to='/' />
    </Switch>
  </Suspense>
);

export default Routes;
