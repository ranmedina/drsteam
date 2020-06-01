import React from 'react';
import './MenuItem.scss';
import { withRouter } from 'react-router-dom';

const MenuItem = (props) => {
  const { url, disabled } = props;

  const redirect = (url) => {
    if (disabled) {
      return;
    }
    
    props.history.push(url);
  };

  return (
    <React.Fragment>
      <div className={`new_item_container ${disabled ? 'disabled' : ''}`} onClick={() => redirect(url)}>
        <div className='hovering_block'></div>
        <p className='item_button'>{props.children}</p>
      </div>
    </React.Fragment>
  );
};

export default withRouter(MenuItem);
