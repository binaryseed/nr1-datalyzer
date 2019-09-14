import React from 'react';
import PropTypes from 'prop-types';

import { NerdGraphQuery } from 'nr1';

import Analyzer from './analyzer';

export default class RootNerdlet extends React.Component {
  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this._setAccount = this._setAccount.bind(this);
    this._setDataType = this._setDataType.bind(this);

    this.state = { dataType: 'event' };
  }

  componentDidUpdate({ nerdletUrlState }) {
    if (nerdletUrlState.entityGuid != this.props.nerdletUrlState.entityGuid) {
      this.loadEntity();
    }
  }

  async componentDidMount() {
    const { entityGuid } = this.props.nerdletUrlState;
    if (entityGuid) {
      await this.loadEntity();
    } else {
      // get all user accessible accounts
      const gql = `{actor {accounts {name id}}}`;
      const { data } = await NerdGraphQuery.query({ query: gql });

      const { accounts } = data.actor;
      const account = accounts.length > 0 && accounts[0];
      this.setState({ accounts, account });
    }
  }

  async loadEntity() {
    const { entityGuid } = this.props.nerdletUrlState;

    if (entityGuid) {
      // to work with mobile and browser apps, we need the
      // (non guid) id's for these applications, since guid is
      // not present in events like PageView, MobileSession, etc.
      const gql = `{
        actor {
          entity(guid: "${entityGuid}") {
            account {name id}
            name
            domain
            type
            guid
            ... on MobileApplicationEntity { applicationId }
            ... on BrowserApplicationEntity { applicationId }
            ... on ApmApplicationEntity { applicationId }
          }
        }
      }`;

      const { data } = await NerdGraphQuery.query({ query: gql });
      const { entity } = data.actor;
      await this.setState({ entity, account: entity.account });
    } else {
      await this.setState({ entity: null });
    }
  }

  _setAccount(account) {
    this.setState({ account });
  }

  _setDataType(dataType) {
    this.setState({ dataType });
  }

  render() {
    return (
      <div style={{ height: '100%', boxSizing: 'border-box' }}>
        <Analyzer
          {...this.props}
          {...this.state}
          setAccount={this._setAccount}
          setDataType={this._setDataType}
        />
      </div>
    );
  }
}
