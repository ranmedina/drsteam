import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import './Navigation.scss';
import SteamUser from './SteamUser';
import SVG from 'react-inlinesvg';
import Badge from 'react-bootstrap/Badge';

const mapStateToProps = (state) => state;
const mapDispatchToProps = (dispatch) => ({
  setAdminMode: (payload) => dispatch({ type: 'SET_ADMIN_MODE', payload }),
});

const Navgiation = (props) => {
  const [lastModified, setLastModified] = useState(null);
  const [loading, setLoading] = useState(false);
  const [calls, setCalls] = useState(0);
  const [isShrinked, setShrinked] = useState(false);
  const [navCollapse, setNavCollapse] = useState(false);
  const [pages, setPages] = useState([
    {
      hidden: true,
      url_name: '/',
      title: 'Welcome!',
      description: 'Choose one of our sections to examine your steam.',
    },
    {
      url_name: '/steamid',
      navTitle: 'Steam ID',
      title: 'Steam ID Converter',
      description: 'Convert your Steam ID/URL to ID32, ID64 and ID3',
    },
    {
      url_name: '/inventory',
      title: 'Inventory',
      description: 'Select a game, enter your Steam ID and press fetch to value your inventory.',
    },
    {
      url_name: '/floater',
      title: 'Floater',
      description: 'Float values are the precise wear value of a skin. Check yours now!',
    },
    {
      url_name: '/steamvalue',
      title: 'Steam Value',
      description:
        'Steam Value values your steam account by calculating all of your games price.',
      newBadge: true,
    },
    {
      url_name: '/admin/settings',
      admin: true,
      title: 'Settings',
      description: 'Manage website settings',
    },
    {
      url_name: '/admin/users',
      admin: true,
      title: 'Users',
      description: 'Manage website registered users',
    },
    {
      url_name: '/admin/content',
      admin: true,
      navTitle: 'Content',
      title: 'Content Management',
      description: 'Manage homepage content box',
    },
  ]);

  const handleScrolling = useCallback(() => {
    const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

    if (scrollTop <= 20 && isShrinked) {
      setShrinked(false);
    } else if (scrollTop > 20 && !isShrinked) {
      setShrinked(true);
    }
  }, [isShrinked]);

  useEffect(() => {
    setLoading(true);
    const statePages = Object.keys(props.app.pages).map((e) => '/' + e);
    pages.forEach((e) => {
      if (statePages.includes(e.url_name)) {
        const index = pages.findIndex((s) => s.url_name === e.url_name);
        let newPages = pages;
        newPages[index].disabled = !props.app.pages[e.url_name.slice(1, e.url_name.length)];
        setLastModified(newPages[index]);
        setPages(newPages);
      }
    });
    // A weird React bug, or mine that I haven't exposed yet, making React doesn't render properly children elements by pages state.
    // Therefore, I am making a workaround to know if useEffect has been called 2 times - if yes, the next one is by the user (changed on settings).
    // If its called by the user, I am setting the element's 'disabled' property to its opposite in order to render properly.
    setCalls((c) => c + 1);
    window.addEventListener('scroll', handleScrolling);
    setLoading(false);

    return () => window.removeEventListener('scroll', handleScrolling);
  }, [pages, props.app.pages, handleScrolling]);

  const toggleAdminMode = (mode) => {
    props.setAdminMode(mode);
    props.history.push(mode ? '/admin/settings' : '/');
  };

  const getUrlInfo = (pathname, property) => {
    const findIndex = pages.find((e) => e.url_name === pathname);
    if (findIndex) {
      return findIndex[property];
    }
    return pages.find((e) => e.url_name === '/')[property];
  };

  const toggleCollapse = (toggle) => {
    if (toggle) {
      document.getElementById('root').style.position = 'fixed';
      document.getElementById('root').style.width = '100%';
    } else {
      document.getElementById('root').style.position = 'unset';
      document.getElementById('root').style.width = 'unset';
    }
    setNavCollapse(toggle);
  };

  return (
    <>
      <Navbar expanded={navCollapse} expand='lg' bg='dark' variant='dark' fixed='top' className={isShrinked ? 'shrinked' : ''}>
        <Navbar.Brand as={NavLink} to='/'>
          <div className='logo'>
            <p>Dr. Steam</p>
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' onClick={() => toggleCollapse(!navCollapse)} />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='mr-auto'>
            {!loading &&
              pages.map((e) => {
                if (props.app.adminMode) {
                  return (
                    !e.hidden &&
                    e.admin && (
                      <Nav.Link
                        key={e.title}
                        as={NavLink}
                        to={e.url_name}
                        disabled={e.disabled}
                        className={e.disabled ? 'disabled' : ''}
                        onClick={() => toggleCollapse(false)}
                      >
                        {e.navTitle ? e.navTitle : e.title}
                      </Nav.Link>
                    )
                  );
                } else {
                  // As mentioned above, if its the initial change by the user, set the property value to its opposite.
                  if (calls === 1 && Object.is(lastModified, e) && props.user.nickname) {
                    e.disabled = !e.disabled;
                    setCalls(100);
                  }

                  return (
                    !e.hidden &&
                    !e.admin && (
                      <Nav.Link
                        key={e.title}
                        as={NavLink}
                        to={e.url_name}
                        disabled={e.disabled}
                        className={e.disabled ? 'disabled' : ''}
                        onClick={() => toggleCollapse(false)}
                      >
                        <SVG src={require(`../assets/${e.url_name.slice(1, e.url_name.length)}.svg`).default} />
                        {/* <img src={require('../assets/steamid.svg').default} /> */}
                        {e.navTitle ? e.navTitle : e.title}
                        {e.newBadge && !e.disabled ? <Badge variant='success'>NEW</Badge> : false}
                      </Nav.Link>
                    )
                  );
                }
              })}
          </Nav>
          {props.user.admin && (
            <div className='acp-button' onClick={() => toggleAdminMode(!props.app.adminMode)}>
              ACP ({props.app.adminMode ? 'ON' : 'OFF'})
            </div>
          )}
          <SteamUser />
        </Navbar.Collapse>
      </Navbar>
      <div className='image-jumbotron'>
        {' '}
        <div className='image'></div>
        {props.location.pathname !== '/' && (
          <div className='text'>
            <h1>{getUrlInfo(props.location.pathname, 'title')}</h1>
            <p>{getUrlInfo(props.location.pathname, 'description')}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Navgiation));
