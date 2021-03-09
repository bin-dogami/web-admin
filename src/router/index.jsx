import React, { Suspense } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Loading from '@/components/Loading';

import Book from '../pages/spider/book'
import FailedPages from '../pages/spider/failedPages'
import FieldsSetting from '../pages/spider/fieldsSetting'
import LastMenuLost from '../pages/spider/lastMenuLost'
import RepeatsMenu from '../pages/spider/repeatsMenu'
import TumorClear from '../pages/spider/tumorClear'
import FragmentFunctions from '../pages/spider/fragmentFunctions'

const Routes = () => (
  <Suspense fallback={<Loading />}>
    <Switch>
      < Route exact path='/' component={Book} />
      < Route exact path='/failedPages' component={FailedPages} />
      < Route exact path='/fieldsSetting' component={FieldsSetting} />
      < Route exact path='/lastMenuLost' component={LastMenuLost} />
      < Route exact path='/repeatsMenu' component={RepeatsMenu} />
      < Route exact path='/tumorClear' component={TumorClear} />
      < Route exact path='/fragmentFunctions' component={FragmentFunctions} />
      <Redirect from="*" to='/' />
    </Switch>
  </Suspense>
);

export default Routes;
