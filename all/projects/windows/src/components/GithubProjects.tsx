import React, { useState, useEffect } from 'react';
import { Folder, File, ExternalLink, Star, GitFork } from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
}

const GithubProjects: React.FC = () => {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we will simulate fetching or fetch from a common open source user
    // In a real scenario, this would be the user's specific github username
    fetch('https://api.github.com/users/microsoft/repos?sort=updated&per_page=10')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRepos(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch repos", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      {/* Explorer Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarItem}>
          <Folder size={16} color="#d4b46c" style={styles.icon} />
          <span>Favorites</span>
        </div>
        <div style={{...styles.sidebarItem, marginLeft: '20px'}}>
          <Folder size={16} color="#4da9e8" style={styles.icon} />
          <span>Desktop</span>
        </div>
        <div style={{...styles.sidebarItem, marginLeft: '20px'}}>
          <Folder size={16} color="#4da9e8" style={styles.icon} />
          <span>Downloads</span>
        </div>
        
        <div style={{...styles.sidebarItem, marginTop: '10px'}}>
          <Folder size={16} color="#858585" style={styles.icon} />
          <span>Libraries</span>
        </div>
        <div style={{...styles.sidebarItem, marginLeft: '20px'}}>
          <Folder size={16} color="#4da9e8" style={styles.icon} />
          <span>Documents</span>
        </div>
        <div style={{...styles.sidebarItem, marginLeft: '20px'}}>
          <Folder size={16} color="#4da9e8" style={styles.icon} />
          <span>Music</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.content}>
        {/* Breadcrumb / Address bar area */}
        <div style={styles.addressBar}>
          <span>Computer ▶ Github Projects ▶ Active</span>
        </div>

        {/* Project List */}
        <div style={styles.projectList}>
          {loading ? (
            <div style={{padding: '20px'}}>Loading projects...</div>
          ) : (
            repos.map(repo => (
              <div key={repo.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <File size={24} color="#5ab0f7" style={{marginRight: '10px'}} />
                  <a href={repo.html_url} target="_blank" rel="noreferrer" style={styles.projectTitle}>
                    {repo.name} <ExternalLink size={12} style={{marginLeft: '4px'}} />
                  </a>
                </div>
                <p style={styles.projectDesc}>{repo.description || 'No description available.'}</p>
                <div style={styles.projectStats}>
                  {repo.language && <span style={styles.stat}><span style={{color: '#5ab0f7', marginRight: '4px'}}>●</span>{repo.language}</span>}
                  <span style={styles.stat}><Star size={14} style={{marginRight: '4px'}} />{repo.stargazers_count}</span>
                  <span style={styles.stat}><GitFork size={14} style={{marginRight: '4px'}} />{repo.forks_count}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100%',
    fontFamily: 'Segoe UI, sans-serif',
    fontSize: '12px',
  },
  sidebar: {
    width: '200px',
    backgroundColor: '#f5f6f7',
    borderRight: '1px solid #d9d9d9',
    padding: '10px 0',
    overflowY: 'auto' as const,
  },
  sidebarItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 10px',
    cursor: 'pointer',
    color: '#333',
  },
  icon: {
    marginRight: '6px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fff',
  },
  addressBar: {
    padding: '6px 12px',
    backgroundColor: '#f5f6f7',
    borderBottom: '1px solid #d9d9d9',
    display: 'flex',
    alignItems: 'center',
    color: '#333',
  },
  projectList: {
    padding: '20px',
    overflowY: 'auto' as const,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
  },
  projectCard: {
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  projectTitle: {
    color: '#0066cc',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  projectDesc: {
    color: '#666',
    marginBottom: '15px',
    flex: 1,
  },
  projectStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    color: '#666',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
  }
};

export default GithubProjects;
