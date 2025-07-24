import React, { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    // Load from localStorage on mount
    const storedPlan = localStorage.getItem('selectedPlan');
    if (storedPlan) setSelectedPlan(JSON.parse(storedPlan));
  }, []);

  const selectPlan = (plan) => {
    setSelectedPlan(plan);
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
  };

  return (
    <SubscriptionContext.Provider value={{ selectedPlan, selectPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
