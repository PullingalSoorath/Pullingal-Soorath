import React, { useState } from 'react';
import { Phone, Delete, User, PhoneCall, PhoneOff } from 'lucide-react';
import { sound } from '../../audio/audioEngine';

export const PhoneApp: React.FC = () => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'keypad' | 'recents' | 'contacts'>('keypad');
  const [inCall, setInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const keys = [
    { num: '1', sub: '' },
    { num: '2', sub: 'ABC' },
    { num: '3', sub: 'DEF' },
    { num: '4', sub: 'GHI' },
    { num: '5', sub: 'JKL' },
    { num: '6', sub: 'MNO' },
    { num: '7', sub: 'PQRS' },
    { num: '8', sub: 'TUV' },
    { num: '9', sub: 'WXYZ' },
    { num: '*', sub: '' },
    { num: '0', sub: '+' },
    { num: '#', sub: '' },
  ];

  const handleKeyPress = (num: string) => {
    sound.playDialTone(num);
    setDialedNumber((prev) => (prev.length < 15 ? prev + num : prev));
  };

  const handleDelete = () => {
    sound.playClick();
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const startCall = (num = dialedNumber) => {
    if (!num) return;
    sound.playChirp(700, 0.1);
    setInCall(true);
    setCallDuration(0);
  };

  const endCall = () => {
    sound.playClick();
    setInCall(false);
  };

  React.useEffect(() => {
    if (!inCall) return;
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [inCall]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (inCall) {
    return (
      <div className="flex flex-col h-full justify-between items-center py-8 animate-fadeIn text-white">
        <div className="text-center space-y-2 mt-4">
          <div className="w-20 h-20 rounded-full bg-slate-800 border border-white/20 mx-auto flex items-center justify-center text-3xl font-bold shadow-xl">
            {dialedNumber.includes('7025') ? 'PS' : '📱'}
          </div>
          <h3 className="text-lg font-bold font-space">
            {dialedNumber.includes('7025') ? 'Pullingal Soorath' : dialedNumber || 'Outgoing Call'}
          </h3>
          <div className="text-xs font-mono text-emerald-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>HD Voice &bull; {formatTime(callDuration)}</span>
          </div>
        </div>

        <div className="w-full px-8 space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {['Mute', 'Keypad', 'Speaker', 'Add Call', 'Video', 'Hold'].map((opt) => (
              <button
                key={opt}
                onClick={() => sound.playClick()}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-xs font-sans text-slate-200 transition-all flex flex-col items-center gap-1"
              >
                <span>{opt}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between animate-fadeIn text-white">
      {/* Top tabs */}
      <div className="flex items-center justify-around py-1 border-b border-white/10 text-xs font-space font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('keypad')}
          className={`py-1.5 px-3 border-b-2 transition-all ${
            activeTab === 'keypad'
              ? 'text-[#00F5FF] border-[#00F5FF]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Keypad
        </button>
        <button
          onClick={() => setActiveTab('recents')}
          className={`py-1.5 px-3 border-b-2 transition-all ${
            activeTab === 'recents'
              ? 'text-[#00F5FF] border-[#00F5FF]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Recents
        </button>
        <button
          onClick={() => setActiveTab('contacts')}
          className={`py-1.5 px-3 border-b-2 transition-all ${
            activeTab === 'contacts'
              ? 'text-[#00F5FF] border-[#00F5FF]'
              : 'border-transparent hover:text-white'
          }`}
        >
          Contacts
        </button>
      </div>

      {activeTab === 'keypad' && (
        <div className="flex flex-col flex-1 justify-between py-2">
          {/* Displayed dialed number */}
          <div className="h-16 flex items-center justify-center relative px-6">
            <span className="text-2xl sm:text-3xl font-orbitron font-bold tracking-wider text-white text-center truncate">
              {dialedNumber || (
                <span className="text-slate-600 font-normal text-sm font-sans">
                  Dial number or tap contacts
                </span>
              )}
            </span>
            {dialedNumber && (
              <button
                onClick={handleDelete}
                className="absolute right-4 p-2 text-slate-400 hover:text-white"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Dialpad buttons */}
          <div className="grid grid-cols-3 gap-y-2.5 gap-x-6 px-6">
            {keys.map((k) => (
              <button
                key={k.num}
                onClick={() => handleKeyPress(k.num)}
                className="w-14 h-14 mx-auto rounded-full bg-white/5 hover:bg-white/15 active:scale-95 border border-white/5 flex flex-col items-center justify-center transition-all shadow-md group"
              >
                <span className="text-xl font-bold font-space text-white group-hover:text-[#00F5FF]">
                  {k.num}
                </span>
                {k.sub && (
                  <span className="text-[9px] font-mono tracking-widest text-slate-400">
                    {k.sub}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Green Call Action Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => startCall()}
              disabled={!dialedNumber}
              className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-40 transition-all"
            >
              <Phone className="w-6 h-6 text-black fill-black" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'recents' && (
        <div className="flex-1 overflow-y-auto space-y-2 py-3 px-2">
          {[
            { name: 'Pullingal Soorath', num: '+91 7025 2435 79', time: '10:42 AM', type: 'incoming' },
            { name: 'Engineering Team Lead', num: '+91 9847 0000 00', time: 'Yesterday', type: 'outgoing' },
            { name: 'Global Tech Recruiter', num: '+1 415 555 0192', time: 'Oct 24', type: 'incoming' },
          ].map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setDialedNumber(item.num);
                startCall(item.num);
              }}
              className="p-3 rounded-2xl bg-white/5 hover:bg-[#00F5FF]/10 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 text-[#00F5FF] flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{item.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{item.num}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">{item.time}</span>
                <PhoneCall className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="flex-1 overflow-y-auto space-y-2 py-3 px-2">
          {[
            { name: 'Pullingal Soorath (Flutter Dev)', num: '+91 7025 2435 79', badge: 'Engineer' },
            { name: 'Flutter Architecture Office', num: '+91 9847 1111 22', badge: 'Engineering' },
            { name: 'Govt. ITI Dhanuvachapuram', num: '+91 471 222 3344', badge: 'Alumni' },
          ].map((c, i) => (
            <div
              key={i}
              onClick={() => {
                setDialedNumber(c.num);
                setActiveTab('keypad');
              }}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="text-xs font-bold text-white">{c.name}</div>
                <div className="text-[10px] font-mono text-[#00F5FF]">{c.num}</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {c.badge}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
