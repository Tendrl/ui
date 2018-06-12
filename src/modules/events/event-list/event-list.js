const Event = (props) => {
    return (<div>
                <div className="ft-row list-group-item">
                    <div className="ft-column event-desc">
                        <div>{props.message || "NA"}</div>
                    </div>
                    <div className="ft-column">
                        <div>{props.timeStamp}</div>
                    </div>
                </div>
            </div>);
};

const Spinner = (props) => {
    return (props.isDataLoading ? <div className="spinner spinner-lg"></div> : null);
};

class DatePickerComp extends Component {
    constructor(props) {
        super(props);
        this.checkValidDate = (event) => {
            event.preventDefault();
        };
    };

    render() {
        return (<DatePicker dateFormat="YYYY-MM-DD"
                selected={this.props.type}
                onChange={this.checkValidDate}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                />);
    };
};


class EventList extends Component {
    constructor(props) {
        super(props);
        let $stateParams = window.ngDeps.$stateParams,
            config = window.ngDeps.config,
            oThis = this;

        oThis.eventTimer = null;
        oThis.clusterId = $stateParams.clusterId;

        oThis.state = {
            eventList: [],
            isDataLoading: true,
            searchDescText: "",
            date: {
                fromDate: moment(),
                toDate: moment()
            },
            dateFormat: {
                format: "YYYY/MM/DD"
            },
            search: ""
        };

        oThis.updateSearch = oThis.updateSearch.bind(oThis);

        oThis.clearAllFilters = oThis.clearAllFilters.bind(oThis);

        _init();

        function _init() {

            EventStore.getEventList(oThis.clusterId)
                .then((list) => {
                    clearInterval(oThis.eventTimer);

                    oThis.setState({
                        eventList: list
                    });

                    oThis.setState({
                        isDataLoading: false
                    });

                    _startEventTimer();
                }).catch((e) => {

                    oThis.setState({
                        eventList: []
                    });
                }).finally(() => {
                    oThis.setState({
                        isDataLoading: false
                    });
                });
        }

        function _startEventTimer() {
            oThis.eventTimer = setInterval(function() {
                _init();
            }, 1000 * config.eventsRefreshIntervalTime, 1);

        }
    }

    updateSearch(e) {
        this.setState({ search: e.target.value });
        e.stopPropagation();
    }

    clearAllFilters(e) {
        e.preventDefault();
        this.setState({
            search: ""
        });
        e.stopPropagation();
    }

    componentWillUnmount() {
        clearInterval(this.eventTimer);
    }

    render() {
        let filteredEvents = this.state.eventList.filter(
            (event) => {
                return event.message.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
            }
        );

        let eventCount = (filteredEvents.length > 1) ? (filteredEvents.length) + " Events" : (this.state.eventList.length) + " Event";

        let noEventFoundMsgEl = (
            <center>
                <div className="blank-slate-pf">
                    <div className="blank-slate-pf-icon">
                        <i className="pficon pficon-cluster"></i>
                    </div>
                    <h1>No Events Detected</h1>
                </div>
            </center>
        );

        let noFilteredEventFoundMsgEl = (
            <center className="empty-filter-list">
                <div className="blank-slate-pf">
                    <div className="message">No results match the filter criteria</div>
                    <div className="suggestion">
                        <div className="title">Suggestions</div>
                        <div>Please try selecting other filter criteria.</div>
                    </div>
                </div>
            </center>
        );

        let noEventFoundEl = (!this.state.isDataLoading && this.state.eventList.length === 0) ? noEventFoundMsgEl : null;

        let noFilteredEventFoundEl = (!this.state.isDataLoading && filteredEvents.length === 0 && this.state.eventList.length !== 0) ? noFilteredEventFoundMsgEl : null;

        let tableEl = (
            <div>
                <div className="flex-table list-group list-view-pf list-view-pf-view event-list-table">
                        {filteredEvents.map(event => <Event {...event} key={event.message_id}/>)}
                </div>
                <div className="row">
                    <div className="col-md-12 horizontal-line"></div>
                </div>
            </div>
        );

        let eventData = (!this.state.isDataLoading && filteredEvents.length !== 0) ? tableEl : null;

        return (
            <div className="tendrl-event-list-view-container container-fluid">
                <h1 className="bold-text">Events</h1>
                <div className="row toolbar-pf">
                    <div className="col-sm-12">
                        <form className="toolbar-pf-actions">
                            <div className="form-group date-selector date-filter">
                                From:
                                <DatePickerComp type={this.state.date.fromDate} />
                            </div>
                            <div className="form-group date-selector to-date-calendar">
                                To:
                                <DatePickerComp type={this.state.date.toDate} />
                            </div>
                            <div className="toolbar-pf-action-right">
                                <div className="form-group toolbar-pf-find">
                                    <input name="search-text" id="search-text" type="text" className="form-control" placeholder="Search" value={this.state.search} onChange={this.updateSearch}/>
                                    <button className="btn btn-link btn-find" type="button">
                                        <span className="fa fa-search"></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="row">
                            <div className="col-md-12 horizontal-line"></div>
                        </div>
                        <div className="row toolbar-pf-results extra-margin">
                            <div className="col-md-5 col-sm-6">
                                <h5>{eventCount}
                                </h5>
                            </div>
                            <div className="col-md-7 col-sm-6">
                                <div className="status-options">
                                    <a onClick={this.clearAllFilters}>Clear All Filters</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {noEventFoundEl}
                {noFilteredEventFoundEl}
                <Spinner isDataLoading={this.state.isDataLoading} />
                {eventData}
            </div>
        );
    };
}

const props = [];

const ReactEventList = reactDirective => reactDirective(EventList, props);
ReactEventList.$inject = ["reactDirective"];

angular
    .module("TendrlModule")
    .directive("eventList", ReactEventList);
