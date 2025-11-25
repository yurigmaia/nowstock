import { useContext } from 'react';
import { RfidContext } from '../context/RfidContext';

export const useRfid = () => {
  const context = useContext(RfidContext);
  if (!context) {
    throw new Error('useRfid must be used within an RfidProvider');
  }
  return context;
};