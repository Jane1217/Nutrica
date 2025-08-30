import { useState, useEffect } from 'react';
import { getCurrentUser, getAuthToken } from '../../../utils';
import { collectionApi } from '../../../utils';

export const useCollectionData = (collectionType) => {
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = await getCurrentUser();
        if (!user) {
          setError('User not authenticated');
          return;
        }

        const token = await getAuthToken();
        if (!token) {
          setError('No authentication token available');
          return;
        }

        const response = await collectionApi.getUserCollections(collectionType, token);
        
        if (response.success && response.data) {
          setCollectionData(response.data);
        } else {
          setError('Failed to load collection data');
        }
      } catch (error) {
        console.error('Error fetching collection data:', error);
        setError('Failed to load collection data');
      } finally {
        setLoading(false);
      }
    };

    if (collectionType) {
      fetchCollectionData();
    }
  }, [collectionType]);

  return { collectionData, loading, error };
}; 