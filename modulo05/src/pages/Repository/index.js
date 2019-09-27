import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, PageChange } from './styles';

const issueStates = [
  {
    label: 'Todas',
    state: 'all',
  },
  {
    label: 'Abertas',
    state: 'open',
  },
  {
    label: 'Fechadas',
    state: 'closed',
  },
];

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issueState: 'open',
    issuePage: null,
  };

  async componentDidMount() {
    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async handleIssueStateChange(state) {
    const { repository, issueState } = this.state;

    if (state !== issueState) {
      const { data } = await api.get(
        `/repos/${repository.full_name}/issues?state=${state}`
      );

      this.setState({
        issues: data,
        issueState: state,
        page: null,
      });
    }
  }

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter>
          {issueStates.map(issueState => (
            <button
              type="button"
              onClick={() => this.handleIssueStateChange(issueState.state)}
            >
              {issueState.label}
            </button>
          ))}
        </IssueFilter>
        <PageChange>
          <button type="button">
            <FaArrowLeft color="#FFF" size={14} />
          </button>
          <button type="button">
            <FaArrowRight color="#FFF" size={14} />
          </button>
        </PageChange>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
