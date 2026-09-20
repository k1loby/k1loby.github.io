import React from "react";
import {
  AtSign,
  BookOpen,
  Folder,
  Home,
  Pencil,
  TriangleAlert,
  UserRoundPen,
  X,
} from "https://esm.sh/lucide-react@0.468.0?external=react";
import { createRoot } from "react-dom/client";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4?bundle";
import {
  Excalidraw,
} from "https://esm.sh/@excalidraw/excalidraw@0.18.1/dist/prod/index.js?external=react,react-dom";

const h = React.createElement;

const DRAW_PATH_MARKER = "/draw/";
const drawPathIndex =
  location.pathname.indexOf(DRAW_PATH_MARKER);

const SITE_BASE =
  drawPathIndex >= 0
    ? location.pathname.slice(0, drawPathIndex)
    : "";

function siteHref(path = "/") {
  const normalized =
    path.startsWith("/") ? path : `/${path}`;

  if (normalized === "/") {
    return SITE_BASE ? `${SITE_BASE}/` : "/";
  }

  return `${SITE_BASE}${normalized}`;
}


const NAME_KEY = "kilobyte-whiteboard-name";
const CLIENT_KEY = "kilobyte-whiteboard-client";
const MAX_IMAGE_SIDE = 2560;
const IMAGE_TIMEOUT = 4000;

const SUPABASE_URL =
  "https://sjvhiymmfwlyojiqgbkh.supabase.co";
const SUPABASE_KEY =
  "sb_publishable_Glwvw_g5RXIVZzSRuZKOCA_xSwRglm5";
const SUPABASE_CHANNEL =
  "kilobyte-public-whiteboard";
const SUPABASE_BUCKET =
  "whiteboard-images";

const FORCE_LOCAL =
  new URLSearchParams(location.search)
    .get("local") === "1";

const USE_SUPABASE = !FORCE_LOCAL;

let api = null;
let socket = null;
let supabase = null;
let realtimeChannel = null;
let realtimeReady = false;
let supabaseStateLoaded = !USE_SUPABASE;
let supabaseStateLoading = false;
let suppressSceneUntil = 0;
let sceneTimer = 0;
let persistTimer = 0;
let pendingInit = null;
let latestElements = [];
let latestAppState = null;
let latestFiles = {};
const savedName = localStorage.getItem(NAME_KEY);

let currentName =
  savedName ||
  `guest ${Math.floor(100 + Math.random() * 900)}`;

const clientId =
  sessionStorage.getItem(CLIENT_KEY) ||
  crypto.randomUUID();

sessionStorage.setItem(CLIENT_KEY, clientId);

const collaborators = new Map();
const knownFiles = new Set();
const compressingFiles = new Set();

let statusSetter = null;
let nameSetter = null;
let toastTimer = 0;

function showToast(message) {
  const el = document.querySelector(".board-toast");

  if (!el) {
    return;
  }

  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    el.classList.remove("is-visible");
  }, 2200);
}

function setStatus(state) {
  statusSetter?.(state);
}

function send(message) {
  const payload = {
    ...message,
    clientId,
  };

  if (USE_SUPABASE) {
    if (!realtimeChannel || !realtimeReady) {
      return false;
    }

    void realtimeChannel.send({
      type: "broadcast",
      event: message.type,
      payload,
    });

    return true;
  }

  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(payload));
  return true;
}

function versionWins(remote, local) {
  if (!local) {
    return true;
  }

  const rv = Number(remote?.version || 0);
  const lv = Number(local?.version || 0);

  if (rv !== lv) {
    return rv > lv;
  }

  return Number(remote?.versionNonce || 0) >=
    Number(local?.versionNonce || 0);
}

function mergeElements(localElements, remoteElements) {
  const localById = new Map(
    (localElements || []).map((element) => [
      element.id,
      element,
    ]),
  );

  const remoteIds = new Set();
  const merged = [];

  for (const remote of remoteElements || []) {
    remoteIds.add(remote.id);
    const local = localById.get(remote.id);

    merged.push(
      versionWins(remote, local) ? remote : local,
    );
  }

  for (const local of localElements || []) {
    if (!remoteIds.has(local.id)) {
      merged.push(local);
    }
  }

  return merged;
}

function updateCollaborators() {
  if (!api) {
    return;
  }

  api.updateScene({
    collaborators: new Map(collaborators),
  });
}

