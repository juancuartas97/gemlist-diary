import { useState, useCallback } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: { lat: number; lng: number } | null;
  permissionDenied: boolean;
}

interface VerificationResult {
  verified: boolean;
  distance?: number;
  reason?: string;
  lat: number;
  lng: number;
}

const VERIFICATION_RADIUS_METERS = 500;

/**
 * Calculate distance between two GPS points using Haversine formula
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Check if the current time falls within an event's time window
 */
function isWithinEventWindow(
  startAt: string | null,
  endAt: string | null
): boolean {
  const now = new Date();
  
  if (!startAt) return false;
  
  const start = new Date(startAt);
  // Allow 2 hours before event start
  const windowStart = new Date(start.getTime() - 2 * 60 * 60 * 1000);
  
  if (endAt) {
    const end = new Date(endAt);
    // Allow 1 hour after event end
    const windowEnd = new Date(end.getTime() + 1 * 60 * 60 * 1000);
    return now >= windowStart && now <= windowEnd;
  }
  
  // If no end time, allow within 12 hours of start
  const windowEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000);
  return now >= windowStart && now <= windowEnd;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
    permissionDenied: false,
  });

  const requestPosition = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser';
        setState(prev => ({ ...prev, loading: false, error: err }));
        reject(new Error(err));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setState({ loading: false, error: null, position, permissionDenied: false });
          resolve(position);
        },
        (err) => {
          const permissionDenied = err.code === err.PERMISSION_DENIED;
          const errorMsg = permissionDenied
            ? 'Location access denied. Please enable location in your browser settings.'
            : 'Unable to get your location. Please try again.';
          setState({ loading: false, error: errorMsg, position: null, permissionDenied });
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000, // Accept cached position up to 30 seconds old
        }
      );
    });
  }, []);

  /**
   * Verify that the user is at the venue and within the event time window.
   */
  const verifyLocation = useCallback(async (
    venueLat: number | null,
    venueLng: number | null,
    eventStartAt: string | null,
    eventEndAt: string | null
  ): Promise<VerificationResult> => {
    const position = await requestPosition();

    // Check time window
    if (eventStartAt && !isWithinEventWindow(eventStartAt, eventEndAt)) {
      return {
        verified: false,
        lat: position.lat,
        lng: position.lng,
        reason: 'This event is not currently happening. Live mining is only available during the event.',
      };
    }

    // Check proximity to venue
    if (venueLat != null && venueLng != null) {
      const distance = haversineDistance(position.lat, position.lng, venueLat, venueLng);
      if (distance > VERIFICATION_RADIUS_METERS) {
        return {
          verified: false,
          distance: Math.round(distance),
          lat: position.lat,
          lng: position.lng,
          reason: `You're ${Math.round(distance)}m from the venue. Live mining requires being within ${VERIFICATION_RADIUS_METERS}m.`,
        };
      }
      return { verified: true, distance: Math.round(distance), lat: position.lat, lng: position.lng };
    }

    // No venue coordinates available — allow with just location capture
    return {
      verified: true,
      lat: position.lat,
      lng: position.lng,
      reason: 'Venue location not available for precision check, but your location was captured.',
    };
  }, [requestPosition]);

  return {
    ...state,
    requestPosition,
    verifyLocation,
  };
}
