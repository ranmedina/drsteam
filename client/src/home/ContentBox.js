import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import './ContentBox.scss';

const mapStateToProps = (state) => state.app;

const ContentBox = (props) => {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [ribbon, setRibbon] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (props.app_data.content_title !== null) {
      setTitle(props.app_data.content_title);
      setRibbon(props.app_data.content_ribbon);
      setContent(props.app_data.content_content.split('\\n'));
    }
    setLoading(false);
  }, [props.app_data]);

  return (
    <>
      {title !== 'x' && (
        <div className='contentbox_container'>
          <div className='ribbon ribbon-top-left'>
            <span>{loading ? 'Loading...' : ribbon}</span>
          </div>
          <h1>{loading ? 'Loading...' : title}</h1>
          <div>
            {loading
              ? 'Loading...'
              : props.app_data.content_content &&
                content.map((e, idx) => (
                  <p key={idx} style={{ height: e === '' ? '20px' : 'unset' }} dangerouslySetInnerHTML={{ __html: e }}></p>
                ))}
          </div>
        </div>
      )}
    </>
  );
};

export default connect(mapStateToProps)(ContentBox);
