import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Lock, UserPlus, Users, ChartPie, Clock, LogOut } from 'lucide-react';

// Mock database using localStorage
const initializeDB = () => {
  if (!localStorage.getItem('election_db')) {
    localStorage.setItem('election_db', JSON.stringify({
      admin: { username: 'admin', password: 'admin123' },
      users: [],
      parties: [],
      votes: [],
      electionSettings: {
        startTime: null,
        endTime: null,
        isActive: false
      }
    }));
  }
};

const ElectionSystem = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [electionData, setElectionData] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', password: '', voterId: '' });
  const [newParty, setNewParty] = useState({ name: '', symbol: '' });

  useEffect(() => {
    initializeDB();
    const data = JSON.parse(localStorage.getItem('election_db'));
    setElectionData(data);
  }, []);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogin = () => {
    const data = JSON.parse(localStorage.getItem('election_db'));
    
    if (loginData.username === data.admin.username && loginData.password === data.admin.password) {
      setCurrentUser({ type: 'admin' });
      setView('admin-dashboard');
    } else {
      const user = data.users.find(u => u.username === loginData.username && u.password === loginData.password);
      if (user) {
        if (data.votes.find(v => v.userId === user.username)) {
          showAlert('You have already voted!');
          return;
        }
        setCurrentUser({ type: 'user', ...user });
        setView('voting-page');
      } else {
        showAlert('Invalid credentials!');
      }
    }
  };

  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.voterId) {
      showAlert('All fields are required!');
      return;
    }

    const data = JSON.parse(localStorage.getItem('election_db'));
    if (data.users.find(u => u.username === newUser.username)) {
      showAlert('User already exists!');
      return;
    }

    data.users.push(newUser);
    localStorage.setItem('election_db', JSON.stringify(data));
    setElectionData(data);
    setNewUser({ username: '', password: '', voterId: '' });
    showAlert('User added successfully!', 'success');
  };

  const addParty = () => {
    if (!newParty.name || !newParty.symbol) {
      showAlert('All fields are required!');
      return;
    }

    const data = JSON.parse(localStorage.getItem('election_db'));
    if (data.parties.find(p => p.name === newParty.name)) {
      showAlert('Party already exists!');
      return;
    }

    data.parties.push({ ...newParty, votes: 0 });
    localStorage.setItem('election_db', JSON.stringify(data));
    setElectionData(data);
    setNewParty({ name: '', symbol: '' });
    showAlert('Party added successfully!', 'success');
  };

  const castVote = (partyName) => {
    const data = JSON.parse(localStorage.getItem('election_db'));
    const party = data.parties.find(p => p.name === partyName);
    party.votes += 1;
    data.votes.push({ userId: currentUser.username, partyName });
    localStorage.setItem('election_db', JSON.stringify(data));
    setElectionData(data);
    setView('thank-you');
  };

  const updateElectionTime = (startTime, endTime) => {
    const data = JSON.parse(localStorage.getItem('election_db'));
    data.electionSettings.startTime = startTime;
    data.electionSettings.endTime = endTime;
    data.electionSettings.isActive = true;
    localStorage.setItem('election_db', JSON.stringify(data));
    setElectionData(data);
    showAlert('Election time set successfully!', 'success');
  };

  const LoginView = () => (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-center">Election System Login</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleLogin}>
            <Lock className="mr-2 h-4 w-4" /> Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const AdminDashboard = () => (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <Label>Voter ID</Label>
                <Input
                  value={newUser.voterId}
                  onChange={(e) => setNewUser({ ...newUser, voterId: e.target.value })}
                />
              </div>
              <Button onClick={addUser}>
                <UserPlus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Political Party</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Party Name</Label>
                <Input
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Party Symbol</Label>
                <Input
                  value={newParty.symbol}
                  onChange={(e) => setNewParty({ ...newParty, symbol: e.target.value })}
                />
              </div>
              <Button onClick={addParty}>Add Party</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Election Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={electionData?.parties || []}
                    dataKey="votes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {electionData?.parties.map((entry, index) => (
                      <Cell key={index} fill={`hsl(${index * 45}, 70%, 50%)`} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Set Election Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => updateElectionTime(e.target.value, electionData?.electionSettings?.endTime)}
                />
              </div>
              <div>
                <Label>End Time</Label>
                <Input
                  type="datetime-local"
                  onChange={(e) => updateElectionTime(electionData?.electionSettings?.startTime, e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        className="mt-4"
        variant="destructive"
        onClick={() => {
          setCurrentUser(null);
          setView('login');
        }}
      >
        <LogOut className="mr-2 h-4 w-4" /> Logout
      </Button>
    </div>
  );

  const VotingPage = () => (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {electionData?.parties.map((party) => (
            <Button
              key={party.name}
              className="h-24"
              onClick={() => castVote(party.name)}
            >
              {party.symbol} {party.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ThankYouPage = () => (
    <Card className="w-full max-w-md mx-auto mt-8 text-center">
      <CardHeader>
        <CardTitle>Thank You for Voting!</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Your vote has been recorded successfully.</p>
        <Button
          className="mt-4"
          onClick={() => {
            setCurrentUser(null);
            setView('login');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {alert.show && (
        <Alert className={`mb-4 ${alert.type === 'error' ? 'bg-red-50' : 'bg-green-50'}`}>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}
      
      {view === 'login' && <LoginView />}
      {view === 'admin-dashboard' && <AdminDashboard />}
      {view === 'voting-page' && <VotingPage />}
      {view === 'thank-you' && <ThankYouPage />}
    </div>
  );
};

export default ElectionSystem;