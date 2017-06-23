// This is where action creators are put
import { SET_UPLOADED_FILE, SET_UPLOADED_FILE_STRUCTURE_DESCRIPTION, SET_UPLOAD_SCAN_PROCESS, CLEAR_UPLOAD_STATE } from '../constants/uploadLabels';

const setUploadedFile = (fileName) => {
  return {
    type: SET_UPLOADED_FILE,
    payload: {
      fileName: fileName
    }
  };
};

const setUploadedFileStructureDescription = () => {
  return {
    type: SET_UPLOADED_FILE_STRUCTURE_DESCRIPTION,
    payload: {
    }
  };
};

const setUploadScanProcess = (uploadScanProcess) => {
  return {
    type: SET_UPLOAD_SCAN_PROCESS,
    payload: {
      uploadScanProcess: uploadScanProcess
    }
  };
};

const clearUploadState = () => {
  return {
    type: CLEAR_UPLOAD_STATE
  };
};

const actions = {
  setUploadedFile,
  setUploadedFileStructureDescription,
  setUploadScanProcess,
  clearUploadState
};

export default actions;
