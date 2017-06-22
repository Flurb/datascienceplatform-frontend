import { connect } from 'react-redux';
import UploadComponent from '../../../components/UploadComponent';
import TitleComponent from '../../../components/TitleComponent';
import actions from '../../../actions/userActions';
import uploadActions from '../../../actions/uploadActions';
import { actions as formActions } from 'react-redux-form';
import wpsActions from '../../../actions/WPSActions';

const mapStateToUploadProps = (state) => {
  return { ...state.fileDescriptionState, ...state.fileStructureDescription, ...state.userState, ...state.uploadState, ...state.WPSState };
};

const mapStateToTitleProps = (state) => {
  return { ...state.userState };
};

const mapDispatchToTitleProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

const mapDispatchToUploadProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: uploadActions,
    formActions: formActions,
    wpsActions: wpsActions
  });
};

// Sync route definition
export default () => ({
  title: 'Upload File',
  components : {
    header: connect(mapStateToTitleProps, mapDispatchToTitleProps)(TitleComponent),
    mainContent: connect(mapStateToUploadProps, mapDispatchToUploadProps)(UploadComponent)
  }
});
