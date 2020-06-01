import React from 'react';
import './PageWrapper.scss';

export default (props) => {
  return <div className='page_wrapper'>{props.children}</div>;
};
