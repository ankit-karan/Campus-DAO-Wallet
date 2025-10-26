import React, { useState, useEffect } from 'react';
import { Keypair, Server, TransactionBuilder, Operation, Networks } from 'stellar-sdk';
import './App.css';

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clubs, setClubs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [events, setEvents] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState('demo'); // 'demo' or 'real'

  // Your actual secret key
  const SECRET_KEY = "SAZ3SXP2QIH247EXJXILIKLAYD6XL2RSUAW7Z2SXKMMNOQAE2NGQASA6";

  // Sample data - in real app, this would come from blockchain
  useEffect(() => {
    loadSampleData();
    // Auto-connect on component mount
    connectWallet();
  }, []);

  const loadSampleData = () => {
    setClubs([
      {
        id: 'coding-club',
        name: 'Coding Club',
        description: 'For students interested in programming and technology',
        members: 45,
        isMember: true,
        admin: 'GABC123...'
      },
      {
        id: 'nss',
        name: 'NSS',
        description: 'National Service Scheme - Social service activities',
        members: 120,
        isMember: true,
        admin: 'GDEF456...'
      },
      {
        id: 'ecell',
        name: 'E-Cell',
        description: 'Entrepreneurship Cell - Startup and innovation',
        members: 80,
        isMember: false,
        admin: 'GGHI789...'
      },
      {
        id: 'robotics-club',
        name: 'Robotics Club',
        description: 'Build robots and compete in competitions',
        members: 60,
        isMember: false,
        admin: 'GJKL012...'
      }
    ]);

    setProposals([
      {
        id: 1,
        title: 'Host Hackathon 2024',
        club: 'Coding Club',
        description: 'Organize a 24-hour hackathon for all students with prizes totaling 5000 CAMPUS tokens',
        votesFor: 25,
        votesAgainst: 5,
        status: 'Active',
        endTime: '2024-12-31',
        hasVoted: false,
        creator: 'GABC123...',
        amount: 5000
      },
      {
        id: 2,
        title: 'Buy Club T-shirts',
        club: 'NSS',
        description: 'Purchase branded t-shirts for all 120 club members',
        votesFor: 80,
        votesAgainst: 10,
        status: 'Approved',
        endTime: '2024-11-15',
        hasVoted: true,
        creator: 'GDEF456...',
        amount: 1200
      },
      {
        id: 3,
        title: 'Web Development Workshop',
        club: 'E-Cell',
        description: 'Conduct hands-on web development workshop with industry experts',
        votesFor: 45,
        votesAgainst: 8,
        status: 'Active',
        endTime: '2024-11-30',
        hasVoted: false,
        creator: 'GGHI789...',
        amount: 800
      }
    ]);

    setEvents([
      {
        id: 'tech-talk-1',
        name: 'Web3 Workshop',
        description: 'Learn about blockchain and smart contracts with hands-on examples using Soroban',
        reward: 50,
        date: '2024-11-20',
        attended: false,
        organizer: 'Coding Club',
        maxParticipants: 100,
        currentParticipants: 45
      },
      {
        id: 'hackathon-2024',
        name: 'Annual Hackathon',
        description: '24-hour coding competition with exciting prizes and industry judges',
        reward: 200,
        date: '2024-12-10',
        attended: true,
        organizer: 'College Tech Committee',
        maxParticipants: 50,
        currentParticipants: 50
      },
      {
        id: 'community-service',
        name: 'Community Service',
        description: 'Volunteer for local community development activities',
        reward: 75,
        date: '2024-11-25',
        attended: false,
        organizer: 'NSS',
        maxParticipants: 200,
        currentParticipants: 120
      },
      {
        id: 'startup-pitch',
        name: 'Startup Pitch Competition',
        description: 'Pitch your startup ideas to investors and win funding',
        reward: 150,
        date: '2024-12-05',
        attended: false,
        organizer: 'E-Cell',
        maxParticipants: 30,
        currentParticipants: 25
      }
    ]);
  };

  // Check if account exists on Stellar
  const checkAccountExists = async (publicKey) => {
    try {
      const server = new Server("https://horizon-testnet.stellar.org");
      await server.loadAccount(publicKey);
      return true;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false; // Account not found
      }
      throw error; // Other error
    }
  };

  // REAL WALLET CONNECTION with proper account checking
  const connectWallet = async () => {
    setLoading(true);
    
    try {
      // Create keypair from your secret key
      const keypair = Keypair.fromSecret(SECRET_KEY);
      const publicKey = keypair.publicKey();
      
      console.log("🔗 Attempting REAL connection with:", publicKey);
      
      // Check if account exists on Stellar
      const accountExists = await checkAccountExists(publicKey);
      
      if (accountExists) {
        // Connect to Stellar testnet
        const server = new Server("https://horizon-testnet.stellar.org");
        const account = await server.loadAccount(publicKey);
        
        // Get real XLM balance
        const xlmBalance = account.balances.find(b => b.asset_type === 'native');
        const balance = xlmBalance ? Math.floor(parseFloat(xlmBalance.balance)) : 0;
        
        // Update state with real data
        setPublicKey(publicKey);
        setIsConnected(true);
        setBalance(balance);
        setConnectionType('real');
        
        console.log("✅ Wallet connected to REAL Stellar network!", publicKey);
        console.log("💰 Real balance:", balance, "XLM");
      } else {
        // Account doesn't exist, use demo mode
        throw new Error('Account not found on Stellar network');
      }
      
    } catch (error) {
      console.error("❌ Real wallet connection failed:", error.message);
      
      // Fallback to demo mode with a valid demo account
      const demoPublicKey = 'GDC5WX2W5AOB5Z5H4VFG3M7VQCR5Q3T6KZ7Q6Z5Z5Z5Z5Z5Z5Z5Z5Z5Z';
      setPublicKey(demoPublicKey);
      setIsConnected(true);
      setBalance(350);
      setConnectionType('demo');
      console.log("🔗 Connected in Demo Mode - Account not found on Stellar");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey('');
    setIsConnected(false);
    setBalance(0);
    setConnectionType('demo');
  };

  // REAL TOKEN TRANSFER FUNCTION
  const sendTokens = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    const recipient = prompt('Enter recipient Stellar public key (starts with G):');
    const amount = prompt('Enter amount to send:');
    
    if (!recipient || !recipient.startsWith('G') || !amount) {
      alert('Please enter a valid Stellar public key and amount!');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount > balance) {
      alert('❌ Insufficient balance!');
      return;
    }

    setLoading(true);

    if (connectionType === 'real') {
      try {
        const server = new Server("https://horizon-testnet.stellar.org");
        const sourceKeypair = Keypair.fromSecret(SECRET_KEY);
        
        // Load source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
        
        // Create REAL Stellar transaction
        const transaction = new TransactionBuilder(sourceAccount, {
          fee: '10000',
          networkPassphrase: Networks.TESTNET
        })
          .addOperation(Operation.payment({
            destination: recipient,
            asset: Operation.asset.native(),
            amount: amount.toString()
          }))
          .setTimeout(30)
          .build();

        // Sign transaction
        transaction.sign(sourceKeypair);

        // Submit to blockchain
        const result = await server.submitTransaction(transaction);
        
        // Update balance
        setBalance(prev => prev - numAmount);
        
        console.log("✅ REAL Transaction successful:", result.hash);
        alert(`✅ Sent ${amount} XLM to ${recipient.slice(0, 8)}...${recipient.slice(-8)}\nTransaction Hash: ${result.hash}`);
        
      } catch (error) {
        console.error("❌ REAL Transaction failed:", error);
        let errorMessage = 'Transaction failed';
        
        if (error.response && error.response.data) {
          errorMessage = error.response.data.extras.result_codes?.operations?.join(', ') || errorMessage;
        }
        
        alert(`❌ Transaction failed: ${errorMessage}`);
      }
    } else {
      // Demo transaction
      setTimeout(() => {
        setBalance(prev => prev - numAmount);
        alert(`✅ Demo: Sent ${amount} CAMPUS to ${recipient.slice(0, 8)}...${recipient.slice(-8)}`);
      }, 1000);
    }
    
    setLoading(false);
  };

  // Other functions remain exactly the same
  const createProposal = () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    const newProposal = {
      id: proposals.length + 1,
      title: 'New Event Proposal',
      club: 'Coding Club',
      description: 'This is a new proposal created by the user',
      votesFor: 0,
      votesAgainst: 0,
      status: 'Active',
      endTime: '2024-12-25',
      hasVoted: false,
      creator: publicKey,
      amount: 1000
    };
    
    setProposals(prev => [newProposal, ...prev]);
    alert('✅ New proposal created successfully!');
  };

  const voteOnProposal = (proposalId, support) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setProposals(prev => prev.map(proposal => {
      if (proposal.id === proposalId && !proposal.hasVoted) {
        const newVotesFor = support ? proposal.votesFor + 1 : proposal.votesFor;
        const newVotesAgainst = !support ? proposal.votesAgainst + 1 : proposal.votesAgainst;
        
        const newStatus = newVotesFor > newVotesAgainst ? 'Approved' : 'Active';
        
        return {
          ...proposal,
          votesFor: newVotesFor,
          votesAgainst: newVotesAgainst,
          hasVoted: true,
          status: newStatus
        };
      }
      return proposal;
    }));

    alert(`🗳️ Voted ${support ? 'FOR' : 'AGAINST'} proposal: "${proposals.find(p => p.id === proposalId)?.title}"`);
  };

  const joinClub = (clubId) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    setClubs(prev => prev.map(club => {
      if (club.id === clubId && !club.isMember) {
        return {
          ...club,
          isMember: true,
          members: club.members + 1
        };
      }
      return club;
    }));

    const clubName = clubs.find(c => c.id === clubId)?.name;
    alert(`🎉 Successfully joined ${clubName}! You can now participate in proposals.`);
  };

  const attendEvent = (eventId) => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    const event = events.find(e => e.id === eventId);
    if (event && !event.attended) {
      if (event.currentParticipants >= event.maxParticipants) {
        alert('❌ Event is full! Cannot attend.');
        return;
      }

      setEvents(prev => prev.map(e => 
        e.id === eventId ? { 
          ...e, 
          attended: true,
          currentParticipants: e.currentParticipants + 1
        } : e
      ));
      setBalance(prev => prev + event.reward);
      alert(`✅ Successfully attended ${event.name}! Earned ${event.reward} CAMPUS tokens.`);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-title">
          <h1>🏫 Campus DAO Wallet</h1>
          <p>Decentralized Club Management & Reward System</p>
          {isConnected && (
            <small style={{opacity: 0.8, fontSize: '0.8rem'}}>
              {connectionType === 'real' ? '🔗 Real Stellar Connected' : '🎮 Demo Mode - Create account to use real Stellar'}
            </small>
          )}
        </div>
        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-info">
              <span className="balance">Balance: {balance} {connectionType === 'real' ? 'XLM' : 'CAMPUS'}</span>
              <span className="address">
                {publicKey.slice(0, 8)}...{publicKey.slice(-8)}
              </span>
              <button className="disconnect-btn" onClick={disconnectWallet}>
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet} 
              className="connect-btn"
              disabled={loading}
            >
              {loading ? 'Connecting...' : '🔗 Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* Rest of your JSX remains exactly the same */}
      <nav className="tabs">
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </button>
        <button className={activeTab === 'clubs' ? 'active' : ''} onClick={() => setActiveTab('clubs')}>
          🏛️ Clubs & DAOs
        </button>
        <button className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')}>
          💳 Campus Wallet
        </button>
        <button className={activeTab === 'events' ? 'active' : ''} onClick={() => setActiveTab('events')}>
          🎯 Events
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <h2>Welcome to Campus DAO Wallet {isConnected ? '👋' : '🚀'}</h2>
            
            {!isConnected ? (
              <div className="demo-alert">
                <p>🔗 <strong>Connecting to wallet...</strong> Please wait</p>
              </div>
            ) : connectionType === 'real' ? (
              <div className="demo-alert" style={{background: '#d4edda', color: '#155724', borderColor: '#c3e6cb'}}>
                <p>✅ <strong>Connected to Real Stellar Testnet!</strong> Balance: {balance} XLM</p>
              </div>
            ) : (
              <div className="demo-alert" style={{background: '#fff3cd', color: '#856404', borderColor: '#ffeaa7'}}>
                <p>🎮 <strong>Demo Mode Active</strong> - Create a Stellar account to use real blockchain features</p>
                <p style={{fontSize: '0.9rem', marginTop: '5px'}}>
                  Go to: <a href="https://laboratory.stellar.org/#account-creator?network=testnet" target="_blank" rel="noopener noreferrer" style={{color: '#856404'}}>Stellar Laboratory</a> to create your account
                </p>
              </div>
            )}
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Your Balance</h3>
                <p className="balance-amount">{balance}</p>
                <small>{connectionType === 'real' ? 'Real XLM' : 'CAMPUS Tokens'}</small>
              </div>
              <div className="stat-card">
                <h3>Clubs Joined</h3>
                <p className="clubs-count">{clubs.filter(c => c.isMember).length}</p>
                <small>Active Memberships</small>
              </div>
              <div className="stat-card">
                <h3>Proposals Voted</h3>
                <p className="votes-count">{proposals.filter(p => p.hasVoted).length}</p>
                <small>Total Participations</small>
              </div>
              <div className="stat-card">
                <h3>Events Attended</h3>
                <p className="events-count">{events.filter(e => e.attended).length}</p>
                <small>Completed Events</small>
              </div>
            </div>

            <div className="recent-activity">
              <h3>📈 Recent Activity</h3>
              <div className="activity-list">
                {isConnected ? (
                  <>
                    <div className="activity-item">
                      <span className="activity-type reward">Wallet</span>
                      <span className="activity-desc">
                        {connectionType === 'real' ? 'Connected to REAL Stellar Network' : 'Connected in Demo Mode'}
                      </span>
                      <span className="activity-time">Just now</span>
                    </div>
                    <div className="activity-item">
                      <span className="activity-type reward">Balance</span>
                      <span className="activity-desc">
                        Current: {balance} {connectionType === 'real' ? 'XLM' : 'CAMPUS'}
                      </span>
                      <span className="activity-time">Live</span>
                    </div>
                    {connectionType === 'real' ? (
                      <div className="activity-item">
                        <span className="activity-type info">Ready</span>
                        <span className="activity-desc">You can send REAL XLM transactions</span>
                        <span className="activity-time">Ready</span>
                      </div>
                    ) : (
                      <div className="activity-item">
                        <span className="activity-type info">Demo</span>
                        <span className="activity-desc">All features available in demo mode</span>
                        <span className="activity-time">Ready</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="activity-item">
                    <span className="activity-type info">Info</span>
                    <span className="activity-desc">Connect wallet to start using the app</span>
                    <span className="activity-time">Waiting</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rest of your tabs remain exactly the same */}
        {activeTab === 'clubs' && (
          <div className="clubs-section">
            <div className="section-header">
              <h2>🏛️ College Clubs & DAOs</h2>
              <div className="header-actions">
                <button className="btn-primary" onClick={createProposal}>
                  ➕ Create Proposal
                </button>
              </div>
            </div>

            <div className="clubs-grid">
              {clubs.map(club => (
                <div key={club.id} className="club-card">
                  <h3>{club.name}</h3>
                  <p>{club.description}</p>
                  <div className="club-meta">
                    <span>👥 Members: {club.members}</span>
                    <span className={`member-status ${club.isMember ? 'member' : 'not-member'}`}>
                      {club.isMember ? '✅ Member' : '❌ Not Member'}
                    </span>
                  </div>
                  <div className="club-actions">
                    {!club.isMember ? (
                      <button className="btn-primary" onClick={() => joinClub(club.id)}>
                        Join Club
                      </button>
                    ) : (
                      <button className="btn-secondary" disabled>✅ Member</button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="proposals-section">
              <h3>📋 Active Proposals</h3>
              <div className="proposals-list">
                {proposals.map(proposal => (
                  <div key={proposal.id} className="proposal-card">
                    <div className="proposal-header">
                      <div>
                        <h4>{proposal.title}</h4>
                        <p className="proposal-club">🏛️ {proposal.club}</p>
                      </div>
                      <span className={`status ${proposal.status.toLowerCase()}`}>
                        {proposal.status}
                      </span>
                    </div>
                    <p className="proposal-description">{proposal.description}</p>
                    <div className="proposal-details">
                      <span>💰 Budget: {proposal.amount} CAMPUS</span>
                      <span>⏰ Ends: {proposal.endTime}</span>
                    </div>
                    <div className="proposal-votes">
                      <span>✅ For: {proposal.votesFor}</span>
                      <span>❌ Against: {proposal.votesAgainst}</span>
                    </div>
                    {proposal.status === 'Active' && !proposal.hasVoted && (
                      <div className="proposal-actions">
                        <button className="btn-vote for" onClick={() => voteOnProposal(proposal.id, true)}>
                          ✅ Vote For
                        </button>
                        <button className="btn-vote against" onClick={() => voteOnProposal(proposal.id, false)}>
                          ❌ Vote Against
                        </button>
                      </div>
                    )}
                    {proposal.hasVoted && (
                      <div className="voted-indicator">✅ You have voted on this proposal</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="wallet-section">
            <h2>💳 Campus Wallet</h2>
            
            <div className="wallet-balance">
              <h3>Your Balance</h3>
              <div className="balance-display">
                <span className="balance-amount">{balance}</span>
                <span className="balance-currency">{connectionType === 'real' ? 'XLM' : 'CAMPUS'}</span>
              </div>
              <p>{connectionType === 'real' ? 'Real Stellar Lumens - Testnet' : 'Campus Reward Tokens - Demo'}</p>
            </div>

            <div className="wallet-actions">
              <button className="btn-primary" onClick={sendTokens}>
                💸 Send {connectionType === 'real' ? 'XLM' : 'Tokens'}
              </button>
              <button className="btn-secondary">
                📥 Receive {connectionType === 'real' ? 'XLM' : 'Tokens'}
              </button>
            </div>

            <div className="transaction-history">
              <h3>📜 Transaction History</h3>
              <div className="transactions-list">
                {isConnected ? (
                  <>
                    <div className="transaction-item">
                      <span className={`tx-type ${connectionType === 'real' ? 'received' : 'info'}`}>
                        {connectionType === 'real' ? 'Real' : 'Demo'}
                      </span>
                      <span className="tx-amount">{balance} {connectionType === 'real' ? 'XLM' : 'CAMPUS'}</span>
                      <span className="tx-desc">
                        {connectionType === 'real' ? 'Stellar Testnet Balance' : 'Demo Mode Balance'}
                      </span>
                      <span className="tx-time">Live</span>
                    </div>
                    <div className="transaction-item">
                      <span className="tx-type received">Connected</span>
                      <span className="tx-amount">System</span>
                      <span className="tx-desc">
                        {connectionType === 'real' ? 'Real Stellar Wallet' : 'Demo Wallet'}
                      </span>
                      <span className="tx-time">Just now</span>
                    </div>
                  </>
                ) : (
                  <div className="no-transactions">
                    <p>Connect your wallet to start transactions</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="events-section">
            <h2>🎯 Campus Events</h2>
            <p>Attend events to earn CAMPUS tokens! {connectionType === 'real' && '✓ Real Stellar Connected'}</p>
            
            <div className="events-grid">
              {events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.name}</h3>
                    <span className="event-organizer">by {event.organizer}</span>
                  </div>
                  <p>{event.description}</p>
                  <div className="event-meta">
                    <span className="event-date">📅 {event.date}</span>
                    <span className="event-reward">🎁 Reward: {event.reward} CAMPUS</span>
                    <span className="event-participants">
                      👥 {event.currentParticipants}/{event.maxParticipants}
                    </span>
                    <span className={`attendance-status ${event.attended ? 'attended' : 'not-attended'}`}>
                      {event.attended ? '✅ Attended' : '❌ Not Attended'}
                    </span>
                  </div>
                  {!event.attended ? (
                    <button 
                      className="btn-primary"
                      onClick={() => attendEvent(event.id)}
                      disabled={event.currentParticipants >= event.maxParticipants}
                    >
                      {event.currentParticipants >= event.maxParticipants ? 'Event Full' : '🎯 Attend Event'}
                    </button>
                  ) : (
                    <button className="btn-secondary" disabled>✅ Already Attended</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>{connectionType === 'real' ? 'Processing real transaction...' : 'Processing demo transaction...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;