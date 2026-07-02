import React, { useState } from 'react';

export default function NmapReader({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [parsedData, setParsedData] = useState(null);

  const handleParse = () => {
    try {
      let processedInput = input.replace(/^OS:/gm, '').replace(/[\r\n\s]+/g, '');
      if (!processedInput) return;
      
      if (!processedInput.match(/^[A-Z0-9]+\(/)) {
         const firstParen = processedInput.indexOf(')');
         if (firstParen !== -1) {
             const osData = processedInput.substring(0, firstParen);
             processedInput = `OS(${osData})` + processedInput.substring(firstParen + 1);
         }
      }

      const regex = /([A-Z0-9]+)\(([^)]*)\)/g;
      let match;
      const result = [];
      while ((match = regex.exec(processedInput)) !== null) {
        const testName = match[1];
        const fieldsStr = match[2];
        const fields = fieldsStr.split('%').map(pair => {
          const [key, value] = pair.split('=');
          return { key, value: value || '' };
        });
        result.push({ testName, fields });
      }
      setParsedData(result);
    } catch (e) {
      console.error("Failed to parse", e);
      setParsedData([{ testName: 'ERROR', fields: [{ key: 'Error', value: 'Invalid format' }] }]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black/90 border border-cyan-500/50 rounded-xl w-full max-w-5xl shadow-[0_0_30px_rgba(34,211,238,0.3)] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b border-cyan-500/30">
          <h2 className="text-2xl font-bold text-cyan-400 tracking-widest flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></span>
            NMAP FINGERPRINT DECODER
          </h2>
          <button onClick={onClose} className="text-cyan-500 hover:text-cyan-300 text-3xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-cyan-300 font-mono text-sm tracking-widest">RAW FINGERPRINT INPUT:</label>
            <textarea 
              className="w-full h-32 bg-black/50 border border-cyan-500/30 rounded p-3 text-cyan-100 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
              placeholder="Paste raw Nmap OS fingerprint here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button 
              onClick={handleParse}
              className="self-start mt-2 px-6 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 rounded hover:bg-cyan-500/40 hover:text-cyan-100 transition-all font-bold tracking-widest"
            >
              DECODE
            </button>
          </div>

          {parsedData && (
            <div className="flex flex-col gap-4 mt-4 border-t border-cyan-500/20 pt-6">
              <h3 className="text-xl font-bold text-cyan-400 tracking-widest">DECODED OUTPUT</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parsedData.map((block, i) => (
                  <div key={i} className="bg-cyan-900/10 border border-cyan-500/20 rounded p-4">
                    <h4 className="text-lg font-bold text-cyan-300 mb-3 border-b border-cyan-500/20 pb-1 inline-block">
                      {block.testName}
                    </h4>
                    <ul className="space-y-1 font-mono text-sm">
                      {block.fields.map((field, j) => (
                        <li key={j} className="flex justify-between items-start">
                          <span className="text-cyan-500 font-bold">{field.key}:</span>
                          <span className="text-cyan-100 break-all ml-2 text-right">{field.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
