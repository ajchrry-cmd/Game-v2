import { useEffect, useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import { ref, listAll } from 'firebase/storage';

export function useFirebaseCheck() {
  const [status, setStatus] = useState({
    firestore: 'checking',
    storage: 'checking',
    errors: []
  });

  useEffect(() => {
    const checkFirebase = async () => {
      const errors = [];
      let firestoreStatus = 'error';
      let storageStatus = 'error';

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

      // Check Storage
      try {
        const storageRef = ref(storage, '/');
        await listAll(storageRef);
        storageStatus = 'ok';
      } catch (error) {
        console.error('Storage error:', error);
        errors.push(`Storage: ${error.message}`);
        if (error.code === 'storage/unauthorized') {
          errors.push('Storage not enabled or rules not set. See SETUP.md');
        }
      }

      setStatus({
        firestore: firestoreStatus,
        storage: storageStatus,
        errors
      });
    };

    checkFirebase();
  }, []);

  return status;
}