function applyScene(message) {
  if (!api) {
    pendingInit = message;
    return;
  }

  const local =
    api.getSceneElementsIncludingDeleted?.() ||
    api.getSceneElements?.() ||
    [];

  const merged = mergeElements(
    local,
    message.scene?.elements || [],
  );

  suppressSceneUntil = performance.now() + 250;

  const next = {
    elements: merged,
  };

  if (message.scene?.appState?.viewBackgroundColor) {
    next.appState = {
      viewBackgroundColor:
        message.scene.appState.viewBackgroundColor,
    };
  }

  api.updateScene(next);
}

function addFiles(files) {
  if (!api || !Array.isArray(files) || !files.length) {
    return;
  }

  for (const file of files) {
    if (file?.id) {
      knownFiles.add(file.id);
    }
  }

  try {
    api.addFiles(files);
  } catch (error) {
    showToast("one image could not be restored");
  }
}

function handleIncoming(message) {
  if (message.clientId === clientId) {
    return;
  }

  if (message.type === "init") {
    addFiles(message.files || []);
    applyScene(message);
    return;
  }

  if (message.type === "scene") {
    applyScene(message);
    return;
  }

  if (message.type === "file") {
    if (
      USE_SUPABASE &&
      message.file?.path
    ) {
      void loadSupabaseFile(
        message.file,
      ).then((file) => {
        if (file) {
          addFiles([file]);
        }
      });

      return;
    }

    addFiles([message.file]);
    return;
  }

  if (message.type === "cursor") {
    collaborators.set(message.clientId, {
      pointer: message.pointer,
      button: message.button || "up",
      username: message.username || "guest",
      selectedElementIds:
        message.selectedElementIds || {},
      isCurrentUser: false,
    });

    updateCollaborators();
    return;
  }

  if (message.type === "name") {
    const previous =
      collaborators.get(message.clientId) || {};

    collaborators.set(message.clientId, {
      ...previous,
      username: message.username || "guest",
      isCurrentUser: false,
    });

    updateCollaborators();
    return;
  }

  if (message.type === "leave") {
    collaborators.delete(message.clientId);
    updateCollaborators();
  }
}

function handleMessage(event) {
  try {
    handleIncoming(JSON.parse(event.data));
  } catch {
  }
}

async function loadSupabaseFile(meta) {
  if (!meta?.id || !meta?.path) {
    return null;
  }

  try {
    const { data } = supabase
      .storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(meta.path);

    const response = await fetch(data.publicUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const dataURL = await blobToDataURL(blob);

    return {
      id: meta.id,
      mimeType:
        meta.mimeType ||
        blob.type ||
        "application/octet-stream",
      dataURL,
      created: meta.created || Date.now(),
      lastRetrieved: Date.now(),
    };
  } catch {
    return null;
  }
}

async function loadSupabaseState() {
  if (
    !USE_SUPABASE ||
    !supabase ||
    supabaseStateLoading
  ) {
    return;
  }

  supabaseStateLoading = true;

  try {
    const { data, error } = await supabase
      .from("whiteboard_state")
      .select("scene, files")
      .eq("id", "global")
      .single();

    if (error) {
      throw error;
    }

    const metas = Object.values(
      data?.files || {},
    );

    const restored = (
      await Promise.all(
        metas.map((meta) =>
          loadSupabaseFile(meta),
        ),
      )
    ).filter(Boolean);

    addFiles(restored);

    handleIncoming({
      type: "init",
      clientId:
        "__supabase_saved_state__",
      scene: data?.scene || {
        elements: [],
        appState: {
          viewBackgroundColor:
            "#ffffff",
        },
      },
      files: restored,
    });

    supabaseStateLoaded = true;
    setStatus("online");
  } catch {
    supabaseStateLoaded = false;
    setStatus("connecting");
    showToast(
      "saved whiteboard not loaded yet, saving is paused",
    );

    setTimeout(() => {
      void loadSupabaseState();
    }, 2000);
  } finally {
    supabaseStateLoading = false;
  }
}
function syncSupabasePresence() {
  if (!realtimeChannel) {
    return;
  }

  const state = realtimeChannel.presenceState();
  const active = new Set();

  for (const presences of Object.values(state)) {
    for (const presence of presences || []) {
      const id = presence.clientId;

      if (!id || id === clientId) {
        continue;
      }

      active.add(id);

      const previous =
        collaborators.get(id) || {};

      collaborators.set(id, {
        ...previous,
        username:
          presence.username ||
          previous.username ||
          "guest",
        isCurrentUser: false,
      });
    }
  }

  for (const id of collaborators.keys()) {
    if (!active.has(id)) {
      collaborators.delete(id);
    }
  }

  updateCollaborators();
}

async function connectSupabase() {
  setStatus("connecting");

  supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY,
  );

  realtimeChannel = supabase.channel(
    SUPABASE_CHANNEL,
    {
      config: {
        broadcast: {
          self: false,
        },
        presence: {
          key: clientId,
        },
      },
    },
  );

  for (const event of [
    "scene",
    "cursor",
    "name",
    "file",
  ]) {
    realtimeChannel.on(
      "broadcast",
      { event },
      ({ payload }) => {
        handleIncoming(payload);
      },
    );
  }

  realtimeChannel.on(
    "presence",
    { event: "sync" },
    syncSupabasePresence,
  );

  realtimeChannel.subscribe(async (status) => {
    if (status === "SUBSCRIBED") {
      realtimeReady = true;
      setStatus("connecting");

      await loadSupabaseState();

      await realtimeChannel.track({
        clientId,
        username: currentName,
        onlineAt: new Date().toISOString(),
      });

      return;
    }

    if (
      status === "CHANNEL_ERROR" ||
      status === "TIMED_OUT" ||
      status === "CLOSED"
    ) {
      realtimeReady = false;
      setStatus("offline");
    }
  });
}

