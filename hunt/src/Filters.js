import React from 'react';
import axios from 'axios';
import { PAGINATION_VIEW, ListView, ListViewItem, ListViewInfoItem, ListViewIcon} from 'patternfly-react';
import * as config from './config/Api.js';
import { HuntList, HuntPaginationRow } from './Api.js';
import { Modal, DropdownKebab, MenuItem, Icon, Button } from 'patternfly-react';
import { Form, FormGroup, FormControl } from 'patternfly-react';
import { Col } from 'patternfly-react';

export class FiltersList extends HuntList {
    constructor(props) {
	    super(props);
  	    this.state = {data: [], count: 0};
	    this.fetchData = this.fetchData.bind(this)
    }

    componentDidMount() {
	    this.fetchData(this.props.config, this.props.filters);
    }
    
    fetchData(history_stat, filters) {
	    axios.get(config.API_URL + config.PROCESSING_PATH)
            .then(res => {
               this.setState({ data: res.data, count: res.data.count });
            })
    }

    render() {
	return(
	    <div>

	        <ListView>
	        {this.state.data.results &&
	           this.state.data.results.map( item => {
	               return(<FilterItem key={item.pk} data={item} switchPage={this.props.switchPage} last_index={this.state.count - 1} />);
	           })
	        }
	        </ListView>
	        <HuntPaginationRow
	            viewType = {PAGINATION_VIEW.LIST}
	            pagination={this.props.config.pagination}
	            onPaginationChange={this.handlePaginationChange}
		    amountOfPages = {Math.ceil(this.state.count / this.props.config.pagination.perPage)}
		    pageInputValue = {this.props.config.pagination.page}
		    itemCount = {this.state.count}
		    itemsStart = {(this.props.config.pagination.page - 1) * this.props.config.pagination.perPage}
		    itemsEnd = {Math.min(this.props.config.pagination.page * this.props.config.pagination.perPage - 1, this.state.count) }
		    onFirstPage={this.onFirstPage}
		    onNextPage={this.onNextPage}
		    onPreviousPage={this.onPrevPage}
		    onLastPage={this.onLastPage}

	        />

        </div>
        )
    }
}

class FilterItem extends React.Component {
    render() {
        var item = this.props.data;
        var addinfo = [];
        for (var i in item.filter_defs) {
            var info = <ListViewInfoItem key={"filter-" + i}><p>{item.filter_defs[i].key}: {item.filter_defs[i].value}</p></ListViewInfoItem>;
            addinfo.push(info);
        }
        var description = '';
        if (item.action !== 'suppress') {
            description = <ul className="list-inline">{Object.keys(item.options).map(option => { return(<li key={option}><strong>{option}</strong>: {item.options[option]}</li>) })}</ul>;
        }
        var icon = undefined;
        switch (item.action) {
            case 'suppress':
                icon =  <ListViewIcon name="close" />;
                break;
            case 'threshold':
                icon =  <ListViewIcon name="minus" />;
                break;
            case 'tag':
                icon =  <ListViewIcon name="envelope" />;
                break;
            case 'tagkeep':
                icon =  <ListViewIcon name="envelope" />;
                break;
            default:
                icon =  <ListViewIcon name="envelope" />;
                break;
        }
        var actions_menu = [<span key={item.pk  + '-index'} className="badge badge-default">{item.index}</span>];
        actions_menu.push(<FilterEditKebab key={item.pk} data={item} last_index={this.props.last_index} />);
        return(
            <ListViewItem
                key={item.pk}
                leftContent={icon}
                additionalInfo = {addinfo}
                heading={item.action}
                description={description}
                actions={actions_menu}
            />
        )
    }
}

class FilterEditKebab extends React.Component {
    constructor(props) {
        super(props);
        this.displayToggle = this.displayToggle.bind(this);
        this.hideToggle = this.hideToggle.bind(this);
        this.state = { toggle: { show: false, action: "delete" }};
        this.closeAction = this.closeAction.bind(this);
    }

