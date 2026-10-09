# Camera scanner behavior

The nutrition-label scanner uses the browser MediaDevices API. It requests the rear-facing camera when available and degrades gracefully when a device or browser does not support an optional capability.

## Supported interactions

- Continuous focus where the device exposes focus controls.
- Tap-to-focus feedback where supported by the active camera track.
- Pinch-to-zoom within the device-provided zoom range.
- Clear permission guidance for browsers that require explicit camera setup.

## Privacy

Images are selected or captured only after the visitor grants browser permission. Images are sent to the API only when the visitor initiates nutrition-label analysis; they are not stored by the camera UI itself.

## Compatibility

The scanner requires HTTPS (or localhost during development), `navigator.mediaDevices`, and a browser with camera access. Optional focus and zoom controls vary by device and browser, so the interface detects their availability instead of assuming they exist.

## Local verification

1. Start the frontend and API locally.
2. Use a device or browser with an available camera.
3. Grant camera permission when prompted.
4. Confirm the fallback permission guidance remains usable if permission is denied or advanced controls are unavailable.
