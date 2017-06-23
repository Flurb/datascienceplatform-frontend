
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Row, Card, Col, Label, Input, Modal, ModalHeader, ModalBody, Progress, ModalFooter } from 'reactstrap';
import Icon from 'react-fa';
import PreviewComponent from './PreviewComponent';
import { withRouter } from 'react-router';

class RenderProcesses extends Component {
  renderProcess (process) {
    const { accessToken } = this.props;
    let value = '';
    try {
      value = process.result.ExecuteResponse.ProcessOutputs.Output.Data.LiteralData.value;
      value = value.replace('/opendap/', '/opendap/' + accessToken + '/');
    } catch (e) {
    }
    return (
      <Card>
        <Row>
          <Col> <div className='text-center'>{process.percentageComplete} </div><Progress value={process.percentageComplete} /></Col>
          <Col>{process.message}</Col>
          <Col>{value}</Col>
        </Row>
        { value && value.length > 0 ? <h2>Succesfully wrangled:</h2> : null }
        <PreviewComponent
          file={value}
          numberOfLinesDisplayed={10}
          tableClassName='previewTable'
          componentClassName='previewComponent'
        />

      </Card>
    );
  }

  iterProcesses (runningProcesses) {
    let result = [];
    for (var process in runningProcesses) {
      result.push(Object.assign({}, this.renderProcess(runningProcesses[process]), { key: process }));
    };
    return result;
  }
  render () {
    const { runningProcesses } = this.props;
    return (<span>{this.iterProcesses(runningProcesses)}</span>);
  }
};

RenderProcesses.propTypes = {
  runningProcesses: PropTypes.object.isRequired,
  accessToken: PropTypes.string.isRequired
};

const defaultWranglingSettings = {
  inputCSVPath : 'ExportOngevalsData.csv',
  metaCSVPath : 'ExportOngevalsData_descr.json',
  dataURL : 'http://opendap.knmi.nl/knmi/thredds/dodsC/DATALAB/hackathon/radarFullWholeData.nc',
  dataVariables : 'image1_image_data',
  limit : '150'
};

class WranglerComponent extends Component {
  constructor () {
    super();
    this.metaDataClicked = this.metaDataClicked.bind(this);
    this.toggle = this.toggle.bind(this);
    this.startWrangling = this.startWrangling.bind(this);
    this.loadCatalog = this.loadCatalog.bind(this);
    this.handleCheckBox = this.handleCheckBox.bind(this);
    this.state = {
      modal: false,
      inputCSVPath:null,
      catalog:null,
      selectedMetadataCatalog: null,
      selectedWranglingCatalog: null,
      wpsWranglerSettings: Object.assign({}, defaultWranglingSettings),
      checkBoxSettings: {}
    };

    this.domainLoaded = false;
  }

  calculateClicked (id) {
    const { accessToken, dispatch, actions, nrOfStartedProcesses, domain } = this.props;
    dispatch(actions.startWPSExecute(domain, accessToken, 'binaryoperatorfornumbers_10sec', 'inputa=10;inputb=2;operator=divide', nrOfStartedProcesses));
  };

  toggle () {
    this.setState({
      modal: !this.state.modal,
      title:'',
      id:''
    });
  }

  metaDataClicked (title, id, _this) {
    let catalogs = this.state.catalog;
    for (let j = 0; j < catalogs.catalog.length; j++) {
      let catalog = catalogs.catalog[j];
      if (id === catalog.name) {
        this.setState({
          modal: !this.state.modal,
          title:title,
          id:id,
          selectedMetadataCatalog: Object.assign({}, catalog)
        });
      }
    }
  };

  renderCatalogs () {
    let catalogs = this.state.catalog;
    let html = [];
    for (let j = 0; j < catalogs.catalog.length; j++) {
      let catalog = catalogs.catalog[j];
      html.push(Object.assign({}, this.renderParam(catalog.title, catalog.name), { key: j }));
    }

    return html;
  };

  handleCheckBox (id) {
    let newC = Object.assign({}, this.state.checkBoxSettings);
    console.log(newC);
    let catalogs = this.state.catalog;
    let catalog = null;
    for (let j = 0; j < catalogs.catalog.length; j++) {
      newC[catalogs.catalog[j].name] = false;
      if (id === catalogs.catalog[j].name) {
        catalog = catalogs.catalog[j];
      }
    };
    newC[id] = true;
    let dataVariables = '';
    for (let j = 0; j < catalog.parameterList.length; j++) {
      if (j > 0) dataVariables += ',';
      dataVariables += catalog.parameterList[j].varName;
    }
    this.setState({
      checkBoxSettings: newC,
      wpsWranglerSettings:  Object.assign(
      {},
      this.state.wpsWranglerSettings,
        {
          dataURL: catalog.datalocation,
          dataVariables: dataVariables
        }
      )
    });
  };

  renderParam (title, id) {
    return (<Row style={{ background:'#EEE', margin:'10px' }}>
      <Col style={{ width:'600px', padding: '7px 0 0 15px' }} >
        <Label check >
          <input checked={this.state.checkBoxSettings[id]} onClick={(e, c) => { this.handleCheckBox(id); }} type='checkbox' /> {title}
        </Label>
      </Col>
      <Col xs='1'>
        <Button color='info' onClick={() => { this.metaDataClicked(title, id, this); }}><Icon name='list' /></Button>
      </Col>
    </Row>);
  };

