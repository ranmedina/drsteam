import React from 'react';
import { connect } from 'react-redux';
import './Home.scss';
import Menu from './Menu';
import SiteStats from './SiteStats';
import ContentBox from './ContentBox';
import { Helmet } from 'react-helmet';

const mapStateToProps = (state) => state.user;

const Home = (props) => {
  return (
    <>
      <Helmet>
        <title>Dr.Steam - Examine your steam account</title>
        <meta
          name='description'
          content='Dr. Steam interacts with Steam platform and lets you to evaluate and examine your steam account in vary ways - inventory (CS:GO, Dota2, etc), steam id, steam value and more.'
        ></meta>
      </Helmet>
      <SiteStats socket={props.socket} />
      <ContentBox />
      <Menu />
    </>
  );
};

export default connect(mapStateToProps)(Home);
