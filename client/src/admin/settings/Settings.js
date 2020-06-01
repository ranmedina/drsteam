import React from 'react';
import BootstrapSwitchButton from 'bootstrap-switch-button-react';
import PageWrapper from '../../layout/PageWrapper';
import './Settings.scss';
import { withRouter } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { connect } from 'react-redux';
import metadataApi from '../../api/metadata';

const mapStateToProps = (state) => ({
  ...state.app,
});
const mapDispatchToProps = (dispatch) => ({
  setPagesStatus: (payload) => dispatch({ type: 'SET_PAGES_STATUS', payload }),
});

const Settings = (props) => {
  const { socket } = props;
  const pageUrls = ['/inventory', '/floater', '/steamid', '/steamvalue'];

  const toggleSiteStatus = (status) => {
    socket.emit('site status change', status);
  };

  const togglePageStatus = async (status, e) => {
    try {
      const pageName = e.slice(1, e.length);
      await metadataApi.setPageStatus(pageName, status);
      props.setPagesStatus({ ...props.pages, [pageName]: status });
    } catch ({ response: data }) {
      console.log('settingPageStatus failed', data);
    }
  };

  return (
    <PageWrapper>
      <div className='settings_container'>
        <Container fluid>
          <Row>
            <Col>Site Status</Col>
            <Col>
              {' '}
              <BootstrapSwitchButton
                checked={!!props.app_data.site_status}
                onstyle='primary'
                onChange={(status) => toggleSiteStatus(status)}
              />
            </Col>
          </Row>
          <div className='divider'></div>
          {pageUrls.map((p) => {
            return (
              <React.Fragment key={p}>
                <Row>
                  <Col>{p.slice(1, 2).toUpperCase() + p.slice(2, p.length)}</Col>
                  <Col>
                    <BootstrapSwitchButton
                      checked={props.pages[p.slice(1, p.length)]}
                      onstyle='primary'
                      onChange={(status) => togglePageStatus(status, p)}
                    />
                  </Col>
                </Row>
                <div className='divider'></div>
              </React.Fragment>
            );
          })}
        </Container>
      </div>
    </PageWrapper>
  );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Settings));
