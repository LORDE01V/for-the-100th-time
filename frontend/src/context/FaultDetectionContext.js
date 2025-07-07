import React, { createContext, useState, useEffect, useContext } from 'react';

const FaultDetectionContext = createContext();

export const FaultDetectionContextProvider = ({ children }) => {
  const [faults, setFaults] = useState([]);

  useEffect(() => {
    // Initial mock faults
    const mockFaults = [
      { type: 'Overvoltage detected', details: 'Voltage exceeded 240V', timestamp: '2023-10-01 14:32' },
      { type: 'Low battery level', details: 'Battery below 20%', timestamp: '2023-10-01 13:15' },
    ];
    setFaults(mockFaults);

    // Simulate real-time updates
    const interval = setInterval(() => {
      const newFault = {
        type: 'Inverter offline',
        details: 'Inverter disconnected from the grid',
        timestamp: new Date().toISOString(),
      };
      setFaults((prevFaults) => [...prevFaults, newFault]);
    }, 5000); // Add a new fault every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <FaultDetectionContext.Provider value={{ faults }}>
      {children}
    </FaultDetectionContext.Provider>
  );
};

export const useFaultDetection = () => useContext(FaultDetectionContext);