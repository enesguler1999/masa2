import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send, LogIn, LogOut, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';

export default function MessageTest() {
    const [baseUrl, setBaseUrl] = useState('https://x3jxrchatapp.prw.mindbricks.com');
    const [hubName, setHubName] = useState('ddd');
    const [token, setToken] = useState('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbk1hcmsiOiJ4M2p4cmNoYXRhcHAtaW5hcHAtdG9rZW4iLCJrZXlJZCI6ImJkYWVlYzYyZmE0NzQ5NzliYWU4NjdhMjE3YTVkMWJiIiwidG9rZW5OYW1lIjoieDNqeHJjaGF0YXBwLWFjY2Vzcy10b2tlbiIsInNlc3Npb25JZCI6ImIxZjI1NjlkY2FlNDQ5MDg5ZGFkMjM4MGJjYWY2YThjIiwidXNlcklkIjoiZjcxMDNiODUtZmNkYS00ZGVjLTkyYzYtYzMzNmY3MWZkM2EyIiwic3ViIjoiZjcxMDNiODUtZmNkYS00ZGVjLTkyYzYtYzMzNmY3MWZkM2EyIiwiaWF0IjoxNzcxOTMwOTc2fQ.I958UC87svJ10mEadTTqaLett743q-zd9WfM36vsOzHBM947pqoZ3bmXlSSbWMqqYCuViw9KBdqQV9LKsRGvHe5lZ5InS6vCZXxvh7AfVZf92PUvFF3Tg8clLpgsmElmcOWPezPnp02Gu7ry4Ktok15sg2mY1zl1ZniqmNwkEnFbAbfMx5sdHI83LKqvhGsZtBQvmOry2aWX97D_Z3gBQFWjARf_c8XDIvCutnN9daEiJM7FjcrMOckY_-O61HigdZZIIzYll-caFZYEFzYwa3pmALHOI3BAwokyWJF5sH02t3cpyZ4PFKOSUzxxk_32L2SOF9V6O7c5PzHX4RxeGg');
    const [roomId, setRoomId] = useState('19c8f512-3288-4c44-848e-208cb5d23dac');
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState('disconnected'); // disconnected, connecting, connected
    const [roomStatus, setRoomStatus] = useState(''); // joined, error, left
    const [logs, setLogs] = useState([]);
    const [messages, setMessages] = useState([]);

    // Message Sending
    const [messageType, setMessageType] = useState('text');
    const [messageContent, setMessageContent] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, logs]);

    const addLog = (type, message, data = null) => {
        setLogs(prev => [...prev, {
            id: Date.now() + Math.random().toString(36).substring(7),
            time: new Date().toLocaleTimeString(),
            type,
            message,
            data
        }]);
    };

    const handleConnect = () => {
        if (!baseUrl || !hubName || !token) {
            addLog('error', 'Base URL, Hub Name, and Token are required.');
            return;
        }

        setStatus('connecting');
        const connectionUrl = `${baseUrl}/chat-api/hub/${hubName}`;
        addLog('system', `Connecting to ${connectionUrl}...`);
        addLog('info', `Socket.IO path: /chat-api/socket.io/`);
        addLog('info', `Namespace: /chat-api/hub/${hubName}`);

        const newSocket = io(connectionUrl, {
            path: '/chat-api/socket.io/',
            auth: { token },
            transports: ["polling", "websocket"],  // polling first - more reliable behind reverse proxies
            timeout: 20000,
            reconnectionAttempts: 3,
        });

        newSocket.io.on("error", (err) => {
            addLog('error', `[Manager] Transport error: ${err?.message || err}`);
        });

        newSocket.io.on("reconnect_attempt", (attempt) => {
            addLog('system', `Reconnect attempt #${attempt}...`);
        });

        newSocket.io.on("reconnect_failed", () => {
            addLog('error', `All reconnect attempts failed.`);
        });

        newSocket.on("connect", () => {
            setStatus('connected');
            addLog('success', `Connected with ID: ${newSocket.id}`);
            addLog('info', `Transport: ${newSocket.io.engine?.transport?.name}`);

            // Auto join room if provided
            if (roomId) {
                joinRoom(newSocket, roomId);
            }
        });

        newSocket.on("connect_error", (err) => {
            addLog('error', `Connection failed: ${err.message}`);
            addLog('error', `Error type: ${err.type || 'unknown'} | Description: ${err.description || 'N/A'}`);
            if (err.context) {
                addLog('error', `Context: ${JSON.stringify(err.context)}`);
            }
            // Don't set disconnected immediately - let reconnect attempts happen
        });

        newSocket.on("disconnect", (reason) => {
            setStatus('disconnected');
            setRoomStatus('');
            addLog('system', `Disconnected: ${reason}`);
        });

        // Setup Hub Event Listeners
        newSocket.on("hub:joined", (data) => {
            setRoomStatus('joined');
            addLog('success', `Joined room: ${data.roomId}`);
        });

        newSocket.on("hub:error", (data) => {
            addLog('error', `Hub Error: ${data.error}`, data);
        });

        newSocket.on("hub:presence", (data) => {
            addLog('info', `Presence [${data.event}]: ${data.user?.id || 'Unknown user'}`);
        });

        newSocket.on("hub:history", (data) => {
            addLog('info', `Received history: ${data.messages?.length || 0} messages`);
            if (data.messages && Array.isArray(data.messages)) {
                // Sort history by timestamp
                const sorted = [...data.messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setMessages(sorted);
            }
        });

        newSocket.on("hub:messageArrived", (data) => {
            addLog('info', `Message arrived from: ${data.sender?.id || 'System'}`);
            setMessages(prev => [...prev, data.message]);
        });

        setSocket(newSocket);
    };

    const joinRoom = (skt, rId) => {
        if (!skt || !rId) return;
        addLog('system', `Attempting to join room: ${rId}`);
        skt.emit("hub:join", { roomId: rId });
    };

    const handleJoinLeaveRoom = () => {
        if (roomStatus === 'joined') {
            socket.emit("hub:leave", { roomId });
            setRoomStatus('');
            addLog('system', `Left room: ${roomId}`);
        } else {
            joinRoom(socket, roomId);
        }
    };

    const handleDisconnect = () => {
        if (socket) {
            socket.disconnect();
        }
    };

    const clearLogsAndMessages = () => {
        setLogs([]);
        setMessages([]);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!socket || roomStatus !== 'joined' || !messageContent.trim()) return;

        let contentObj;
        try {
            if (messageType === 'text') {
                contentObj = { body: messageContent };
            } else {
                // Try to parse as JSON if it's a structural message type
                contentObj = JSON.parse(messageContent);
            }
        } catch (err) {
            addLog('error', 'Failed to parse message content. Ensure it is valid JSON if not plain text.');
            return;
        }

        const payload = {
            roomId,
            messageType,
            content: contentObj
        };

        socket.emit("hub:send", payload);
        addLog('system', `Sent message type: ${messageType}`, payload);
        setMessageContent('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center shadow-sm">
                <h1 className="text-xl font-bold text-gray-800">Chat Service Realtime Hub Tester</h1>
                <div className="flex items-center gap-2">
                    {status === 'connected' ? (
                        <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            <CheckCircle className="w-4 h-4 mr-1.5" /> Connected
                        </span>
                    ) : status === 'connecting' ? (
                        <span className="flex items-center text-sm font-medium text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                            <AlertCircle className="w-4 h-4 mr-1.5 animate-pulse" /> Connecting...
                        </span>
                    ) : (
                        <span className="flex items-center text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                            <XCircle className="w-4 h-4 mr-1.5" /> Disconnected
                        </span>
                    )}
                </div>
            </header>

            <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Panel: Configuration & Logs */}
                <div className="md:col-span-1 flex flex-col gap-6 h-[calc(100vh-100px)]">

                    {/* Connection Config */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex-shrink-0">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Connection Options</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Base URL</label>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={e => setBaseUrl(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://...mindbricks.com"
                                    disabled={status !== 'disconnected'}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Hub Name</label>
                                    <input
                                        type="text"
                                        value={hubName}
                                        onChange={e => setHubName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ddd"
                                        disabled={status !== 'disconnected'}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Room ID</label>
                                    <input
                                        type="text"
                                        value={roomId}
                                        onChange={e => setRoomId(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="roomId"
                                        disabled={roomStatus === 'joined'}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Access Token</label>
                                <input
                                    type="text"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    placeholder="Bearer token (without 'Bearer ')"
                                    disabled={status !== 'disconnected'}
                                />
                            </div>

                            <div className="pt-2 flex gap-2">
                                {status === 'disconnected' ? (
                                    <button
                                        onClick={handleConnect}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                                    >
                                        <LogIn className="w-4 h-4 mr-2" /> Connect
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleDisconnect}
                                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border border-red-200"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" /> Disconnect
                                    </button>
                                )}

                                <button
                                    onClick={handleJoinLeaveRoom}
                                    disabled={status !== 'connected' || !roomId}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center border
                    ${status !== 'connected' || !roomId ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' :
                                            roomStatus === 'joined' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200' : 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200'
                                        }`}
                                >
                                    {roomStatus === 'joined' ? 'Leave Room' : 'Join Room'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Logs */}
                    <div className="bg-black rounded-xl shadow-sm flex flex-col overflow-hidden flex-1 border border-gray-800">
                        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex justify-between items-center">
                            <h2 className="text-sm font-semibold text-gray-300">System Logs</h2>
                            <button onClick={clearLogsAndMessages} className="text-gray-500 hover:text-white transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-2">
                            {logs.map((log) => (
                                <div key={log.id} className="break-words">
                                    <span className="text-gray-500">[{log.time}]</span>{' '}
                                    <span className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-green-400' : ''}
                    ${log.type === 'info' ? 'text-blue-400' : ''}
                    ${log.type === 'system' ? 'text-yellow-400' : ''}
                  `}>
                                        {log.message}
                                    </span>
                                    {log.data && (
                                        <pre className="mt-1 ml-4 text-gray-400 bg-gray-900 p-2 rounded text-[10px] overflow-x-auto">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Chat Interface */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-100px)]">
                    <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {roomStatus === 'joined' ? `Room: ${roomId}` : 'Chat Preview (Not in room)'}
                        </h2>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 bg-chat bg-[#f0f2f5]">
                        <div className="space-y-4 max-w-3xl mx-auto flex flex-col">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 py-10 mt-auto mb-auto">
                                    <div className="bg-white/50 inline-block px-4 py-2 rounded-lg text-sm">
                                        No messages to display. Join a room to see history.
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    // Basic rendering for different message types
                                    const isSystem = !msg.senderId;

                                    if (isSystem) {
                                        return (
                                            <div key={idx} className="flex justify-center my-2">
                                                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full text-center">
                                                    {JSON.stringify(msg.content)}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={idx} className={`flex flex-col max-w-[80%] ${msg.senderId === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                                            <span className="text-[10px] text-gray-500 mb-1 ml-1">{msg.senderId} • {new Date(msg.timestamp).toLocaleTimeString()}</span>
                                            <div className={`px-4 py-2 rounded-2xl shadow-sm ${msg.senderId === 'me' ? 'bg-[#d9fdd3] rounded-tr-sm' : 'bg-white border border-gray-100 rounded-tl-sm'}`}>
                                                {msg.messageType === 'text' ? (
                                                    <p className="text-sm text-gray-800 break-words whitespace-pre-wrap">{msg.content?.body}</p>
                                                ) : (
                                                    <pre className="text-[10px] bg-gray-50 p-2 rounded text-gray-700 whitespace-pre-wrap break-all">
                                                        [{msg.messageType}] {JSON.stringify(msg.content, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Message Input Container */}
                    <div className="p-4 bg-white border-t border-gray-200 rounded-b-xl">
                        <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <select
                                    value={messageType}
                                    onChange={(e) => setMessageType(e.target.value)}
                                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                                    disabled={roomStatus !== 'joined'}
                                >
                                    <option value="text">text</option>
                                    <option value="image">image</option>
                                    <option value="video">video</option>
                                    <option value="file">file</option>
                                    <option value="custom">custom</option>
                                </select>

                                <input
                                    type="text"
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder={messageType === 'text' ? "Type a message..." : '{"url": "...", "size": 1234}'}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={roomStatus !== 'joined'}
                                />

                                <button
                                    type="submit"
                                    disabled={roomStatus !== 'joined' || !messageContent.trim()}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-colors
                    ${roomStatus === 'joined' && messageContent.trim()
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
