import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { useLanguage } from '../contexts/LanguageContext';
import { ClimateChart } from './ClimateChart';
import { ClimateTable } from './ClimateTable';
import { MapPicker, MapPoint } from './MapPicker';
import { PvpPlayer, ClimateDataResponse, GeoLocation, PvpRoundResult, PvpGameResult } from '../types';
import { Loader2, User, Play, LogIn, Users, Timer, Trophy, ArrowRight, Swords, Heart, AlertCircle, X, RefreshCw, LogOut, UserPlus, DoorOpen, CheckCircle, RotateCcw } from 'lucide-react';

type PvpState = 'login' | 'lobby' | 'waiting' | 'countdown' | 'playing' | 'round_result' | 'game_over';

const SOCKET_URL = 'https://climate-game.hywiki.org/';
const API_BASE = 'https://climate-game.hywiki.org/API';

const PLAYER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16'  // Lime
];

interface RoomInfo {
  roomId: string;
  players: number | any[];
  status: string;
  maxPlayers?: number;
}

export const PvpGame: React.FC = () => {
  const { t } = useLanguage();
  const socketRef = useRef<Socket | null>(null);

  // States
  const [gameState, setGameState] = useState<PvpState>('login');
  const [error, setError] = useState<string | null>(null);
  
  // Status & Notification States
  const [statusInfo, setStatusInfo] = useState<{message: string, type: string} | null>(null);
  const [countdownMessage, setCountdownMessage] = useState<string>('');
  
  // Login/Register State
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string, name: string } | null>(null);

  // Lobby State
  const [roomIdInput, setRoomIdInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  
  // Rejoin State
  const [rejoinRoomId, setRejoinRoomId] = useState<string | null>(null);
  const [showRejoinModal, setShowRejoinModal] = useState(false);
  
  // Game State
  const [players, setPlayers] = useState<PvpPlayer[]>([]);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startCountdown, setStartCountdown] = useState(0);
  
  // Round Data
  const [currentClimate, setCurrentClimate] = useState<ClimateDataResponse | null>(null);
  const [userGuess, setUserGuess] = useState<GeoLocation | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [roundResult, setRoundResult] = useState<PvpRoundResult | null>(null);
  const [gameResult, setGameResult] = useState<PvpGameResult[] | null>(null);

  // Helper to persist credentials
  const saveCredentials = (u: string, p: string) => {
    localStorage.setItem('pvp_credentials', JSON.stringify({ username: u, password: p }));
  };

  const clearCredentials = () => {
    localStorage.removeItem('pvp_credentials');
  };

  useEffect(() => {
    // Initialize Socket
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to PVP server');
      setError(null);
      
      // Always attempt to restore session / re-authenticate on connect
      const saved = localStorage.getItem('pvp_credentials');
      if (saved) {
        try {
          const { username: u, password: p } = JSON.parse(saved);
          if (u && p) {
             socket.emit('login', { identifier: u, password: p }, (response: any) => {
              if (response.success) {
                setUsername(u);
                setPassword(p);
                setCurrentUser({ id: u, name: u });
                
                // Check if user was in a room
                if (response.activeRoomId) {
                  setRejoinRoomId(response.activeRoomId);
                  setShowRejoinModal(true);
                }
                
                // Only move to lobby if we are currently in login screen
                setGameState(current => {
                  if (current === 'login') {
                    // Show notification for auto-login
                    setStatusInfo({ message: `Welcome back, ${u}!`, type: 'success' });
                    setTimeout(() => setStatusInfo(null), 1500);
                    return 'lobby';
                  }
                  return current;
                });
              } else {
                console.warn("Auto-login failed:", response.message);
              }
            });
          }
        } catch (e) {
          console.error("Failed to parse saved credentials");
        }
      }
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
        console.error('Connection Error:', err);
        setError(`Connection failed: ${err.message}`);
    });

    socket.on('error', (msg: any) => {
      console.error('Socket error:', msg);
      const errorMessage = typeof msg === 'string' ? msg : (msg?.message || JSON.stringify(msg));
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    });

    // Handle generic status info (e.g. "Generating questions...")
    socket.on('statusInfo', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      console.log('Status Info:', data);
      setStatusInfo(data);
      // Automatically clear if it's not a loading state (e.g. simple info toast)
      if (data.type !== 'loading') {
         setTimeout(() => setStatusInfo(null), 3000);
      }
    });

    // Room Updates
    socket.on('roomInfo', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      if (!data) return;

      const rId = data.roomId || data.id;
      if (rId) setCurrentRoomId(rId);
      
      if (Array.isArray(data.players)) {
        const mappedPlayers = data.players.map((p: any) => {
          const id = String(p.id || p.identifier || p.username || 'unknown');
          const name = p.username || p.name || p.identifier || String(p.id) || 'Unknown';
          
          return {
            id,
            name, 
            score: p.totalScore || p.score || 0,
            hp: p.hp,
            isOwner: p.isOwner,
            isOnline: p.isOnline
          };
        });
        setPlayers(mappedPlayers);
      }
    });

    // Game Flow - Standard Countdown
    socket.on('countdown', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      setGameState('countdown');
      setStartCountdown(data.count);
      setCountdownMessage(''); // Clear specific message if strictly using old event
      setTimeLeft(0); // Reset game timer
    });

    // Game Flow - Specific Start Countdown with message
    socket.on('startCountdown', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      setGameState('countdown');
      setStartCountdown(data.seconds);
      setCountdownMessage(data.message || '');
      // Clear any previous status info (e.g. loading)
      setStatusInfo(null);
      setTimeLeft(0); // Reset game timer
    });

    socket.on('newQuestion', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      setGameState('playing');
      setRound(data.round);
      setCurrentClimate(data.climate);
      setUserGuess(null);
      setHasSubmitted(false);
      setRoundResult(null);
      setTimeLeft(300); // Default, will be updated by answerCountdown
      
      // Clear transient UI states
      setStatusInfo(null);
      setCountdownMessage('');
    });

    socket.on('answerCountdown', (data: { seconds: number }) => {
      setTimeLeft(data.seconds);
    });

    socket.on('roundResult', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      setGameState('round_result');
      setTimeLeft(0); // Reset timer
      
      const normalizedPlayers = (data.players || []).map((p: any) => ({
        ...p,
        id: String(p.id || p.identifier || p.username),
        name: p.username || p.name || p.identifier || String(p.id) || 'Unknown',
        score: p.roundScore !== undefined ? p.roundScore : p.score,
        totalScore: p.totalScore !== undefined ? p.totalScore : p.score
      }));
      
      const answer = data.answer || {};
      const normalizedAnswer = {
        ...answer,
        lat: typeof answer.lat === 'string' ? parseFloat(answer.lat) : answer.lat,
        lon: typeof answer.lon === 'string' ? parseFloat(answer.lon) : answer.lon
      };
      
      const normalizedData = {
        ...data,
        answer: normalizedAnswer,
        players: normalizedPlayers
      };

      setRoundResult(normalizedData);
      
      setPlayers(prev => prev.map(p => {
        const pResult = normalizedPlayers.find((pr: any) => pr.id === p.id);
        if (pResult) {
           return { ...p, score: pResult.totalScore, hp: pResult.hp };
        }
        return p;
      }));
    });

    socket.on('gameOver', (raw: any) => {
      const data = Array.isArray(raw) ? raw[0] : raw;
      setGameState('game_over');
      
      const normalizedResults = (data.results || []).map((r: any) => ({
        ...r,
        id: String(r.id || r.identifier || r.username),
        name: r.username || r.name || r.identifier || String(r.id) || 'Unknown'
      }));
      setGameResult(normalizedResults);
      setStatusInfo(null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Timer effect for start countdown
  useEffect(() => {
    if (gameState === 'countdown' && startCountdown > 0) {
      const timer = setTimeout(() => setStartCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, startCountdown]);

  // Auto-submit effect when time is running out
  useEffect(() => {
    // Allow auto-submit if in playing OR countdown state (in case server switches to countdown for last few seconds)
    if ((gameState === 'playing' || gameState === 'countdown') && !hasSubmitted && timeLeft > 0 && timeLeft <= 1) {
      console.log("Auto-submitting due to timeout");
      let lat = userGuess?.lat;
      let lon = userGuess?.lng;

      // Force random coordinate if player didn't choose
      if (lat === undefined || lon === undefined) {
        lat = (Math.random() * 180) - 90;
        lon = (Math.random() * 360) - 180;
        // Update local state to reflect the random guess visually if possible
        setUserGuess({ lat, lng: lon });
      }

      if (socketRef.current) {
        socketRef.current.emit('submitAnswer', { lat, lon });
        setHasSubmitted(true);
      }
    }
  }, [gameState, hasSubmitted, timeLeft, userGuess]);

  // Auto-refresh rooms in lobby
  useEffect(() => {
    if (gameState === 'lobby') {
      fetchRooms();
      const interval = setInterval(fetchRooms, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Actions
  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch(`${API_BASE}/rooms`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
           const mappedRooms: RoomInfo[] = data.map((room: any) => ({
             roomId: room.id || room.roomId,
             players: room.players,
             status: 'waiting', 
             maxPlayers: room.max
           }));
           setAvailableRooms(mappedRooms);
        } else if (data.rooms && Array.isArray(data.rooms)) {
           setAvailableRooms(data.rooms);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch rooms", e);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !email) {
      setError("All fields are required");
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });
      const data = await res.json();
      
      if (res.ok || data.success) {
        setError("Registration successful! Please login.");
        setIsRegistering(false);
        setPassword(''); 
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error during registration");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socketRef.current) return;
    socketRef.current.emit('login', { identifier: username, password }, (response: any) => {
      if (response.success) {
        saveCredentials(username, password);
        setCurrentUser({ id: username, name: username });
        
        // Check for active room
        if (response.activeRoomId) {
          setRejoinRoomId(response.activeRoomId);
          setShowRejoinModal(true);
        }

        setGameState('lobby');
      } else {
        setError(response.message || "Login failed");
      }
    });
  };

  const handleLogout = () => {
    clearCredentials();
    if (socketRef.current) socketRef.current.disconnect();
    window.location.reload();
  };

  const handleCreateRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('createRoom', {}, (response: any) => {
      if (response.success) {
        const raw = Array.isArray(response) ? response[0] : response;
        if (raw.roomId || raw.id) {
           setCurrentRoomId(raw.roomId || raw.id);
           setGameState('waiting');
        } else if (raw.success === false) {
           setError(raw.message || "Create room failed");
        }
      } else {
        const raw = response;
        if (raw.success) {
          setCurrentRoomId(raw.roomId);
          setGameState('waiting');
        } else {
          setError(raw.message || "Create room failed");
        }
      }
    });
  };

  const handleJoinRoom = (e?: React.FormEvent, roomId?: string) => {
    if (e) e.preventDefault();
    const idToJoin = roomId || roomIdInput;
    if (!socketRef.current || !idToJoin) return;
    
    socketRef.current.emit('joinRoom', { roomId: idToJoin }, (response: any) => {
      const raw = Array.isArray(response) ? response[0] : response;
      if (raw.success) {
        setCurrentRoomId(idToJoin);
        setGameState('waiting');
      } else {
        setError(raw.message || "Join room failed");
      }
    });
  };

  const handleRejoin = () => {
    if (!socketRef.current || !rejoinRoomId) return;
    
    socketRef.current.emit('rejoinRoom', { roomId: rejoinRoomId }, (response: any) => {
      const raw = Array.isArray(response) ? response[0] : response;
      setShowRejoinModal(false);
      setRejoinRoomId(null);
      
      if (raw.success) {
        setCurrentRoomId(rejoinRoomId);
        // Initially set to waiting; subsequent socket events (e.g., newQuestion, roomInfo) will update the specific state
        setGameState('waiting');
      } else {
        setError(raw.message || "Rejoin failed");
      }
    });
  };

  const handleDeclineRejoin = () => {
    setShowRejoinModal(false);
    setRejoinRoomId(null);
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.connect();
    }
    setCurrentRoomId(null);
    setPlayers([]);
    setGameState('lobby');
  };

  const handleStartGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('startGame', {});
  };

  const handleGuess = (loc: GeoLocation) => {
    if (!hasSubmitted) {
      setUserGuess(loc);
    }
  };

  const handleSubmit = () => {
    if (!socketRef.current || !userGuess) return;
    socketRef.current.emit('submitAnswer', { 
      lat: userGuess.lat, 
      lon: userGuess.lng 
    });
    setHasSubmitted(true);
  };

  const resetGame = () => {
    setGameState('lobby');
    setPlayers([]);
    setCurrentRoomId(null);
    setGameResult(null);
    setStatusInfo(null);
  };

  // Render Helpers
  const renderLogin = () => (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full mb-4">
            <Swords className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isRegistering ? "Create Account" : t.pvpLoginTitle}
          </h2>
        </div>
        
        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.pvpUsername}</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.pvpPassword}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-indigo-600 hover:underline">
                Already have an account? Login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.pvpUsername}</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">{t.pvpPassword}</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {t.pvpLoginBtn}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-indigo-600 hover:underline">
                Need an account? Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  const renderLobby = () => (
    <div className="flex flex-col items-center justify-start min-h-[600px] w-full max-w-6xl mx-auto gap-8">
      {/* Header with User Info */}
      <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
               {currentUser?.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-800">{currentUser?.name}</div>
              <div className="text-xs text-slate-500 flex items-center">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></span>
                 Online
              </div>
            </div>
         </div>
         <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors p-2" title="Logout">
           <LogOut className="w-5 h-5" />
         </button>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center hover:border-indigo-300 transition-all cursor-pointer group" onClick={handleCreateRoom}>
             <div className="bg-emerald-100 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
               <Play className="w-8 h-8 text-emerald-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{t.pvpCreateRoom}</h3>
             <p className="text-slate-500 mb-6 text-sm">Create a new lobby and invite friends to battle.</p>
             <button className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium group-hover:bg-emerald-700 transition-colors">
               Create
             </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center text-center">
             <div className="bg-blue-100 p-4 rounded-full mb-6">
               <Users className="w-8 h-8 text-blue-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-4">{t.pvpJoinRoom}</h3>
             <form onSubmit={(e) => handleJoinRoom(e)} className="w-full space-y-3">
               <input 
                 type="text" 
                 placeholder={t.pvpRoomIdPlaceholder}
                 value={roomIdInput}
                 onChange={e => setRoomIdInput(e.target.value)}
                 className="w-full px-4 py-2 text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
               />
               <button type="submit" className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                 Join
               </button>
             </form>
          </div>
        </div>

        {/* Right: Room List */}
        <div className="lg:col-span-7">
           <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-full min-h-[400px] flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700 flex items-center">
                   <Swords className="w-4 h-4 mr-2" />
                   Available Rooms
                 </h3>
                 <button 
                   onClick={fetchRooms} 
                   className={`p-2 hover:bg-slate-200 rounded-full transition-colors ${isLoadingRooms ? 'animate-spin' : ''}`}
                   title="Refresh Rooms"
                 >
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                 {isLoadingRooms && availableRooms.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      Loading rooms...
                   </div>
                 ) : availableRooms.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Swords className="w-12 h-12 mb-3 opacity-20" />
                      <p>No active rooms found.</p>
                      <p className="text-xs mt-1">Create one to start playing!</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-3">
                      {availableRooms.map((room) => (
                        <div key={room.roomId} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group bg-slate-50/50">
                           <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center font-mono font-bold text-lg text-slate-700 group-hover:text-indigo-600 group-hover:border-indigo-200">
                                 {room.roomId}
                              </div>
                              <div>
                                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Room ID</div>
                                 <div className="text-sm font-medium text-slate-600 flex items-center mt-1">
                                    <Users className="w-3.5 h-3.5 mr-1" />
                                    {/* Handle potentially different player count formats */}
                                    {typeof room.players === 'number' ? room.players : Array.isArray(room.players) ? room.players.length : 0} Players
                                 </div>
                              </div>
                           </div>
                           <button 
                             onClick={() => handleJoinRoom(undefined, room.roomId)}
                             className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg font-medium transition-colors text-sm"
                           >
                             Join
                           </button>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderWaiting = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{t.pvpWaitingForPlayers}</h2>
            <div className="flex items-center mt-1 opacity-80 space-x-2">
              <span className="text-sm font-mono bg-indigo-800 px-2 py-0.5 rounded">{t.pvpRoomId}: {currentRoomId}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={handleLeaveRoom}
               className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-700 hover:bg-red-600 rounded-lg text-xs font-bold transition-colors"
               title="Leave and close room"
             >
               <DoorOpen className="w-4 h-4" />
               <span>Leave Room</span>
             </button>
             <Users className="w-8 h-8 opacity-50" />
          </div>
        </div>
        
        <div className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
             {players.map((p, idx) => (
               <div key={idx} className={`flex items-center p-3 rounded-xl border transition-colors ${
                 p.isOnline === false 
                   ? 'bg-slate-200 border-slate-300 opacity-75' 
                   : 'bg-slate-50 border-slate-200'
               }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mr-3 ${
                    p.isOnline === false ? 'bg-slate-300 text-slate-500' : 'bg-indigo-100 text-indigo-700'
                  }`}>
                    {(p.name || '??').substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-medium text-slate-800 ${p.isOnline === false ? 'line-through text-slate-500' : ''}`}>
                      {p.name || 'Unknown Player'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {p.isOnline === false ? 'Offline' : 'Ready'}
                    </div>
                  </div>
               </div>
             ))}
             {/* Empty slots placeholders if needed */}
             {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
               <div key={`empty-${i}`} className="flex items-center p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-300">
                 <User className="w-5 h-5 mr-2" />
                 <span className="text-sm">Empty Slot</span>
               </div>
             ))}
           </div>

           <div className="flex justify-center">
             {/* Only owner (usually first player) sees start button */}
             {players.length > 0 && players[0].name === currentUser?.name ? (
                <button 
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {t.pvpStartGame}
                </button>
             ) : (
                <div className="flex items-center text-slate-500 animate-pulse">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Waiting for host to start...
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    // Determine map markers based on state
    let mapPoints: MapPoint[] = [];
    let targetLoc: GeoLocation | null = null;

    if ((gameState === 'round_result' || gameState === 'countdown') && roundResult) {
      if (roundResult.answer && (roundResult.answer.lat || roundResult.answer.lat === 0) && (roundResult.answer.lon || roundResult.answer.lon === 0)) {
         targetLoc = { lat: Number(roundResult.answer.lat), lng: Number(roundResult.answer.lon) };
      }
      
      // Map other players' guesses (Filter out current user to avoid duplicate markers with selectedLocation)
      if (Array.isArray(roundResult.players)) {
        mapPoints = roundResult.players
          .filter(p => (p.lat || p.lat === 0) && (p.lon || p.lon === 0)) // Only show players who made a valid guess
          .filter(p => String(p.id) !== String(currentUser?.id)) // Exclude current user from comparison points
          .map((p, idx) => ({
            id: String(p.id),
            location: { lat: Number(p.lat), lng: Number(p.lon) },
            color: PLAYER_COLORS[idx % PLAYER_COLORS.length],
            name: p.name || 'Unknown'
          }));
      }
    }

    // Prepare climate data properly. 
    const climateData = currentClimate?.data ? currentClimate.data : [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Left: Map & Input */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
           {/* Status Bar */}
           <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                 <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold text-sm">
                   {t.pvpRound} {round}
                 </div>
                 {timeLeft > 0 && timeLeft < 60 && (
                   <div className="flex items-center text-orange-600 font-mono font-bold">
                     <Timer className="w-4 h-4 mr-1" />
                     {timeLeft}s
                   </div>
                 )}
              </div>
              <div className="text-right">
                 <div className="text-xs text-slate-500">{t.pvpRoomId}</div>
                 <div className="font-mono font-bold text-slate-700">{currentRoomId}</div>
              </div>
           </div>

           {/* Map */}
           <div className="flex-1 relative min-h-[400px]">
             <MapPicker 
               mode="game" // Always use game mode to show target/guess lines
               selectedLocation={userGuess}
               comparisonPoints={mapPoints}
               gameTargetLocation={targetLoc}
               onLocationSelect={handleGuess}
             />
             
             {/* Countdown Overlay (Transparent & Non-Blocking) */}
             {gameState === 'countdown' && !roundResult && (
               <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[500] pointer-events-none flex flex-col items-center">
                 {countdownMessage && (
                    <div className="px-4 py-2 bg-slate-900/80 backdrop-blur-sm rounded-lg text-white font-bold mb-2 animate-in fade-in slide-in-from-top-2 shadow-lg">
                        {countdownMessage}
                    </div>
                 )}
                 <div className="text-8xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5)' }}>
                   {startCountdown}
                 </div>
               </div>
             )}

             {/* Action Button */}
             {(gameState === 'playing' || gameState === 'countdown') && (
               <div className="absolute bottom-6 left-6 right-6 z-[400]">
                 {hasSubmitted ? (
                    <div className="w-full bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center animate-in slide-in-from-bottom-2">
                       {t.pvpAnswerSubmitted}
                    </div>
                 ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={!userGuess}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold shadow-lg transition-all transform active:scale-[0.98]"
                    >
                      {userGuess ? t.gameConfirmGuess : t.gameInstructionGuess}
                    </button>
                 )}
               </div>
             )}
           </div>

           {/* Players List (Mini) */}
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
             {players.map((p, idx) => (
                <div key={idx} className={`p-2 rounded-lg border text-xs flex justify-between items-center transition-colors ${
                  p.isOnline === false ? 'bg-slate-100 border-slate-200 opacity-60' :
                  (p.id === currentUser?.id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100')
                }`}>
                   <span 
                     className={`font-bold truncate max-w-[60px] ${p.isOnline === false ? 'line-through decoration-slate-400 text-slate-400' : ''}`} 
                     style={{ color: p.isOnline === false ? undefined : PLAYER_COLORS[idx % PLAYER_COLORS.length] }}
                   >
                     {p.name || 'Unknown'}
                   </span>
                   <div className="flex flex-col items-end">
                      <span className="font-mono">{p.score} pts</span>
                      {/* Show HP for 1v1 or generic score */}
                      {p.hp !== undefined && <span className="text-[10px] text-red-500 flex items-center"><Heart className="w-3 h-3 mr-0.5 fill-current" /> {p.hp}</span>}
                   </div>
                </div>
             ))}
           </div>
        </div>

        {/* Right: Data & Results */}
        <div className="lg:col-span-7 flex flex-col">
           {(gameState === 'round_result' || (gameState === 'countdown' && roundResult)) ? (
             <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden h-full animate-in fade-in">
               {roundResult && (
                 <>
                   <div className="bg-slate-900 text-white p-6">
                     <h3 className="text-xl font-bold mb-1">{roundResult.answer.city}, {roundResult.answer.country}</h3>
                     <p className="text-slate-400 text-sm font-mono">
                       {roundResult.answer.lat ? Number(roundResult.answer.lat).toFixed(2) : '0.00'}, {roundResult.answer.lon ? Number(roundResult.answer.lon).toFixed(2) : '0.00'}
                     </p>
                   </div>
                   <div className="p-0 overflow-y-auto max-h-[600px]">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                          <tr>
                            <th className="p-4 font-medium">Rank</th>
                            <th className="p-4 font-medium">Player</th>
                            <th className="p-4 font-medium text-right">Distance</th>
                            <th className="p-4 font-medium text-right">Score (+Delta)</th>
                            <th className="p-4 font-medium text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {roundResult.players.sort((a,b) => b.score - a.score).map((p, idx) => (
                            <tr key={idx} className={p.id === currentUser?.id ? 'bg-indigo-50/50' : ''}>
                              <td className="p-4">
                                 {idx === 0 ? <Trophy className="w-4 h-4 text-yellow-500" /> : <span className="text-slate-400 font-mono ml-1">#{idx+1}</span>}
                              </td>
                              <td className="p-4 font-bold" style={{ color: PLAYER_COLORS[players.findIndex(pl => pl.id === p.id) % PLAYER_COLORS.length] }}>
                                {p.name || 'Unknown'}
                              </td>
                              <td className="p-4 text-right font-mono text-slate-600">
                                {p.distance !== undefined ? Math.round(p.distance) + ' km' : '-'}
                              </td>
                              <td className="p-4 text-right">
                                 <span className="font-bold text-emerald-600">+{p.score}</span>
                                 {p.delta !== undefined && p.delta < 0 && <span className="text-xs text-red-500 ml-1">({p.delta})</span>}
                              </td>
                              <td className="p-4 text-right font-bold text-indigo-900">
                                {p.totalScore}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="p-6 text-center border-t border-slate-100 bg-slate-50 mt-auto">
                         {gameState === 'countdown' && startCountdown > 0 ? (
                            <div className="flex flex-col items-center animate-pulse">
                               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Next round in</p>
                               <p className="text-3xl font-black text-indigo-600 font-mono">{startCountdown}</p>
                            </div>
                         ) : (
                            <p className="text-slate-500 animate-pulse text-sm font-medium">Next round starting soon...</p>
                         )}
                      </div>
                   </div>
                 </>
               )}
             </div>
           ) : (
             <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                {currentClimate && (
                  <>
                    <ClimateChart data={climateData} />
                    <ClimateTable data={climateData} />
                  </>
                )}
             </div>
           )}
        </div>
      </div>
    );
  };

  const renderGameOver = () => (
    <div className="flex items-center justify-center min-h-[600px] animate-in zoom-in-95 duration-500">
       <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden w-full max-w-2xl text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-10 text-white">
             <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300 drop-shadow-md" />
             <h2 className="text-4xl font-black tracking-tight">{t.pvpGameOver}</h2>
          </div>
          <div className="p-8">
             <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-6">{t.pvpFinalRank}</h3>
             
             <div className="space-y-4 mb-8">
                {/* Sort by delta (descending), then by match score */}
                {gameResult?.sort((a,b) => {
                  if (b.delta !== a.delta) return b.delta - a.delta;
                  return b.score - a.score;
                }).map((p, idx) => (
                  <div key={idx} className="flex items-center p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-100 transition-colors bg-slate-50">
                     <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl mr-4 ${
                       idx === 0 ? 'bg-yellow-100 text-yellow-600' : 
                       idx === 1 ? 'bg-slate-200 text-slate-600' :
                       idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-400 border border-slate-200'
                     }`}>
                        {idx + 1}
                     </div>
                     <div className="flex-1 text-left">
                        <div className="font-bold text-lg text-slate-800">{p.name || 'Unknown'}</div>
                        {/* Show Match Score as secondary info */}
                        <div className="text-xs text-slate-500">{t.pvpScore}: {p.score}</div>
                     </div>
                     <div className="text-right">
                        {/* Show Personal Rating (newScore) as primary info */}
                        <div className="font-black text-2xl text-indigo-600">{p.newScore}</div>
                        <div className={`text-xs font-bold ${p.delta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                           {p.delta >= 0 ? '+' : ''}{p.delta} {t.pvpRatingChange || 'rating'}
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             <button 
               onClick={resetGame}
               className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg"
             >
               {t.pvpBackToLobby}
             </button>
          </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 relative">
       {/* Error Toast */}
       {error && (
         <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[2000] bg-red-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-start max-w-[90vw] md:max-w-[600px] animate-in slide-in-from-top-4">
           <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
           <div className="flex-1 text-sm font-medium break-words">
             {error}
           </div>
           <button onClick={() => setError(null)} className="ml-4 hover:opacity-80 mt-0.5 flex-shrink-0"><X className="w-4 h-4" /></button>
         </div>
       )}
       
       {/* Status Info Overlay (Loading/Transient Messages) */}
       {statusInfo && (
          <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
             <div className="bg-white px-10 py-8 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm text-center transform scale-100 animate-in zoom-in-95 duration-200">
                {statusInfo.type === 'loading' && (
                   <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      </div>
                   </div>
                )}
                {statusInfo.type === 'success' && (
                  <div className="mb-4 bg-emerald-100 p-3 rounded-full text-emerald-600">
                     <User className="w-8 h-8" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-800 mb-2">{statusInfo.message}</h3>
                {statusInfo.type === 'loading' && <p className="text-slate-500 text-sm animate-pulse">Please wait...</p>}
             </div>
          </div>
       )}

       {/* Rejoin Modal */}
       {showRejoinModal && rejoinRoomId && (
         <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-2 border-indigo-100 relative animate-in zoom-in-95">
               <div className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={handleDeclineRejoin}>
                 <X className="w-5 h-5" />
               </div>
               
               <div className="flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-4 rounded-full mb-6">
                     <RotateCcw className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Rejoin Previous Game?</h3>
                  <p className="text-slate-600 mb-6">
                    You seem to have been disconnected from room <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 rounded">{rejoinRoomId}</span>. Would you like to rejoin?
                  </p>
                  
                  <div className="flex space-x-4 w-full">
                     <button 
                       onClick={handleDeclineRejoin}
                       className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleRejoin}
                       className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
                     >
                       Rejoin Game
                     </button>
                  </div>
               </div>
            </div>
         </div>
       )}

       {gameState === 'login' && renderLogin()}
       {gameState === 'lobby' && renderLobby()}
       {gameState === 'waiting' && renderWaiting()}
       {(gameState === 'playing' || gameState === 'countdown' || gameState === 'round_result') && renderGame()}
       {gameState === 'game_over' && renderGameOver()}
    </div>
  );
};