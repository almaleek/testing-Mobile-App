import * as Updates from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';

interface AppUpdateState {
  visible: boolean;
  downloading: boolean;
  error: boolean;
}

export function useAppUpdates() {
  const [state, setState] = useState<AppUpdateState>({
    visible: false,
    downloading: false,
    error: false,
  });

  const checkForUpdate = useCallback(async () => {
    // Expo Go and local development builds do not have an OTA update
    // channel, so checking here would only create noisy errors.
    if (!Updates.isEnabled) return;

    try {
      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setState({ visible: true, downloading: false, error: false });
      }
    } catch {
      // Update checks are non-critical. The current app remains usable.
    }
  }, []);

  useEffect(() => {
    void checkForUpdate();
  }, [checkForUpdate]);

  const installUpdate = async () => {
    setState((current) => ({ ...current, downloading: true, error: false }));
    try {
      const result = await Updates.fetchUpdateAsync();
      if (result.isNew) {
        await Updates.reloadAsync();
        return;
      }
      setState({ visible: false, downloading: false, error: false });
    } catch {
      setState({ visible: true, downloading: false, error: true });
    }
  };

  const dismissUpdate = () => {
    if (!state.downloading) {
      setState({ visible: false, downloading: false, error: false });
    }
  };

  return {
    ...state,
    installUpdate,
    dismissUpdate,
    checkForUpdate,
  };
}