    displayToggle(action) {
        this.setState({toggle: {show: true, action: action}});
    }

    hideToggle() {
        this.setState({toggle: {show: false, action: this.state.toggle.action}});
    }

    closeAction() {
        this.setState({toggle: {show: false, action: 'delete'}});
    }

    render() {
        return(
            <React.Fragment>
                <DropdownKebab id="filterActions" pullRight>
                        {this.props.data.index !== 0 &&
                        <MenuItem  onClick={ e => {this.displayToggle("movetop") }}> 
                        Send Filter to top
                        </MenuItem>
                        }
                        <MenuItem  onClick={ e => {this.displayToggle("move") }}> 
                        Move Filter
                        </MenuItem>
                        <MenuItem  onClick={ e => {this.displayToggle("movebottom") }}> 
                        Send Filter to bottom
                        </MenuItem>
		                <MenuItem divider />
                        <MenuItem  onClick={ e => {this.displayToggle("delete") }}> 
                        Delete Filter
                        </MenuItem>
                </DropdownKebab>
	            <FilterToggleModal show={this.state.toggle.show} action={this.state.toggle.action} data={this.props.data}  close={this.closeAction} last_index={this.props.last_index} />
            </React.Fragment>
        )
    }
}

class FilterToggleModal extends React.Component {
    constructor(props) {
        super(props);
        var new_index = 0;
        this.state = { comment: "", new_index: 0,
            errors: undefined};
        this.close = this.close.bind(this);
        this.submit = this.submit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.action !== this.props.action) {
            if (this.props.action === 'movebottom') {
                this.setState({new_index: this.props.last_index});
            }
        }
    }
    
    
    close() {
        this.setState({errors: undefined});
        this.props.close();
    }

    submit() {
            if (['move', 'movetop', 'movebottom'].indexOf(this.props.action) !== -1) {
                var data = {index: this.state.new_index, comment: this.state.comment}
	            axios.patch(config.API_URL + config.PROCESSING_PATH + this.props.data.pk + '/', data).then( res => {
                    console.log("I'm happy at " + this.state.new_index);
                    this.close();
                }
                )
            }
    }

    handleCommentChange(event) {
        this.setState({comment: event.target.value});
    }

    handleChange(event) {
        this.setState({new_index: event.target.value});
    }

    render() {
       var action = this.props.action;
       switch (action) {
               case 'movetop':
                    action = 'Send to top';
                    break;
               case 'move':
                    action = 'Move';
                    break;
               case 'movebottom':
                    action = 'Send to bottom';
                    break;
               case 'delete':
                    action = 'Delete';
                    break;
               default:
                    break;
       }
       return(
            <Modal show={this.props.show} onHide={this.close}>
    <Modal.Header>
      <button
        className="close"
        onClick={this.close}
        aria-hidden="true"
        aria-label="Close"
      >
        <Icon type="pf" name="close" />
      </button>
      {this.props.data &&
        <Modal.Title>{action} {this.props.data.action} at position {this.props.data.index}</Modal.Title>
      }
    </Modal.Header>
    <Modal.Body>
       <Form horizontal>
    {this.props.action === 'move' &&
        <FormGroup key="index" controlId="index" disabled={false}>
			<Col sm={3}>
			<strong>New index</strong>
			</Col>
			<Col sm={9}>
			<FormControl type="integer" disabled={false} defaultValue={0} onChange={this.handleChange} />
			</Col>
		   </FormGroup>

    }
        <div className="form-group">
            <div className="col-sm-9">
	    <strong>Optional comment</strong>
                <textarea value={this.state.comment} cols={70} onChange={this.handleCommentChange} />
            </div>
        </div>
        </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button
        bsStyle="default"
        className="btn-cancel"
        onClick={this.close}
      >
        Cancel
      </Button>
      <Button bsStyle="primary" onClick={this.submit}>
        Submit
      </Button>
    </Modal.Footer>
  </Modal>
       )
    }
}
