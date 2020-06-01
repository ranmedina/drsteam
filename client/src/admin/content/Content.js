import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PageWrapper from '../../layout/PageWrapper';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import metadataApi from '../../api/metadata';
import './Content.scss';

const mapStateToProps = (state) => state.app;
const mapDispatchToProps = (dispatch) => ({
  setAppData: (payload) => dispatch({ type: 'SET_APP_DATA', payload }),
});

const Content = (props) => {
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [ribbon, setRibbon] = useState('');
  const [content, setContent] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTitle(props.app_data.content_title);
    setRibbon(props.app_data.content_ribbon);
    setContent(props.app_data.content_content);
    setLoading(false);
  }, [props.app_data]);

  const handleTextChange = (event, setFunc) => {
    setFunc(event.target.value);
  };

  const updateContent = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      await metadataApi.updateContent(title, ribbon, content);
      setError(null);
      setShowAlert(true);
    } catch ({ response: data }) {
      console.error('updateContent failed', data.data.description);
      setError(data.data.description);
    } finally {
      setShowAlert(true);
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className='content_container'>
        <InputGroup className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text>Title</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            value={title}
            placeholder="(eg. How to enter the giveaway? type 'x' to hide content box)"
            aria-label='Title'
            onChange={(e) => handleTextChange(e, setTitle)}
          />
        </InputGroup>

        <InputGroup className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text>Ribbon</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            value={ribbon}
            placeholder='(eg. Giveaway)'
            aria-label='Title'
            onChange={(e) => handleTextChange(e, setRibbon)}
          />
        </InputGroup>

        <InputGroup className='mb-3'>
          <InputGroup.Prepend>
            <InputGroup.Text>Content</InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl
            as='textarea'
            value={content}
            aria-label='Content Textarea'
            onChange={(e) => handleTextChange(e, setContent)}
            rows='10'
          />
        </InputGroup>

        <Button className='update-btn' variant='outline-primary' size='lg' block onClick={updateContent}>
          {loading ? 'Loading...' : 'Update'}
        </Button>

        {showAlert && (
          <Alert onClick={() => setShowAlert(false)} variant={error ? 'danger' : 'success'}>
            {error ? error : 'Content successfully updated'}
          </Alert>
        )}
      </div>
    </PageWrapper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Content);
