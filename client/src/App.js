import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import AppWrapper from './layout/AppWrapper';
import Navigation from './layout/Navigation';
import LoadingOverlay from './layout/LoadingOverlay';
import Home from './home/Home';
import { connect } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import Inventory from './inventory/Inventory';
import UserApi from './api/user';
import MetadataApi from './api/metadata';
import Floater from './float/Floater';
import io from 'socket.io-client';
import Footer from './layout/Footer';
import { SERVER_HOST } from './api/index';
import SteamId from './steamid/SteamId';
import Settings from './admin/settings/Settings';
import Users from './admin/users/Users';
import SiteClosed from './layout/SiteClosed';
import Content from './admin/content/Content';
import SteamValue from './steamvalue/SteamValue';

const socket = io(`${SERVER_HOST}`);

const mapStateToProps = (state) => state;

const mapDispatchToProps = (dispatch) => ({
  setLoading: (payload) => dispatch({ type: 'SET_LOADING', payload }),
  setGameList: (payload) => dispatch({ type: 'SET_GAME_LIST', payload }),
  setAppData: (payload) => dispatch({ type: 'SET_APP_DATA', payload }),
  setUser: (payload) => dispatch({ type: 'SET_USER', payload }),
  setPagesStatus: (payload) => dispatch({ type: 'SET_PAGES_STATUS', payload }),
});

const App = (props) => {
  const [loading, setLoading] = useState(true);
  const [userSet, setUserSet] = useState(false);
  const [admin, setAdmin] = useState(false);
  const { setGameList, setAppData, setUser, setPagesStatus } = props;

  useEffect(() => {
    let unmounted = false;
    if (unmounted) {
      return;
    }

    Promise.resolve()
      .then(async () => {
        const { data } = await UserApi.getSummary();
        setUser(data);
        setAdmin(!!data.admin);
        setUserSet(true);
      })
      .then(async () => {
        const { data } = await MetadataApi.getGameList();
        setGameList(data);
      })
      .then(async () => {
        const appData = (await MetadataApi.getAppData()).data.data;
        setAppData(appData);
        const pagesData = (await MetadataApi.getPagesStatus()).data.data;
        setPagesStatus(pagesData);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });

    socket.on('site status change', (_status) => {
      if (!admin) {
        window.location.reload();
      }
    });

    return () => {
      socket.off('site status change');
      unmounted = true;
    };
  }, [setGameList, setAppData, setUser, setPagesStatus, admin]);

  const ProtectedRoute = (
    { component: Component, ...rest } // Authorized pages
  ) => <Route {...rest} render={(props) => (admin ? <Component {...props} socket={socket} /> : <Redirect to='/' />)} />;

  const RouteCheck = ({ component: Component, ...rest }) => {
    // Checks whether page is disabled or not
    const page = rest.path.slice(1, rest.path.length);
    return (
      <Route
        {...rest}
        render={(properties) => (props.app.pages[page] ? <Component {...properties} socket={socket} /> : <Redirect to='/' />)}
      />
    );
  };

  const SiteClosedWithConditions = (props) => {
    const { state } = props;
    if (!state.app.app_data.site_status) {
      if (!state.user.username || (state.user.username && !state.user.admin)) {
        return <SiteClosed />;
      }
    }

    return null;
  };

  return (
    <AppWrapper>
      <SiteClosedWithConditions state={props} />
      {(props.app.app_data.site_status || (!props.app.app_data.site_status && admin)) && (
        <>
          <LoadingOverlay loading={loading || !userSet || navigator.userAgent === 'ReactSnap'} />
          {!loading && (
            <>
              <Navigation page={window.location.pathname} />
              <Switch>
                <Route exact path='/' render={(props) => <Home {...props} socket={socket} />} />
                <RouteCheck path='/inventory' component={Inventory} />
                <RouteCheck path='/floater' component={Floater} />
                <RouteCheck path='/steamid' component={SteamId} />
                <RouteCheck path='/steamvalue' component={SteamValue} />
                <ProtectedRoute path='/admin/settings' component={Settings} />
                <ProtectedRoute path='/admin/users' component={Users} />
                <ProtectedRoute path='/admin/content' component={Content} />
                <Redirect from='*' to='/' />
                <Route render={(props) => <Home {...props} socket={socket} />} />
              </Switch>
              <Footer />
            </>
          )}
        </>
      )}
    </AppWrapper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