  startWrangling () {
    const { dispatch, nrOfStartedProcesses, actions, domain, accessToken } = this.props;

    let wranglingSettings = Object.assign({}, this.state.wpsWranglerSettings);

    let dataInputs = '';
    for (var key in wranglingSettings) {
      var value = wranglingSettings[key];
      dataInputs += key + '=' + encodeURIComponent(value) + ';';
    }
    console.log(dataInputs);
    dispatch(actions.startWPSExecute(domain, accessToken, 'wrangleProcess',
      dataInputs,
      nrOfStartedProcesses
    ));
  };

  componentWillReceiveProps (nextProps) {
    const { domain } = nextProps;
    if (!domain) {
      return;
    }
    this.loadCatalog(domain);
  }

  loadCatalog (domain) {
    if (domain && this.domainLoaded === false) {
      this.domainLoaded = true;
      let url = 'https://' + domain + '/catalog/list';
      console.log('Fetching catalog url', url);
      fetch(url,
        {
          credentials:'include'
        }).then((result) => {
          return result.json();
        }).then((json) => {
          this.setState({
            catalog: json
          });
        });
    }
  };

  componentDidMount () {
    this.setState({
      wpsWranglerSettings:  Object.assign(
        {},
        this.state.wpsWranglerSettings,
        {
          inputCSVPath: this.props.inputCSVPath,
          metaCSVPath: this.props.metaCSVPath
        }
        )
    });
  }

  handleChange (name, value) {
    this.setState({
      [name]: value
    });
  };

  render () {
    this.loadCatalog(this.props.domain);
    const { accessToken, clientId, domain, metaCSVPath, runningProcesses } = this.props;
    if (!clientId || !this.state.catalog) return (<div>Not signed in</div>);
    let file = 'https://' + domain + '/opendap/' + accessToken + '/' + clientId.replace('/', '.') + '/' + this.state.wpsWranglerSettings.inputCSVPath;
    return (
      <div>
        { // <Row>
        //   <Col>{ clientId !== null ? <p>{clientId}</p> : <p>Your clientID: Not logged in</p> }</Col>
        //   <Col>{domain}</Col>
        //   <Col>{accessToken}</Col>
        // </Row>
        }
        <h3>Provided inputs from upload:</h3>
        <Row style={{ background:'#EEE', margin:'10px' }}>
          <Col xs='2'>
            <Label>inputCSVPath</Label>
          </Col>
          <Col>
            <Label>{this.state.wpsWranglerSettings.inputCSVPath}</Label>
          </Col>
        </Row>
        <Row style={{ background:'#EEE', margin:'10px' }}>
          <Col xs='2'>
            <Label>metaCSVPath</Label>
          </Col>
          <Col>
            <Label>{metaCSVPath}</Label>
          </Col>
        </Row>
        <h3>Select meteorological parameters:</h3>
        {
          this.renderCatalogs()
        }

        {<pre>{this.state.wpsWranglerSettings ? JSON.stringify(this.state.wpsWranglerSettings, null, 2) : null }</pre>}
        <h3>CSV Preview (10 rows)</h3>
        <PreviewComponent
          file={file}
          numberOfLinesDisplayed={10}
          tableClassName='previewTable'
          componentClassName='previewComponent'
        />
        <hr />
        <RenderProcesses runningProcesses={runningProcesses} accessToken={accessToken} />
        <Button color='primary' style={{ float:'right' }} onClick={this.startWrangling}>Start wrangling</Button>
        <Modal className='catalogMetadataModal' isOpen={this.state.modal} toggle={this.toggle}>
          <ModalHeader toggle={this.toggle}>Metadata for [{this.state.title}]</ModalHeader>
          <ModalBody>
            <p>Choosed ID = {this.state.id}</p>
            <Row><Col>Title:</Col><Col> { this.state.selectedMetadataCatalog ? this.state.selectedMetadataCatalog.title : null }</Col></Row>
            <Row><Col>Datatype:</Col><Col> { this.state.selectedMetadataCatalog ? this.state.selectedMetadataCatalog.datatype : null }</Col></Row>
            <span>
              <hr />
              <b>Catalog JSON:</b>
              <Card className='catalogMetadata'>
                {<pre>{this.state.selectedMetadataCatalog ? JSON.stringify(this.state.selectedMetadataCatalog, null, 2) : null }</pre>}
              </Card>
            </span>
          </ModalBody>
          <ModalFooter>
            <Button color='secondary' onClick={this.toggle}>Close</Button>
          </ModalFooter>
        </Modal>

      </div>);
  }
}

WranglerComponent.propTypes = {
  accessToken: PropTypes.string,
  clientId: PropTypes.string,
  domain: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  metaCSVPath: PropTypes.string.isRequired,
  nrOfStartedProcesses: PropTypes.number,
  runningProcesses: PropTypes.object.isRequired,
  inputCSVPath: PropTypes.string
};

export default withRouter(WranglerComponent);
