import React, { Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loading from '@/components/Loading';

const Book = React.lazy(() => import('../pages/spider/book'));
const Menu = React.lazy(() => import('../pages/spider/menu'));
const Page = React.lazy(() => import('../pages/spider/page'));

const Routes = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      < Route exact path='/' component={Book} />
      < Route exact path='/menu' component={Menu} />
      < Route exact path='/page' component={Page} />
      <Redirect from="*" to='/' />
    </Switch>
  </Suspense>
);

export default Routes;
