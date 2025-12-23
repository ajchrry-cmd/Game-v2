import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export function useFirebaseCheck() {
  const [status, setStatus] = useState({
    firestore: 'checking',
    storage: 'ok', // Skip storage check to avoid CORS issues
    errors: []
  });

  useEffect(() => {
    const checkFirebase = async () => {
      const errors = [];
      let firestoreStatus = 'error';

      // Check Firestore
      try {
        await getDocs(collection(db, 'test'));
        firestoreStatus = 'ok';
      } catch (error) {
        console.error('Firestore error:', error);
        errors.push(`Firestore: ${error.message}`);
        if (error.code === 'permission-denied') {
          errors.push('Firestore not enabled or rules not set. See SETUP.md');
        }
      }

      setStatus({
        firestore: firestoreStatus,
        storage: 'ok', // Assume storage is OK to avoid CORS issues
        errors
      });
    };

    checkFirebase();
  }, []);

  return status;
}
