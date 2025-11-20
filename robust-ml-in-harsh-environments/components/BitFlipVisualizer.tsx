import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const BitFlipVisualizer: React.FC = () => {
  const [floatVal, setFloatVal] = useState<number>(0.15625);
  const [bits, setBits] = useState<string[]>(new Array(32).fill('0'));

  // Convert number to 32 bits
  const updateBitsFromFloat = useCallback((val: number) => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, val, false); // Big endian for display order
    let bitStr = '';
    for (let i = 0; i < 4; i++) {
      bitStr += view.getUint8(i).toString(2).padStart(8, '0');
    }
    setBits(bitStr.split(''));
  }, []);

  // Convert 32 bits to number
  const updateFloatFromBits = (newBits: string[]) => {
    const bitStr = newBits.join('');
    // We need to parse this manually to Float32
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    
    // Split into bytes
    for(let i=0; i<4; i++) {
       const byteStr = bitStr.substring(i*8, (i+1)*8);
       view.setUint8(i, parseInt(byteStr, 2));
    }
    
    const newVal = view.getFloat32(0, false);
    setFloatVal(newVal);
    setBits(newBits);
  };

  useEffect(() => {
    updateBitsFromFloat(floatVal);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBit = (index: number) => {
    const newBits = [...bits];
    newBits[index] = newBits[index] === '0' ? '1' : '0';
    updateFloatFromBits(newBits);
  };

  const reset = () => {
    setFloatVal(0.15625);
    updateBitsFromFloat(0.15625);
  };

  const isExtreme = Math.abs(floatVal) > 1000 || isNaN(floatVal) || !isFinite(floatVal);

  return (
    <div className="flex flex-col items-center w-full">
      
      {/* Number Display */}
      <div className="flex flex-col items-center justify-center mb-8 w-full">
        <div className="text-sm text-slate-500 mb-2 font-mono uppercase tracking-widest">Current Value</div>
        <div className={`text-4xl md:text-6xl font-mono font-bold transition-colors duration-300 overflow-x-auto max-w-full text-center p-2 ${isExtreme ? 'text-red-600' : 'text-blue-600'}`}>
          {isNaN(floatVal) ? 'NaN' : !isFinite(floatVal) ? 'Infinity' : floatVal.toExponential(4)}
        </div>
        {isExtreme && (
          <div className="flex items-center mt-3 text-red-600 bg-red-50 px-4 py-2 rounded-full">
             <AlertTriangle size={18} className="mr-2" />
             <span className="text-sm font-bold">Catastrophic Error Detected!</span>
          </div>
        )}
      </div>

      {/* Bits Grid */}
      <div className="w-full overflow-x-auto no-scrollbar pb-4">
        <div className="flex justify-center min-w-[800px] space-x-1">
          {bits.map((bit, index) => {
            let colorClass = "bg-slate-200 text-slate-500 hover:bg-slate-300";
            let label = "";
            let groupClass = "";

            if (index === 0) {
              colorClass = "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"; // Sign
              label = "S";
            } else if (index >= 1 && index <= 8) {
              colorClass = "bg-red-100 text-red-700 border-red-300 hover:bg-red-200"; // Exponent
              groupClass = "border-t-4 border-red-400";
              if (index === 4) label = "EXPONENT";
            } else {
              colorClass = "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"; // Mantissa
              if (index === 20) label = "MANTISSA";
            }

            return (
              <div key={index} className="flex flex-col items-center space-y-1">
                 <button
                  onClick={() => toggleBit(index)}
                  className={`w-6 h-10 md:w-8 md:h-12 flex items-center justify-center rounded border font-mono text-sm md:text-base font-bold transition-all shadow-sm ${colorClass} ${bit === '1' ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
                  title={`Toggle Bit ${index}`}
                >
                  {bit}
                </button>
                <div className="h-4">
                  {index === 0 && <span className="text-[10px] font-bold text-green-600">S</span>}
                  {index === 4 && <span className="text-[10px] font-bold text-red-600 whitespace-nowrap">EXP</span>}
                  {index === 20 && <span className="text-[10px] font-bold text-blue-400 whitespace-nowrap">MANTISSA</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex space-x-4 mt-4">
         <button onClick={reset} className="flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-sm font-medium transition-colors">
            <RefreshCw size={16} className="mr-2" /> Reset Value
         </button>
      </div>

      <div className="mt-6 text-center max-w-md text-sm text-slate-500 italic">
        Try flipping a bit in the red (Exponent) section versus the blue (Mantissa) section. Notice the difference in magnitude.
      </div>
    </div>
  );
};
