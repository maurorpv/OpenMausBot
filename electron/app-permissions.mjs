// Permission policy for the main application window. The local UI needs a
// small set of capabilities to function: audio media (microphone for voice
// input and skill demonstrations), notifications, and clipboard access.
//
// Privileged capabilities — camera/video, geolocation, USB, HID, serial,
// MIDI, screen capture, window management, local fonts — stay off: the app
// does not use them, and granting them unconditionally to the renderer leaves
// host sensors and devices exposed if an untrusted payload ever executes.
// The allow-list also applies only to the verified renderer origin; any
// opaque or cross-origin request is refused outright.

const ALLOWED_APP_PERMISSIONS = new Set([
  "notifications",
  "clipboard-read",
  "clipboard-sanitized-write",
  "fullscreen",
]);

// Opaque origins (data:, about:blank, javascript:) serialise as the string
// "null"; never let two of them match each other.
function webOrigin(value) {
  if (Object.prototype.toString.call(value) !== "[object String]") return null;
  try {
    const origin = new URL(value).origin;
    return origin === "null" ? null : origin;
  } catch {
    return null;
  }
}

/**
 * Decide whether a requested Chromium permission should be granted for the main app window.
 *
 * @param {string} permission The Electron/Chromium permission name
 * @param {string} requestingUrlOrOrigin The URL or origin requesting the permission
 * @param {string} rendererOrigin The trusted local renderer origin
 * @param {{ mediaTypes?: string[], mediaType?: string }} [details] Optional request details
 * @returns {boolean} True if the permission should be granted, false otherwise
 */
export function appPermissionAllowed(permission, requestingUrlOrOrigin, rendererOrigin, details = {}) {
  const requesting = webOrigin(requestingUrlOrOrigin);
  const allowed = webOrigin(rendererOrigin);
  if (!requesting || !allowed || requesting !== allowed) return false;

  // Media: audio (microphone) is permitted; video (camera/webcam) is strictly denied.
  // Electron 43 routes getDisplayMedia through permission="media" with mediaTypes: []
  // before selecting display media. Allowing this preserves the guarded displayMediaGuard
  // without granting webcam access.
  if (permission === "media") {
    if (details?.mediaType === "video" || details?.mediaType === "unknown") return false;
    if (details?.mediaType === "audio") return true;

    if (Array.isArray(details?.mediaTypes)) {
      if (details.mediaTypes.includes("video")) return false;
      // Empty mediaTypes is Electron getDisplayMedia routing; ["audio"] is microphone capture.
      return details.mediaTypes.length === 0 || details.mediaTypes.includes("audio");
    }

    return false;
  }

  return ALLOWED_APP_PERMISSIONS.has(permission);
}