function connectLocal() {
  const wsPort =
    Number(location.port || 8000) + 1;

  const scheme =
    location.protocol === "https:" ? "wss:" : "ws:";

  socket = new WebSocket(
    `${scheme}//${location.hostname}:${wsPort}/`,
  );

  setStatus("connecting");

  socket.addEventListener("open", () => {
    setStatus("online");

    send({
      type: "name",
      username: currentName,
    });
  });

  socket.addEventListener("message", handleMessage);

  socket.addEventListener("close", () => {
    setStatus("offline");

    setTimeout(() => {
      connectLocal();
    }, 1500);
  });

  socket.addEventListener("error", () => {
    setStatus("offline");
  });
}

function connect() {
  if (USE_SUPABASE) {
    void connectSupabase();
    return;
  }

  connectLocal();
}

function dataUrlSize(dataURL) {
  const comma = dataURL.indexOf(",");

  if (comma < 0) {
    return dataURL.length;
  }

  const header = dataURL.slice(0, comma);
  const body = dataURL.slice(comma + 1);

  if (header.includes(";base64")) {
    return Math.floor((body.length * 3) / 4);
  }

  return body.length;
}

function loadImage(dataURL) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let done = false;

    const finish = (fn, value) => {
      if (done) {
        return;
      }

      done = true;
      clearTimeout(timer);
      fn(value);
    };

    const timer = setTimeout(() => {
      finish(reject, new Error("image timeout"));
    }, IMAGE_TIMEOUT);

    image.onload = () => finish(resolve, image);
    image.onerror = () =>
      finish(reject, new Error("image decode failed"));
    image.src = dataURL;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    let finished = false;

    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error("image encode timeout"));
      }
    }, IMAGE_TIMEOUT);

    canvas.toBlob(
      (blob) => {
        if (finished) {
          return;
        }

        finished = true;
        clearTimeout(timer);

        if (!blob) {
          reject(new Error("image encode failed"));
          return;
        }

        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function compressFile(file) {
  if (
    !file?.dataURL ||
    typeof file.dataURL !== "string"
  ) {
    return file;
  }

  const type = String(file.mimeType || "");

  if (
    type === "image/svg+xml" ||
    type === "image/gif"
  ) {
    return file;
  }

  if (!type.startsWith("image/")) {
    return file;
  }

  const image = await loadImage(file.dataURL);

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) {
    return file;
  }

  const scale = Math.min(
    1,
    MAX_IMAGE_SIDE / Math.max(width, height),
  );

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext("2d", {
    alpha: true,
  });

  if (!ctx) {
    return file;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const quality =
    Math.max(width, height) > 3200 ? 0.76 : 0.82;

  const blob = await canvasToBlob(
    canvas,
    "image/webp",
    quality,
  );

  const originalBytes = dataUrlSize(file.dataURL);

  if (blob.size >= originalBytes * 0.96) {
    return file;
  }

  const dataURL = await blobToDataURL(blob);

  return {
    ...file,
    mimeType: "image/webp",
    dataURL,
    lastRetrieved: Date.now(),
  };
}

function extensionForMime(mime) {
  return {
    "image/webp": "webp",
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  }[mime] || "bin";
}

async function storeSupabaseFile(file) {
  const mime =
    file.mimeType || "application/octet-stream";
  const extension = extensionForMime(mime);
  const path = `${file.id}.${extension}`;

  const blob = await (
    await fetch(file.dataURL)
  ).blob();

  const { error: uploadError } =
    await supabase
      .storage
      .from(SUPABASE_BUCKET)
      .upload(path, blob, {
        contentType: mime,
        cacheControl: "3600",
        upsert: true,
      });

  if (uploadError) {
    throw uploadError;
  }

  const meta = {
    id: file.id,
    mimeType: mime,
    path,
    created: file.created || Date.now(),
    lastRetrieved: Date.now(),
  };

  const { data: row, error: readError } =
    await supabase
      .from("whiteboard_state")
      .select("files")
      .eq("id", "global")
      .single();

  if (readError) {
    throw readError;
  }

  const nextFiles = {
    ...(row?.files || {}),
    [file.id]: meta,
  };

  const { error: updateError } =
    await supabase
      .from("whiteboard_state")
      .update({
        files: nextFiles,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "global");

  if (updateError) {
    throw updateError;
  }

  send({
    type: "file",
    file: meta,
  });
}

async function processFile(file) {
  if (
    !file?.id ||
    knownFiles.has(file.id) ||
    compressingFiles.has(file.id)
  ) {
    return;
  }

  compressingFiles.add(file.id);

  let result = file;

  try {
    result = await compressFile(file);

    if (result !== file) {
      showToast("image compressed");
    }
  } catch {
    showToast(
      "image compression timed out, keeping original",
    );
  }

  knownFiles.add(file.id);
  compressingFiles.delete(file.id);

  try {
    api?.addFiles([result]);
  } catch {
  }

  if (USE_SUPABASE) {
    try {
      await storeSupabaseFile(result);
    } catch {
      showToast("image could not be saved");
    }

    return;
  }

  send({
    type: "file",
    file: result,
  });
}

function processFiles(files) {
  for (const file of Object.values(files || {})) {
    void processFile(file);
  }
}

async function persistSupabaseScene(scene) {
  if (
    !supabase ||
    !supabaseStateLoaded
  ) {
    return;
  }

  const { error } = await supabase
    .from("whiteboard_state")
    .update({
      scene,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "global");

  if (error) {
    showToast("whiteboard save failed");
  }
}

function sendSceneNow() {
  clearTimeout(sceneTimer);

  if (!api) {
    return;
  }

  if (
    USE_SUPABASE &&
    !supabaseStateLoaded
  ) {
    return;
  }

  const elements =
    api.getSceneElementsIncludingDeleted?.() ||
    latestElements ||
    [];

  const appState =
    api.getAppState?.() ||
    latestAppState ||
    {};

  const scene = {
    elements,
    appState: {
      viewBackgroundColor:
        appState.viewBackgroundColor || "#ffffff",
    },
  };

  send({
    type: "scene",
    scene,
  });

  if (USE_SUPABASE) {
    clearTimeout(persistTimer);

    persistTimer = setTimeout(() => {
      void persistSupabaseScene(scene);
    }, 900);
  }
}

function onChange(elements, appState, files) {
  latestElements = elements;
  latestAppState = appState;
  latestFiles = files;

  if (
    USE_SUPABASE &&
    !supabaseStateLoaded
  ) {
    return;
  }

  processFiles(files);

  if (performance.now() < suppressSceneUntil) {
    return;
  }

  clearTimeout(sceneTimer);

  sceneTimer = setTimeout(() => {
    sendSceneNow();
  }, 320);
}

function onPointerUpdate(payload) {
  send({
    type: "cursor",
    username: currentName,
    pointer: payload.pointer,
    button: payload.button,
    selectedElementIds:
      api?.getAppState?.().selectedElementIds || {},
  });
}

function setName(value) {
  const clean =
    String(value || "")
      .replace(/\s+/g, " ")
      .slice(0, 28) || "guest";

  currentName = clean;
  localStorage.setItem(NAME_KEY, clean);
  nameSetter?.(clean);

  send({
    type: "name",
    username: clean,
  });

  if (USE_SUPABASE && realtimeChannel) {
    void realtimeChannel.track({
      clientId,
      username: clean,
      onlineAt: new Date().toISOString(),
    });
  }
}

class BoardBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      error,
    };
  }

  render() {
    if (this.state.error) {
      return h(
        "div",
        {
          className: "board-error",
        },
        h(
          "div",
          {
            className: "board-error-card",
          },
          h("h2", null, "whiteboard hiccup"),
          h(
            "p",
            null,
            "the page is still alive. reload the canvas and the saved board will come back.",
          ),
          h(
            "button",
            {
              onClick: () => location.reload(),
            },
            "reload canvas",
          ),
        ),
      );
    }

    return this.props.children;
  }
}

function Panel() {
  const firstVisit = !savedName;

  const [name, updateName] =
    React.useState(currentName);

  const [draftName, setDraftName] =
    React.useState(currentName);

  const [status, updateStatus] =
    React.useState("connecting");

  const [dialogOpen, setDialogOpen] =
    React.useState(false);

  const [warningOpen, setWarningOpen] =
    React.useState(true);

  const [drawerOpen, setDrawerOpen] =
    React.useState(false);

  React.useEffect(() => {
    statusSetter = updateStatus;
    nameSetter = (nextName) => {
      updateName(nextName);
      setDraftName(nextName);
    };

    return () => {
      statusSetter = null;
      nameSetter = null;
    };
  }, []);

  function saveDraft(event) {
    event?.preventDefault?.();

    setName(draftName);
    setDialogOpen(false);
  }

  function icon(name) {
    const icons = {
      home: Home,
      projects: Folder,
      blog: BookOpen,
      badges: Pencil,
      socials: AtSign,
      whiteboard: Pencil,
      rename: UserRoundPen,
      close: X,
      warning: TriangleAlert,
    };

    const Icon = icons[name] || Pencil;

    return h(Icon, {
      size: 22,
      strokeWidth: 1.9,
      "aria-hidden": "true",
    });
  }

  function navItem(href, label, iconName) {
    return h(
      "a",
      {
        href,
        className: "board-drawer-item",
      },
      h(
        "span",
        {
          className: "board-drawer-icon",
          "aria-hidden": "true",
        },
        icon(iconName),
      ),
      h(
        "span",
        {
          className: "board-drawer-label",
        },
        label,
      ),
    );
  }

  return h(
    React.Fragment,
    null,

    h(
      "button",
      {
        type: "button",
        className: "board-site-button",
        onClick: () => setDrawerOpen(true),
        "aria-label": "open site navigation",
        "aria-expanded": drawerOpen ? "true" : "false",
      },
      h(
        "svg",
        {
          viewBox: "0 0 24 24",
          "aria-hidden": "true",
        },
        h("path", {
          d: "M4 7h16M4 12h16M4 17h16",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
        }),
      ),
      h("span", null, "site"),
    ),

    drawerOpen
      ? h(
          React.Fragment,
          null,
          h("div", {
            className: "board-drawer-scrim",
            onClick: () => setDrawerOpen(false),
          }),
          h(
            "aside",
            {
              className: "board-drawer",
              "aria-label": "site navigation",
            },
            h(
              "div",
              {
                className: "board-drawer-head",
              },
              h(
                "div",
                null,
                h(
                  "strong",
                  null,
                  "public whiteboard",
                ),
                h(
                  "span",
                  {
                    className: "board-drawer-status",
                    "data-state": status,
                  },
                  h("span", {
                    className: "board-dot",
                    "aria-hidden": "true",
                  }),
                  name,
                ),
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "board-drawer-close",
                  onClick: () => setDrawerOpen(false),
                  "aria-label": "close navigation",
                },
                icon("close"),
              ),
            ),

            h(
              "nav",
              {
                className: "board-drawer-nav",
              },
              navItem(siteHref("/"), "home", "home"),
              navItem(siteHref("/projects/"), "projects", "projects"),
              navItem(siteHref("/blog/"), "blog", "blog"),
              navItem(siteHref("/badges/"), "badges", "badges"),
              navItem(siteHref("/socials/"), "socials", "socials"),
              h(
                "div",
                {
                  className:
                    "board-drawer-item board-drawer-item-current",
                },
                h(
                  "span",
                  {
                    className: "board-drawer-icon",
                    "aria-hidden": "true",
                  },
                  icon("whiteboard"),
                ),
                h(
                  "span",
                  {
                    className: "board-drawer-label",
                  },
                  "whiteboard",
                ),
              ),
            ),

            h(
              "div",
              {
                className: "board-drawer-footer",
              },
              h(
                "button",
                {
                  type: "button",
                  className: "board-drawer-rename",
                  onClick: () => {
                    setDraftName(name);
                    setDrawerOpen(false);
                    setDialogOpen(true);
                  },
                },
                h(
                  "span",
                  {
                    className: "board-rename-icon",
                    "aria-hidden": "true",
                  },
                  icon("rename"),
                ),
                "change name",
              ),
            ),
          ),
        )
      : null,


    warningOpen
      ? h(
          "div",
          {
            className: "board-warning-scrim",
            role: "presentation",
          },
          h(
            "div",
            {
              className: "board-warning-dialog",
              role: "alertdialog",
              "aria-modal": "true",
              "aria-labelledby": "board-warning-title",
              "aria-describedby": "board-warning-copy",
            },
            h(
              "div",
              {
                className: "board-warning-icon",
                "aria-hidden": "true",
              },
              icon("warning"),
            ),
            h(
              "h2",
              {
                id: "board-warning-title",
              },
              "public whiteboard",
            ),
            h(
              "p",
              {
                id: "board-warning-copy",
              },
              "this is one public board shared with everyone. anything you draw or upload is visible to everyone and stays saved after you leave. other people can write or draw anything, including swearing or offensive content. avoid personal or private information.",
            ),
            h(
              "div",
              {
                className: "board-warning-actions",
              },
              h(
                "button",
                {
                  type: "button",
                  className: "board-text-button",
                  onClick: () => {
                    location.href = siteHref("/");
                  },
                },
                "leave",
              ),
              h(
                "button",
                {
                  type: "button",
                  className: "board-filled-button",
                  onClick: () => {
                    setWarningOpen(false);

                    if (firstVisit) {
                      setDialogOpen(true);
                    }
                  },
                },
                "continue",
              ),
            ),
          ),
        )
      : null,

    dialogOpen
      ? h(
          "div",
          {
            className: "board-dialog-scrim",
            role: "presentation",
            onMouseDown: (event) => {
              if (
                !firstVisit &&
                event.target === event.currentTarget
              ) {
                setDialogOpen(false);
              }
            },
          },
          h(
            "form",
            {
              className: "board-dialog",
              role: "dialog",
              "aria-modal": "true",
              "aria-labelledby": "board-name-title",
              onSubmit: saveDraft,
            },
            h(
              "div",
              {
                className: "board-dialog-icon",
                "aria-hidden": "true",
              },
              "☺",
            ),
            h(
              "h2",
              {
                id: "board-name-title",
              },
              "what should people call you?",
            ),
            h(
              "p",
              null,
              "this name appears beside your live cursor.",
            ),
            h(
              "label",
              {
                className: "board-field",
              },
              h(
                "span",
                {
                  className: "board-field-label",
                },
                "display name",
              ),
              h("input", {
                autoFocus: true,
                value: draftName,
                maxLength: 28,
                enterKeyHint: "done",
                autoComplete: "nickname",
                onChange: (event) => {
                  setDraftName(event.target.value);
                },
              }),
            ),
            h(
              "div",
              {
                className: "board-dialog-actions",
              },
              !firstVisit
                ? h(
                    "button",
                    {
                      type: "button",
                      className: "board-text-button",
                      onClick: () =>
                        setDialogOpen(false),
                    },
                    "cancel",
                  )
                : null,
              h(
                "button",
                {
                  type: "submit",
                  className: "board-filled-button",
                },
                firstVisit ? "continue" : "save",
              ),
            ),
          ),
        )
      : null,
  );
}

function Board() {
  React.useEffect(() => {
    connect();

    const flush = () => {
      if (
        USE_SUPABASE &&
        !supabaseStateLoaded
      ) {
        return;
      }

      sendSceneNow();
    };

    window.addEventListener("pagehide", flush);

    return () => {
      window.removeEventListener(
        "pagehide",
        flush,
      );

      socket?.close();

      if (realtimeChannel && supabase) {
        void supabase.removeChannel(
          realtimeChannel,
        );
      }
    };
  }, []);

  return h(
    "div",
    {
      className: "board-app",
    },
    h(
      "div",
      {
        className: "board-editor",
      },
      h(
        BoardBoundary,
        null,
        h(Excalidraw, {
          excalidrawAPI: (instance) => {
            api = instance;

            if (pendingInit) {
              const init = pendingInit;
              pendingInit = null;
              addFiles(init.files || []);
              applyScene(init);
            }
          },
          onChange,
          onPointerUpdate,
          isCollaborating: true,
          handleKeyboardGlobally: true,
        }),
      ),
    ),
    h(Panel),
    h("div", {
      className: "board-toast",
      role: "status",
      "aria-live": "polite",
    }),
  );
}

createRoot(
  document.getElementById("root"),
).render(h(Board));
