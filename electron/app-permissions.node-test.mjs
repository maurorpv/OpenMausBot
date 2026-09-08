import assert from "node:assert/strict";
import test from "node:test";

import { appPermissionAllowed } from "./app-permissions.mjs";

const LOCAL_ORIGIN = "http://127.0.0.1:5199";
const LOCAL_PAGE = "http://127.0.0.1:5199/chat?botId=bot-1";

test("grants notifications, clipboard, and fullscreen to the local renderer page", () => {
  for (const permission of ["notifications", "clipboard-read", "clipboard-sanitized-write", "fullscreen"]) {
    assert.equal(appPermissionAllowed(permission, LOCAL_PAGE, LOCAL_ORIGIN), true, permission);
  }
});

test("accepts a bare origin or a full URL on either side", () => {
  assert.equal(appPermissionAllowed("notifications", LOCAL_ORIGIN, LOCAL_ORIGIN), true);
  assert.equal(appPermissionAllowed("notifications", `${LOCAL_ORIGIN}/settings#voice`, `${LOCAL_ORIGIN}/`), true);
  assert.equal(appPermissionAllowed("fullscreen", "http://127.0.0.1:8799/chat", "http://127.0.0.1:8799"), true);
});

test("allows media for audio (microphone) and guarded display-capture, denies video (camera)", () => {
  // Audio only: allowed
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaTypes: ["audio"] }), true);
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaType: "audio" }), true);

  // Guarded display-capture path: Electron 43 routes getDisplayMedia through permission="media"
  // with an empty mediaTypes array before dispatching to setDisplayMediaRequestHandler
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaTypes: [] }), true);

  // Video / camera: strictly denied
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaTypes: ["video"] }), false);
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaTypes: ["audio", "video"] }), false);
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaType: "video" }), false);

  // Unknown or omitted details: fail closed
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, { mediaType: "unknown" }), false);
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN, {}), false);
  assert.equal(appPermissionAllowed("media", LOCAL_PAGE, LOCAL_ORIGIN), false);
});

test("refuses permissions to any other origin", () => {
  assert.equal(appPermissionAllowed("notifications", "https://other.example/chat", LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("clipboard-read", "http://127.0.0.1:5200/", LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("media", "https://127.0.0.1:5199/", LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("fullscreen", "http://localhost:5199/", LOCAL_ORIGIN), false);
});

test("keeps every privileged capability off even for the local renderer page", () => {
  const privileged = [
    "geolocation", "camera", "usb", "hid", "serial", "midi", "midiSysex",
    "display-capture", "fileSystem", "openExternal", "idle-detection", "speaker-selection",
    "window-management", "storage-access", "top-level-storage-access", "pointerLock",
    "keyboardLock", "mediaKeySystem", "unknown",
  ];
  for (const permission of privileged) {
    assert.equal(appPermissionAllowed(permission, LOCAL_PAGE, LOCAL_ORIGIN), false, permission);
  }
  assert.equal(appPermissionAllowed(undefined, LOCAL_PAGE, LOCAL_ORIGIN), false);
});

test("fails closed on unparsable or opaque origins", () => {
  assert.equal(appPermissionAllowed("notifications", "not a url", LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("notifications", "", LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("notifications", undefined, LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("notifications", null, LOCAL_ORIGIN), false);
  assert.equal(appPermissionAllowed("notifications", LOCAL_PAGE, "not a url"), false);
  assert.equal(appPermissionAllowed("notifications", LOCAL_PAGE, undefined), false);
  // Opaque origins all serialise as "null"; two of them must never match.
  assert.equal(appPermissionAllowed("notifications", "data:text/html,x", "about:blank"), false);
  assert.equal(appPermissionAllowed("notifications", "javascript:alert(1)", LOCAL_ORIGIN), false);
});
