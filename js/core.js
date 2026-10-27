/* Anuma merchant demo — core: router, store, UI helpers, shell. No build step, no backend. */
(function () {
  const DM = (window.DM = { pages: [], seed: {}, S: {}, ui: {}, acts: {}, inputs: {}, ucs: {}, searchProviders: [], afterHooks: [] });

  /* ───────── icons (lucide paths) ───────── */
  const P = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    handshake: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a3 3 0 0 0-4.2 0l-.9.9a2 2 0 0 1-2.8 0l-1-1a2 2 0 0 1 0-2.8L10 2.8"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
    sheet: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    workflow: '<rect x="3" y="3" width="8" height="8" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect x="13" y="13" width="8" height="8" rx="2"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    blocks: '<rect x="14" y="3" width="7" height="7" rx="1"/><path d="M10 21V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1H3"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>', chevL: '<path d="m15 18-6-6 6-6"/>', chevD: '<path d="m6 9 6 6 6-6"/>', chevU: '<path d="m18 15-6-6-6 6"/>',
    arrowR: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>', arrowL: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>', arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>', arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>', pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
    rotate: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    skipF: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>', skipB: '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
    filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    paperclip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    sparkle: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    edit: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/>',
    map: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    layout: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>',
    percent: '<line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    rupee: '<path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3"/><path d="M9 13c6.667 0 6.667-10 0-10"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    sidebar: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/>',
    palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
    ext: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>',
  };
  DM.icons = P;
  DM.icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || P.info}</svg>`;
  const I = DM.icon;

  /* ───────── helpers ───────── */
  DM.esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const esc = DM.esc;
  DM.fmt = {
    inr: (n) => (n == null ? '—' : '₹' + Math.round(n).toLocaleString('en-IN')),
    inrc: (n) => (n >= 1e7 ? '₹' + (n / 1e7).toFixed(2).replace(/\.?0+$/, '') + ' Cr' : n >= 1e5 ? '₹' + (n / 1e5).toFixed(2).replace(/\.?0+$/, '') + ' L' : n >= 1e3 ? '₹' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' : '₹' + Math.round(n)),
    num: (n) => Number(n).toLocaleString('en-IN'),
    date: (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); },
    dt: (d) => { const x = new Date(d); return isNaN(x) ? d : x.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }); },
    ago: (d) => { const m = Math.round((Date.now() - new Date(d)) / 60000); return m < 1 ? 'now' : m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; },
    pct: (n) => Math.round(n) + '%',
  };
  const COLORS = ['#2563eb', '#0d9488', '#d97706', '#7c3aed', '#db2777', '#059669', '#dc2626', '#4f46e5', '#0891b2', '#ca8a04'];
  DM.color = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return COLORS[h % COLORS.length]; };
  DM.initials = (s) => String(s || '?').replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const ORG_RE = /\b(pvt|ltd|llp|enterprises?|traders?|works|textiles?|furnishings?|decor|stores?|mart|hub|electricals?|projects?|solutions|handlooms|designs?|industries|infra|builders|cables|agency|agencies|corp|company|house|collections?|exports?|international|mattresses|sons|bros|and|&|nx|c&c)\b|\d/i;
  const FEM = /^(priya|simran|pooja|anita|sunita|kavita|neha|meera|sneha|divya|anjali|rekha|sheetla|sheetal|seema|geeta|radha|lakshmi|pallavi|arpita|swati|shruti|nisha|ritu|jaya|deepa|shweta|komal|payal|manisha|usha|asha|kiran|mamta|rina|sarika|tina|varsha|vidya|zoya|aisha|fatima|chinmayi|mani)/i;
  DM.isOrg = (n) => ORG_RE.test(String(n || ''));
  DM.photoUrl = (name) => { let h = 7; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0; const first = String(name).trim().split(/\s+/)[0]; const g = FEM.test(first) || (!/^(rahul|amit|vijay|ramesh|suresh|mahesh|pankaj|neil|ankit)/i.test(first) && /[ai]$/i.test(first) && !/(ji|ti|ni)$/i.test(first) ? false : false) ? 'women' : (FEM.test(first) ? 'women' : (h % 5 === 0 ? 'women' : 'men')); return `https://randomuser.me/api/portraits/${g}/${h % 90}.jpg`; };
  // Rounded-square avatar (live uses 24px/8px-radius photos). Orgs/numbers get initials tiles. Falls back to initials if the photo fails.
  DM.avatar = (name, cls = '', o = {}) => { const nm = String(name || '?'); const org = o.org ?? (DM.isOrg(nm) || /^\+?\d/.test(nm)); const bg = DM.color(nm); const img = org || o.noPhoto ? '' : `<img src="${DM.photoUrl(nm)}" alt="" loading="lazy" onerror="this.remove()">`; return `<span class="avatar ${cls}" style="background:${org ? bg : '#e5e5e5'};color:${org ? '#fff' : '#525252'}">${esc(DM.initials(nm))}${img}</span>`; };
  DM.badge = (t, tone = '', dot) => `<span class="badge ${tone}">${dot ? '<i class="d"></i>' : ''}${esc(t)}</span>`;
  DM.uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 8);
  DM.clone = (o) => JSON.parse(JSON.stringify(o));
  DM.by = (arr, id, key = 'id') => (arr || []).find((x) => x[key] === id);
  DM.btn = (label, act, o = {}) => `<button class="btn ${o.cls || ''}" ${act ? `data-act="${act}"` : ''} ${o.arg != null ? `data-arg="${esc(o.arg)}"` : ''} ${o.go ? `data-go="${o.go}"` : ''} ${o.attrs || ''}>${o.icon ? I(o.icon) : ''}${label ? esc(label) : ''}</button>`;
  DM.header = (title, sub, actions = '') => `<div class="ph"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="acts">${actions}</div></div>`;
  DM.stat = (label, value, sub, o = {}) => `<div class="card stat"><div class="l">${o.icon ? I(o.icon) : ''}${esc(label)}</div><div class="v">${value}</div>${sub ? `<div class="s ${o.tone || 'muted'}">${sub}</div>` : ''}</div>`;
  DM.tabs = (items, cur, act = 'tab') => `<div class="tabs">${items.map((t) => { const k = t.key ?? t; const l = t.label ?? t; return `<button class="tab ${k === cur ? 'on' : ''}" data-act="${act}" data-arg="${esc(k)}">${esc(l)}${t.count != null ? ` <span class="badge">${t.count}</span>` : ''}</button>`; }).join('')}</div>`;
  DM.pills = (items, cur, act = 'pill') => `<div class="pills">${items.map((t) => { const k = t.key ?? t; const l = t.label ?? t; return `<button class="pill ${k === cur ? 'on' : ''}" data-act="${act}" data-arg="${esc(k)}">${esc(l)}</button>`; }).join('')}</div>`;
  DM.switch = (on, act, arg) => `<button class="switch ${on ? 'on' : ''}" data-act="${act}" data-arg="${esc(arg ?? '')}" role="switch" aria-checked="${!!on}"></button>`;
  DM.searchBox = (id, ph = 'Search…', val = '') => `<div class="search">${I('search')}<input class="input" data-input="${id}" placeholder="${esc(ph)}" value="${esc(val)}"></div>`;
  // table(cols:[{k,label,num,render(row),w,flex}], rows, {go,click,idKey,rowCls,empty,height,pageSize,bar,noPager})
  // Backed by AG Grid Community (quartz theme restyled in css/app.css). Mounted after render by the afterHook below.
  DM._grids = []; DM._gridApis = [];
  const stripHtml = (h) => String(h == null ? '' : h).replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  DM.table = (cols, rows, o = {}) => {
    if (!rows.length) return `<div class="card"><div class="empty">${esc(o.empty || 'Nothing here yet.')}</div></div>`;
    const id = DM._grids.length; DM._grids.push({ cols, rows, o });
    const n = rows.length; const pager = !o.noPager && n > (o.pageSize || 25);
    const h = o.height || (pager ? null : 41 + n * 40 + 2);
    return `<div class="dmgrid ag-theme-quartz" data-gid="${id}" style="${pager ? 'height:' + (o.height || 'calc(100vh - ' + (o.offset || 330) + 'px)') + ';min-height:320px' : 'height:' + h + 'px'}"></div>`;
  };
  DM.mountGrids = (root) => {
    DM._gridApis.forEach((a) => { try { a.destroy(); } catch (e) {} }); DM._gridApis = [];
    if (!window.agGrid) { root.querySelectorAll('.dmgrid').forEach((el) => { const g = DM._grids[+el.dataset.gid]; if (g) el.outerHTML = `<div class="tblwrap"><table class="tbl"><thead><tr>${g.cols.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${g.rows.slice(0, 200).map((r) => `<tr>${g.cols.map((c) => `<td>${c.render ? c.render(r) : esc(r[c.k] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }); return; }
    root.querySelectorAll('.dmgrid').forEach((el) => {
      const g = DM._grids[+el.dataset.gid]; if (!g) return; const { cols, rows, o } = g;
      const pager = !o.noPager && rows.length > (o.pageSize || 25);
      const api = agGrid.createGrid(el, {
        rowData: rows, headerHeight: 40, rowHeight: 40, suppressCellFocus: true, animateRows: false,
        domLayout: pager ? 'normal' : 'autoHeight', pagination: pager, paginationPageSize: o.pageSize || 25, paginationPageSizeSelector: pager ? [10, 25, 50, 100] : false,
        defaultColDef: { sortable: true, resizable: true, filter: true, suppressHeaderMenuButton: false, minWidth: 70 },
        columnDefs: cols.map((c) => ({ headerName: c.label, field: c.k, colId: c.k || c.label, type: c.num ? 'rightAligned' : undefined, width: c.w ? parseInt(c.w) : undefined, flex: c.w ? undefined : (c.flex || 1), minWidth: c.w ? parseInt(c.w) : 110,
          valueGetter: c.k && !c.render ? undefined : (p) => (c.render ? stripHtml(c.render(p.data)) : p.data[c.k]), cellRenderer: c.render ? (p) => { const d = document.createElement('div'); d.className = 'agc'; d.innerHTML = c.render(p.data); return d; } : undefined, comparator: c.num ? (a, b) => parseFloat(String(a).replace(/[^0-9.-]/g, '')) - parseFloat(String(b).replace(/[^0-9.-]/g, '')) : undefined })),
        rowClassRules: o.rowCls ? { x: (p) => false } : undefined, getRowClass: o.rowCls ? (p) => o.rowCls(p.data) : undefined,
        onRowClicked: (e) => { if (e.event && e.event.target.closest('button,a,input,select')) return; if (o.go) DM.go(o.go(e.data)); else if (o.click && DM.acts[o.click]) DM.acts[o.click]({ dataset: { arg: e.data[o.idKey || 'id'] }, tagName: 'DIV' }, e.event); },
        onGridReady: () => {},
      });
      DM._gridApis.push(api);
    });
  };
  DM.afterHooks.push((root) => DM.mountGrids(root));
  // toolbar helper used by data pages: left = view label / segmented, right = columns + search
  DM.toolbar = (left = '', right = '') => `<div class="toolbar"><div class="row gap12">${left}</div><div class="row gap12 right">${right}</div></div>`;
  DM.colsBtn = (n = 0) => `<button class="btn outline sm" data-act="cols-menu">${I('columns')} Columns${n ? ' · ' + n + ' off' : ''}</button>`;
  DM.viewBtn = (label) => `<button class="btn outline sm" data-act="view-menu">${I('grid')} ${esc(label)} ${I('chevD')}</button>`;
  DM.icoTile = (name, cls = '') => `<span class="icotile ${cls}">${I(name)}</span>`;
  DM.mono = (t) => `<span class="monotag">${esc(t)}</span>`;
  DM.status = (label, tone = 'green') => `<span class="stat-badge ${tone}"><i></i>${esc(label)}</span>`;
  DM.empty = (icon, title, sub) => `<div class="empty-card"><span class="icotile lg">${I(icon)}</span><div class="b" style="margin-top:10px">${esc(title)}</div><div class="muted sm" style="margin-top:2px">${esc(sub || '')}</div></div>`;
  DM.statCard = (label, value, sub, icon, o = {}) => `<div class="card statc"><div class="statc-h"><span class="grow">${esc(label)}</span>${icon ? `<span class="icotile">${I(icon)}</span>` : ''}</div><div class="statc-d"></div><div class="statc-v mono">${value}</div>${sub != null ? `<div class="statc-s ${o.tone || ''}">${sub}</div>` : ''}</div>`;
  DM.seg = (items, cur, act) => `<div class="pills">${items.map((t) => { const k = t.key ?? t; const l = t.label ?? t; return `<button class="pill ${k === cur ? 'on' : ''}" data-act="${act}" data-arg="${esc(k)}">${t.icon ? I(t.icon) : ''}${esc(l)}${t.count != null ? ` <span class="cnt-chip">${t.count}</span>` : ''}</button>`; }).join('')}</div>`;

  /* ───────── tiny SVG charts ───────── */
  DM.chart = {
    spark(vals, { w = 160, h = 40, color = 'var(--chart-2)', fill = true } = {}) {
      if (!vals.length) return `<svg width="100%" viewBox="0 0 ${w} ${h}"></svg>`;
      const mx = Math.max(...vals, 1), mn = Math.min(...vals, 0), r = mx - mn || 1;
      const pts = vals.map((v, i) => [vals.length === 1 ? w / 2 : (i / (vals.length - 1)) * (w - 4) + 2, h - 3 - ((v - mn) / r) * (h - 8)]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      return `<svg width="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${fill ? `<path d="${d} L${pts.at(-1)[0]} ${h} L${pts[0][0]} ${h}Z" fill="${color}" opacity=".12"/>` : ''}<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="2.6" fill="${color}"/></svg>`;
    },
    bars(items, { w = 300, h = 120, color = 'var(--chart-1)', top = 'var(--chart-2)', fmt = (v) => v } = {}) {
      const mx = Math.max(...items.map((i) => i.v), 1), bw = w / items.length;
      const mi = items.reduce((a, b, i) => (b.v > items[a].v ? i : a), 0);
      return `<svg width="100%" viewBox="0 0 ${w} ${h + 18}">${items.map((it, i) => { const bh = Math.max(2, (it.v / mx) * (h - 14)); return `<rect x="${i * bw + bw * 0.18}" y="${h - bh}" width="${bw * 0.64}" height="${bh}" rx="3" fill="${i === mi ? top : color}"/><text x="${i * bw + bw / 2}" y="${h + 12}" text-anchor="middle" font-size="9" fill="#737373">${esc(it.l)}</text><title>${esc(it.l)}: ${esc(fmt(it.v))}</title>`; }).join('')}</svg>`;
    },
    hbars(items, { fmt = (v) => v } = {}) {
      const mx = Math.max(...items.map((i) => i.v), 1);
      return `<div class="col" style="gap:7px">${items.map((it, i) => `<div><div class="row sm"><span class="grow trunc">${esc(it.l)}</span><span class="mono muted">${esc(fmt(it.v))}</span></div><div class="bar"><i style="width:${(it.v / mx) * 100}%;background:${i === 0 ? 'var(--chart-2)' : 'var(--chart-1)'}"></i></div></div>`).join('')}</div>`;
    },
    donut(items, { size = 110 } = {}) {
      const t = items.reduce((a, b) => a + b.v, 0) || 1; let a0 = -Math.PI / 2; const r = 42, c = 50;
      const cols = ['var(--chart-2)', 'var(--chart-1)', '#0d9488', '#d97706', '#a3a3a3'];
      const arcs = items.map((it, i) => { const a1 = a0 + (it.v / t) * Math.PI * 2; const big = a1 - a0 > Math.PI ? 1 : 0; const p = `M${c + r * Math.cos(a0)} ${c + r * Math.sin(a0)} A${r} ${r} 0 ${big} 1 ${c + r * Math.cos(a1 - 0.001)} ${c + r * Math.sin(a1 - 0.001)}`; a0 = a1; return `<path d="${p}" fill="none" stroke="${cols[i % cols.length]}" stroke-width="12"/>`; }).join('');
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">${arcs}</svg>`;
    },
  };

  /* ───────── data / use cases ───────── */
  DM.defineUC = (key, meta) => { DM.ucs[key] = Object.assign({ key, steps: [], charts: [] }, meta); DM.seed[key] = DM.seed[key] || {}; };
  DM.data = (uc, key, val) => { DM.seed[uc] = DM.seed[uc] || {}; DM.seed[uc][key] = val; };
  DM.uc = null;
  DM.scn = { index: -1, playing: false, timer: null };
  const LS = 'dm.uc';
  DM.resetState = () => { DM.S = DM.clone(DM.seed[DM.uc] || {}); DM.S.notifications = DM.S.notifications || []; DM.S.history = {}; };
  DM.setUC = (uc, { go = true } = {}) => {
    if (!DM.ucs[uc]) return;
    DM.uc = uc; try { localStorage.setItem(LS, uc); } catch (e) {}
    DM.scn.index = -1; DM.scnStop(); DM.resetState();
    if (go && DM.path().startsWith('/inbox')) DM.go('/inbox/threads'); else if (go && DM.path().match(/^\/(orders|leads|quotes|crm|products|agents|workflows)\/.+/)) DM.go('/' + DM.path().split('/')[1]); else DM.render();
  };

  /* ───────── scenario engine ───────── */
  DM.scnApply = (i) => {
    const U = DM.ucs[DM.uc]; DM.resetState(); DM.scn.index = i;
    for (let k = 0; k <= i; k++) {
      const st = U.steps[k]; if (!st) break;
      try { st.apply && st.apply(DM.S, { fresh: k === i }); } catch (e) { console.error('step', k, e); }
      (st.notifies || []).forEach((n) => DM.S.notifications.unshift(Object.assign({ id: DM.uid('n'), at: st.at, step: k, unread: true }, n)));
      Object.entries(st.m || {}).forEach(([key, v]) => { (DM.S.history[key] = DM.S.history[key] || []).push(v); });
    }
    const st = U.steps[i];
    if (st && st.route) { const cur = DM.path() + (location.hash.includes('?') ? '?' + location.hash.split('?')[1] : ''); if (cur !== st.route) DM.go(st.route); else DM.render(); } else DM.render();
  };
  DM.scnNext = () => { const U = DM.ucs[DM.uc]; if (DM.scn.index < U.steps.length - 1) DM.scnApply(DM.scn.index + 1); else DM.scnStop(); };
  DM.scnPrev = () => { if (DM.scn.index >= 0) DM.scnApply(DM.scn.index - 1); };
  DM.scnReset = () => { DM.scnStop(); DM.scn.index = -1; DM.resetState(); DM.render(); };
  DM.scnPlay = () => { DM.scn.playing = true; if (DM.scn.index >= DM.ucs[DM.uc].steps.length - 1) { DM.scnReset(); DM.scn.playing = true; } DM.scn.timer = setInterval(() => { const U = DM.ucs[DM.uc]; if (DM.scn.index >= U.steps.length - 1) return DM.scnStop(); DM.scnNext(); }, 2600); DM.scnNext(); renderPanel(); };
  DM.scnStop = () => { DM.scn.playing = false; clearInterval(DM.scn.timer); DM.scn.timer = null; if (DM.root) renderPanel(); };
  DM.curStep = () => DM.ucs[DM.uc].steps[DM.scn.index];

  /* ───────── router ───────── */
  DM.page = (pattern, def) => {
    const keys = []; const re = new RegExp('^' + pattern.replace(/:[a-zA-Z]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }).replace(/\*/, '(.*)') + '/?$');
    DM.pages.push(Object.assign({ pattern, re, keys }, typeof def === 'function' ? { render: def } : def));
  };
  DM.path = () => { const h = location.hash.slice(1) || '/dashboard'; return h.split('?')[0]; };
  DM.query = () => new URLSearchParams((location.hash.split('?')[1]) || '');
  DM.go = (p) => { if (('#' + p) === location.hash) DM.render(); else location.hash = p; };
  DM.match = (path) => { for (const pg of DM.pages) { const m = path.match(pg.re); if (m) { const params = {}; pg.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1]))); if (pg.keys.length < m.length - 1) params.rest = m[m.length - 1]; return { pg, params }; } } return null; };

  /* ───────── navigation model ───────── */
  const SETTINGS_MENU = [
    ['organisation', 'Company', 'building'], ['personal', 'Personal', 'user'], ['navigation', 'Navigation', 'layout'], ['users', 'Humans', 'users'],
    ['rulebook', 'Rulebook', 'book'], ['templates', 'Templates', 'palette'], ['usage', 'Usage', 'gauge'], ['taxes', 'Tax', 'percent'], ['shipping', 'Shipping', 'truck'], ['invoices', 'Invoices', 'receipt'],
  ];
  const NAV_BASE = [
    { key: 'dashboard', label: 'Home', icon: 'dashboard', url: '/dashboard', prefix: '/dashboard' },
    { key: 'inbox', label: 'Inbox', icon: 'inbox', url: '/inbox/threads', prefix: '/inbox', count: () => (DM.S.threads || []).filter((t) => t.unread).length },
    { key: 'orders', label: 'Orders', icon: 'clipboard', url: '/orders/drafts', prefix: '/orders', exclude: ['/orders/rfqs', '/orders/parent'], count: () => (DM.S.drafts || []).filter((d) => d.status === 'pending').length },
    { key: 'crm', label: 'CRM', icon: 'users', url: '/crm/accounts', prefix: '/crm' },
    { key: 'products', label: 'Products', icon: 'package', url: '/products', prefix: '/products' },
  ];
  const NAV_EXTRA = {
    rfq: [
      { key: 'rfqs', label: 'RFQs', icon: 'sheet', url: '/orders/rfqs', prefix: '/orders/rfqs', count: () => (DM.S.rfqs || []).filter((r) => ['new', 'review'].includes(r.status)).length },
      { key: 'quotes', label: 'Quotes', icon: 'receipt', url: '/quotes/all', prefix: '/quotes' },
      { key: 'leads', label: 'Deals', icon: 'handshake', url: '/leads', prefix: '/leads' },
    ],
    stuffcool: [
      { key: 'campaigns', label: 'Campaigns', icon: 'megaphone', url: '/campaigns', prefix: '/campaigns' },
      { key: 'fulfilment', label: 'Fulfilment', icon: 'truck', url: '/fulfilment', prefix: '/fulfilment' },
      { key: 'quotes', label: 'Quotes', icon: 'receipt', url: '/quotes/all', prefix: '/quotes' },
    ],
    newhome: [
      { key: 'fulfilment', label: 'Fulfilment', icon: 'truck', url: '/fulfilment', prefix: '/fulfilment' },
    ],
  };
  const WORKSPACE = [
    { key: 'agents', label: 'Agents', icon: 'bot', url: '/agents', prefix: '/agents' },
    { key: 'workflows', label: 'Workflows', icon: 'workflow', url: '/workflows', prefix: '/workflows' },
    { key: 'channels', label: 'Channels', icon: 'radio', url: '/settings/channels', prefix: '/settings/channels' },
    { key: 'apps', label: 'Apps', icon: 'blocks', url: '/settings/integrations', prefix: '/settings/integrations' },
    { key: 'logs', label: 'Logs', icon: 'history', url: '/settings/logs', prefix: '/settings/logs' },
    { key: 'settings', label: 'Settings', icon: 'settings', url: '/settings/organisation', prefix: '/settings', menu: [['organisation', 'Company', 'building'], ['navigation', 'Navigation', 'layout'], ['users', 'Humans', 'users'], ['rulebook', 'Rulebook', 'book'], ['usage', 'Usage', 'gauge']].map(([k, l, ic]) => ({ label: l, icon: ic, url: '/settings/' + k })), exclude: ['/settings/channels', '/settings/integrations', '/settings/logs'] },
  ];
  Object.defineProperty(DM, 'NAV', { get() {
    const hidden = (DM.S && DM.S.navHidden) || [];
    return [{ label: 'Navigate', items: [...NAV_BASE, ...(NAV_EXTRA[DM.uc] || [])].filter((i) => !hidden.includes(i.key)) }, { label: 'Workspace', items: WORKSPACE }];
  } });
  const flat = () => DM.NAV.flatMap((g) => g.items);
  const activeNav = (path) => { let best = null, bl = -1; for (const it of flat()) { const pre = it.prefix || it.url; if ((path === pre || path.startsWith(pre + '/') || path.startsWith(pre)) && !(it.exclude || []).some((x) => path.startsWith(x)) && pre.length > bl) { best = it; bl = pre.length; } } return best; };
  DM.allDestinations = () => { const out = []; flat().forEach((it) => { out.push({ label: it.label, icon: it.icon, url: it.url }); (it.menu || []).forEach((m) => out.push({ label: 'Settings · ' + m.label, icon: m.icon, url: m.url })); }); out.push({ label: 'Ask Anuma', icon: 'sparkle', url: '/ask' }, { label: 'Notifications', icon: 'bell', url: '/notifications' }, { label: 'Getting started', icon: 'rocket', url: '/getting-started' }, { label: 'Insights', icon: 'chart', url: '/insights' }, { label: 'Production', icon: 'factory', url: '/production' }, { label: 'Packaging', icon: 'box', url: '/packaging' }, { label: 'Approvals', icon: 'check', url: '/governance/approvals' }, { label: 'Rate card', icon: 'tag', url: '/quotes/rate-card' }); return out; };

  /* ───────── shell rendering ───────── */
  const shell = () => `
  <div id="app" class="panel-closed">
    <aside id="rail"></aside>
    <main id="main"><div id="topbar"></div><div id="view"></div></main>
  </div><div id="toasts"></div><div id="boot"><div class="m"><i></i><i></i></div></div>`;
  const MARK = `<svg viewBox="0 0 32 32" width="26" height="26"><rect width="32" height="32" rx="8" fill="#0a0a0a"/><circle cx="10.5" cy="16" r="2.3" fill="#fff"/><rect x="15" y="13.8" width="8.5" height="4.4" rx="2.2" fill="#fff"/></svg>`;
  DM.mark = (n = 26) => MARK.replace(/26/g, n);

  function renderRail(path) {
    const act = activeNav(path);
    const rail = document.getElementById('rail');
    const grp = (g) => `<div class="navgrp">${g.label}</div>${g.items.map((it) => { const on = act && act.key === it.key; const c = it.count ? it.count() : 0; return `<div><a class="navitem ${on ? 'active' : ''}" ${it.menu ? `data-act="settings-menu"` : `href="#${it.url}"`} data-nav="${it.key}">${I(it.icon)}<span class="grow">${it.label}</span>${c ? `<span class="cnt">${c}</span>` : ''}${it.menu ? I(DM.ui.setMenu ? 'chevD' : 'chevU') : ''}</a>${it.menu && DM.ui.setMenu ? `<div class="navmenu">${it.menu.map((m) => `<a href="#${m.url}" class="${path.startsWith(m.url) ? 'on' : ''}">${I(m.icon)}${m.label}</a>`).join('')}</div>` : ''}</div>`; }).join('')}`;
    const [g1, g2] = DM.NAV;
    rail.innerHTML = `
      <div class="brand" data-act="merchant-menu">${MARK}<div class="grow"><div class="nm">Demo Merchant User</div><div class="sub">Admin</div></div>${I('chevD')}</div>
      <button class="searchbtn" data-act="palette">${I('search')} <span class="grow">Search…</span><kbd>⌘K</kbd></button>
      <nav id="nav">${grp(g1)}<div class="grow"></div>${grp(g2)}</nav>
      <div class="acct" data-act="account-menu">${DM.avatar('Rohan Mehta', '', { noPhoto: false, org: false })}<div class="grow" style="min-width:0"><div class="b trunc">Rohan Mehta</div><div class="xs muted trunc">rohan@demo.anuma.run</div></div>${I('chevU')}</div>`;
  }
  function ucSwitcher() {
    if (DM.ui.demoHidden) return '';
    const U = DM.ucs[DM.uc]; const i = DM.scn.index; const n = U.steps.length; const st = U.steps[i];
    return `<div class="demobar ${DM.scn.playing ? 'playing' : ''}">
      <button class="btn ghost sm" style="height:24px;padding:0 6px" data-act="uc-menu" title="Switch use case">${I(U.icon || 'zap')}<span>${esc(U.short)}</span>${I('chevD')}</button>
      <span class="sepv"></span>
      <button class="btn ghost icon" data-act="scn-prev" ${i < 0 ? 'disabled' : ''} title="Previous step">${I('skipB')}</button>
      <button class="btn ghost icon" data-act="scn-play" title="${DM.scn.playing ? 'Pause' : 'Play scenario'}">${I(DM.scn.playing ? 'pause' : 'play')}</button>
      <button class="btn ghost icon" data-act="scn-next" ${i >= n - 1 ? 'disabled' : ''} title="Next step">${I('skipF')}</button>
      <span class="lbl" data-act="steps-pop" title="All steps"><i class="play-ind"></i><span class="mono">${i < 0 ? '0' : i + 1}/${n}</span><span class="trunc">${i < 0 ? 'Play the scenario' : esc(st.title)}</span>${I('chevD')}</span>
      <button class="btn ghost icon" data-act="scn-reset" title="Reset scenario">${I('rotate')}</button>
      <button class="btn ghost icon" data-act="demo-hide" title="Hide demo controls">${I('x')}</button></div>`;
  }
  DM.stepsPopover = (anchor) => {
    document.querySelectorAll('.stepspop').forEach((e) => e.remove());
    const U = DM.ucs[DM.uc]; const i = DM.scn.index; const r = anchor.getBoundingClientRect();
    const d = document.createElement('div'); d.className = 'stepspop';
    d.innerHTML = `<div class="sp-narr"><b>${esc(U.short)}</b> · ${esc(i >= 0 ? (U.steps[i].narr || U.steps[i].desc || U.steps[i].title) : U.about)}</div>${U.steps.map((s, k) => `<button class="sp-row ${k <= i ? 'done' : ''} ${k === i ? 'cur' : ''}" data-k="${k}"><span class="sp-n">${k + 1}</span><span class="grow"><b class="sm" style="display:block;font-weight:500">${esc(s.title)}</b><span class="xs muted">${esc(s.desc || '')}</span></span><span class="xs muted">${esc(s.at || '')}</span></button>`).join('')}`;
    d.style.top = r.bottom + 6 + 'px'; d.style.left = Math.max(8, Math.min(r.left, innerWidth - 396)) + 'px'; document.body.appendChild(d);
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) { d.remove(); DM.scnStop(); DM.scnApply(+b.dataset.k); } });
    setTimeout(() => document.addEventListener('mousedown', function f(e) { if (!e.target.closest('.stepspop')) d.remove(); document.removeEventListener('mousedown', f); }), 0);
  };
  function renderTop(path, m) {
    const act = activeNav(path); const unread = (DM.S.notifications || []).filter((n) => n.unread).length;
    const label = (m && m.pg.crumb ? (typeof m.pg.crumb === 'function' ? m.pg.crumb(m.params) : m.pg.crumb) : null) || (act ? act.label : '');
    const parent = act && m && m.pg.crumb && act.label !== label ? `<a href="#${act.url}" class="muted">${esc(act.label)}</a><span class="muted"> / </span>` : '';
    document.getElementById('topbar').innerHTML = `<div id="crumb"><span class="muted">Demo Merchant User</span><span class="muted"> / </span>${parent}<b>${esc(label)}</b></div>
      <div class="row gap4 right">${ucSwitcher()}
      <button class="btn ghost icon" data-act="ask" title="Ask Anuma">${I('chat')}</button>
      <button class="btn ghost icon bellbtn" data-act="bell" title="Notifications">${I('bell')}${unread ? `<span class="bellcount">${unread > 9 ? '9+' : unread}</span>` : ''}</button></div>`;
  }
  DM.bellPopover = () => {
    document.querySelectorAll('.bellpop').forEach((e) => e.remove());
    const N = (DM.S.notifications || []).slice(0, 6); const total = (DM.S.notifications || []).length;
    const ic = (n) => (/hand-?off/i.test(n.subject || '') ? 'arrowR' : /assigned/i.test(n.subject || '') ? 'chat' : /review|flag/i.test(n.subject || '') ? 'eye' : 'bell');
    const d = document.createElement('div'); d.className = 'bellpop';
    d.innerHTML = `<div class="bp-h"><b>Notifications</b><span class="cnt-chip dark">${total}</span></div>${N.length ? N.map((n) => `<a class="bp-row" href="#${(n.href || '/notifications').split('#').pop()}"><span class="icotile">${I(ic(n))}</span><div class="grow" style="min-width:0"><div class="row"><b class="sm">${esc(n.subject)}</b><span class="grow"></span><span class="xs muted">${esc(n.at || '')}</span>${n.unread ? '<i class="udot"></i>' : ''}</div><div class="sm muted trunc">${esc(n.body || '')}</div></div></a>`).join('') : '<div class="empty" style="padding:28px">You are all caught up.</div>'}<a class="bp-f" href="#/notifications">View all notifications ${I('arrowR')}</a>`;
    document.body.appendChild(d);
    setTimeout(() => document.addEventListener('click', function f(e) { if (!e.target.closest('.bellpop')) { d.remove(); } document.removeEventListener('click', f); }, { once: false }), 0);
    d.addEventListener('click', (e) => { if (e.target.closest('a')) d.remove(); });
  };

  function renderPanel() { const p = DM.path(); if (DM.root) { renderTop(p, DM.match(p)); renderDemoHandle(); } }
  function renderDemoHandle() { let h = document.getElementById('demohandle'); if (DM.ui.demoHidden) { if (!h) { h = document.createElement('button'); h.id = 'demohandle'; h.className = 'demohandle'; h.dataset.act = 'demo-show'; h.innerHTML = I('play') + ' Demo'; document.body.appendChild(h); } } else if (h) h.remove(); }
  DM.renderPanel = renderPanel;

  DM.render = () => {
    if (!DM.root) return;
    const path = DM.path(); const m = DM.match(path);
    const focus = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.input;
    const sel = focus ? [document.activeElement.selectionStart, document.activeElement.selectionEnd] : null;
    const view = document.getElementById('view'); const sc = view.scrollTop;
    document.getElementById('app').classList.toggle('panel-closed', !!(!path.startsWith('/inbox') || DM.ui.panelHidden));
    DM._grids = [];
    renderRail(path); renderTop(path, m);
    let html;
    try { html = m ? m.pg.render({ params: m.params, q: DM.query(), path }) : `<div class="page"><div class="empty"><h3>Page not found</h3><p>${esc(path)}</p><p style="margin-top:12px"><a class="btn outline" href="#/dashboard">Back to dashboard</a></p></div></div>`; }
    catch (e) { console.error(e); html = `<div class="page"><div class="empty"><h3>Something broke on this screen</h3><pre class="sm">${esc(e.message)}</pre></div></div>`; }
    view.innerHTML = html;
    if (DM._lastPath !== path) { view.classList.remove('pg-enter'); void view.offsetWidth; view.classList.add('pg-enter'); }
    if (DM._lastPath === path) view.scrollTop = sc; else view.scrollTop = 0; DM._lastPath = path;
    if (m && m.pg.after) try { m.pg.after(view, { params: m.params, q: DM.query() }); } catch (e) { console.error(e); }
    DM.afterHooks.forEach((f) => f(view));
    if (focus) { const el = view.querySelector(`[data-input="${focus}"]`); if (el) { el.focus(); if (sel) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) {} } }
    document.title = (m && m.pg.title ? m.pg.title + ' · ' : '') + 'Anuma · Demo Merchant User';
    renderPanel();
  };


  /* ───────── shared motion helpers ─────────
     [data-rid="x"]  → items that appear after the first render of a route get a yellow flash + rise (scenario steps landing)
     [data-count="n" data-fmt="inr|num|pct"] → number counts up/down to n when it changes
     .stagger children → enter in sequence */
  DM._seen = {}; DM._counts = {};
  DM.afterHooks.push((root) => {
    const path = DM.path() + '|' + DM.uc; const prev = DM._seen[path]; const cur = new Set();
    root.querySelectorAll('[data-rid]').forEach((e) => { cur.add(e.dataset.rid); if (prev && !prev.has(e.dataset.rid)) e.classList.add('row-new'); });
    DM._seen[path] = cur;
    if (!prev && DM._lastPath !== path.split('|')[0]) root.querySelectorAll('.stagger > *').forEach((e, k) => { e.style.animation = `os-enter .35s cubic-bezier(.22,.8,.24,1) ${Math.min(k, 12) * 40}ms both`; });
    root.querySelectorAll('[data-count]').forEach((e, k) => {
      const key = path + '#' + (e.dataset.ck || k); const to = parseFloat(e.dataset.count); const from = DM._counts[key] == null ? 0 : DM._counts[key]; DM._counts[key] = to;
      const f = e.dataset.fmt === 'inr' ? DM.fmt.inr : e.dataset.fmt === 'inrc' ? DM.fmt.inrc : e.dataset.fmt === 'pct' ? (v) => Math.round(v) + '%' : (v) => DM.fmt.num(Math.round(v));
      if (from === to) { e.textContent = f(to); return; }
      const t0 = performance.now(), dur = 650; const tick = (t) => { const p = Math.min(1, (t - t0) / dur), ez = 1 - Math.pow(1 - p, 3); e.textContent = f(from + (to - from) * ez); if (p < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    });
  });
  DM.seenReset = () => { DM._seen = {}; DM._counts = {}; };

  /* ───────── overlays ───────── */
  const ov = () => document.getElementById('overlay');
  DM.modal = ({ title, body, actions = [], lg = false, onMount }) => {
    DM.closeModal(); const d = document.createElement('div'); d.id = 'overlay';
    d.innerHTML = `<div class="modal ${lg ? 'lg' : ''}" role="dialog" aria-modal="true"><div class="modal-h"><h3 class="grow" style="font-size:15px">${title}</h3><button class="btn ghost icon sm" data-act="close-modal">${I('x')}</button></div><div class="modal-b">${body}</div>${actions.length ? `<div class="modal-f">${actions.map((a, k) => `<button class="btn ${a.cls || ''}" data-modal-act="${k}">${esc(a.label)}</button>`).join('')}</div>` : ''}</div>`;
    d.addEventListener('mousedown', (e) => { if (e.target === d) DM.closeModal(); });
    d.addEventListener('click', (e) => { const b = e.target.closest('[data-modal-act]'); if (!b) return; const a = actions[+b.dataset.modalAct]; const r = a.run ? a.run(d) : null; if (r !== false) DM.closeModal(); });
    document.body.appendChild(d); onMount && onMount(d); const f = d.querySelector('input,textarea,select'); f && f.focus();
  };
  DM.closeModal = () => { const o = ov(); if (o) o.remove(); };
  DM.confirm = (title, msg, onYes, label = 'Confirm') => DM.modal({ title, body: `<p>${msg}</p>`, actions: [{ label: 'Cancel', cls: 'outline' }, { label, run: () => { onYes(); } }] });
  DM.drawer = ({ title, body, actions = '' }) => {
    DM.closeDrawer(); const d = document.createElement('div'); d.id = 'drawer-wrap';
    d.innerHTML = `<div class="drawer"><div class="modal-h"><h3 class="grow" style="font-size:15px">${title}</h3>${actions}<button class="btn ghost icon sm" data-act="close-drawer">${I('x')}</button></div><div class="modal-b" style="flex:1">${body}</div></div>`;
    d.addEventListener('mousedown', (e) => { if (e.target === d) DM.closeDrawer(); }); document.body.appendChild(d); return d;
  };
  DM.closeDrawer = () => { const d = document.getElementById('drawer-wrap'); if (d) d.remove(); };
  DM.toast = (msg, icon = 'check') => { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = I(icon) + esc(msg); document.getElementById('toasts').appendChild(t); setTimeout(() => t.remove(), 2800); };
  DM.menu = (el, items, o = {}) => {
    document.querySelectorAll('.menu').forEach((m) => m.remove());
    const r = el.getBoundingClientRect(); const m = document.createElement('div'); m.className = 'menu';
    m.innerHTML = items.map((it, k) => it.sep ? '<div class="msep"></div>' : it.heading ? `<div class="mlabel">${esc(it.heading)}</div>` : `<button data-mk="${k}">${it.icon ? I(it.icon) : ''}<span class="grow">${esc(it.label)}</span>${it.hint ? `<span class="xs muted">${esc(it.hint)}</span>` : ''}${it.check ? I('check') : ''}</button>`).join('');
    m.style.minWidth = Math.max(160, o.match ? r.width : 0) + 'px';
    document.body.appendChild(m);
    const h = m.getBoundingClientRect().height, w = m.getBoundingClientRect().width;
    const up = r.bottom + 4 + h > innerHeight - 8 && r.top - 4 - h > 8;
    m.style.top = (up ? r.top - 4 - h : r.bottom + 4) + 'px'; m.style.left = Math.max(8, Math.min(o.right ? r.right - w : r.left, innerWidth - w - 8)) + 'px'; m.style.transformOrigin = (up ? 'bottom ' : 'top ') + (o.right ? 'right' : 'left');
    m.addEventListener('click', (e) => { const b = e.target.closest('[data-mk]'); if (!b) return; m.remove(); items[+b.dataset.mk].run && items[+b.dataset.mk].run(); });
  };
  // Native <select> → styled dropdown (same look as every other menu)
  document.addEventListener('mousedown', (e) => {
    const sel = e.target.closest && e.target.closest('select'); if (!sel || sel.multiple || sel.disabled) return;
    e.preventDefault(); sel.focus();
    DM.menu(sel, [...sel.options].map((o) => ({ label: o.text, check: o.selected, run: () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); } })), { match: true });
  });
  DM.formData = (root) => { const o = {}; root.querySelectorAll('[name]').forEach((e) => { o[e.name] = e.type === 'checkbox' ? e.checked : e.value; }); return o; };
  DM.field = (label, name, o = {}) => `<div class="field"><label>${esc(label)}</label>${o.options ? `<select class="select" name="${name}">${o.options.map((x) => `<option ${x === o.value ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>` : o.area ? `<textarea class="textarea" name="${name}" rows="${o.rows || 3}" placeholder="${esc(o.ph || '')}">${esc(o.value || '')}</textarea>` : `<input class="input" name="${name}" type="${o.type || 'text'}" value="${esc(o.value ?? '')}" placeholder="${esc(o.ph || '')}">`}</div>`;

  /* ───────── global actions ───────── */
  const A = DM.acts;
  DM.act = (n, fn) => (A[n] = fn);
  DM.input = (n, fn) => (DM.inputs[n] = fn);
  A['close-modal'] = () => DM.closeModal(); A['close-drawer'] = () => DM.closeDrawer();
  
  A['uc'] = (el) => DM.setUC(el.dataset.arg);
  A['scn-next'] = () => { DM.scnStop(); DM.scnNext(); }; A['scn-prev'] = () => { DM.scnStop(); DM.scnPrev(); };
  A['scn-play'] = () => (DM.scn.playing ? DM.scnStop() : DM.scnPlay()); A['scn-reset'] = () => DM.scnReset();
  A['scn-jump'] = (el) => { DM.scnStop(); DM.scnApply(+el.dataset.arg); };
  A['bell'] = () => DM.bellPopover();
  A['steps-pop'] = (el) => DM.stepsPopover(el);
  A['demo-hide'] = () => { DM.scnStop(); DM.ui.demoHidden = true; DM.render(); };
  A['demo-show'] = () => { DM.ui.demoHidden = false; DM.render(); };
  A['uc-menu'] = (el) => DM.menu(el, Object.values(DM.ucs).map((u) => ({ label: u.short + ' · ' + u.tagline, icon: u.key === DM.uc ? 'check' : u.icon, run: () => DM.setUC(u.key) })), { right: true });
  A['ask'] = () => DM.go('/ask');
  A['palette'] = () => openPalette();
  A['settings-menu'] = (el) => { DM.ui.setMenu = !DM.ui.setMenu; renderRail(DM.path()); };
  A['merchant-menu'] = (el) => DM.menu(el, [{ label: 'Demo Merchant User (current)', icon: 'check' }, { label: 'Company settings', icon: 'building', run: () => DM.go('/settings/organisation') }]);
  A['account-menu'] = (el) => DM.menu(el, [{ label: 'Personal settings', icon: 'user', run: () => DM.go('/settings/personal') }, { label: 'Usage', icon: 'gauge', run: () => DM.go('/settings/usage') }, { label: 'Getting started', icon: 'rocket', run: () => DM.go('/getting-started') }, { label: 'Sign out (demo)', icon: 'logout', run: () => DM.toast('Demo workspace — nobody to sign out.', 'info') }]);
  A['view-menu'] = (el) => DM.menu(el, [{ label: 'All', icon: 'check' }, { label: 'Recently active', icon: 'clock', run: () => DM.toast('View applied') }, { label: 'Save current view…', icon: 'plus', run: () => DM.toast('View saved') }]);
  A['cols-menu'] = (el) => DM.menu(el, ['Number', 'Name', 'Status', 'Created'].map((l) => ({ label: l, icon: 'check', run: () => DM.toast('Column toggled') })));
  A['noop'] = (el) => DM.toast(el.dataset.arg || 'Done');
  A['toast'] = (el) => DM.toast(el.dataset.arg || 'Done');

  function openPalette() {
    const w = document.createElement('div'); w.id = 'palette-wrap';
    w.innerHTML = `<div class="palette"><input placeholder="Jump to a page, party, product…" autofocus><div class="res"></div></div>`; document.body.appendChild(w);
    const inp = w.querySelector('input'), res = w.querySelector('.res'); let sel = 0, list = [];
    const draw = () => { const q = inp.value.toLowerCase().trim(); list = DM.allDestinations().filter((d) => !q || d.label.toLowerCase().includes(q)); if (q) DM.searchProviders.forEach((p) => { try { list = list.concat(p(q)); } catch (e) {} }); list = list.slice(0, 40); sel = Math.min(sel, Math.max(0, list.length - 1)); res.innerHTML = list.map((d, k) => `<a data-k="${k}" class="${k === sel ? 'sel' : ''}">${I(d.icon || 'search')}<span class="grow">${esc(d.label)}</span>${d.sub ? `<span class="xs muted">${esc(d.sub)}</span>` : ''}</a>`).join('') || '<div class="empty">No matches</div>'; };
    const go = (k) => { const d = list[k]; if (d) { w.remove(); DM.go(d.url); } };
    inp.addEventListener('input', draw); inp.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, list.length - 1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); draw(); e.preventDefault(); } else if (e.key === 'Enter') go(sel); else if (e.key === 'Escape') w.remove(); });
    res.addEventListener('click', (e) => { const a = e.target.closest('[data-k]'); if (a) go(+a.dataset.k); }); w.addEventListener('mousedown', (e) => { if (e.target === w) w.remove(); }); draw(); inp.focus();
  }

  /* ───────── boot ───────── */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu')) document.querySelectorAll('.menu').forEach((m) => m.remove());
    const nm = e.target.closest('.navmenu'); if (!nm && DM.ui.setMenu && !e.target.closest('[data-act="settings-menu"]')) { DM.ui.setMenu = false; renderRail(DM.path()); }
    if (nm) { DM.ui.setMenu = false; }
    const a = e.target.closest('[data-act]');
    if (a && A[a.dataset.act]) { if (a.tagName === 'A') e.preventDefault(); A[a.dataset.act](a, e); return; }
    const g = e.target.closest('[data-go]'); if (g && !e.target.closest('button[data-act],a[href]')) { DM.go(g.dataset.go); }
  });
  document.addEventListener('input', (e) => { const n = e.target.dataset && e.target.dataset.input; if (n && DM.inputs[n]) DM.inputs[n](e.target.value, e.target); });
  document.addEventListener('change', (e) => { const n = e.target.dataset && e.target.dataset.change; if (n && DM.inputs[n]) DM.inputs[n](e.target.value, e.target); });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
    if (e.key === 'Escape') { DM.closeModal(); DM.closeDrawer(); }
  });
  window.addEventListener('hashchange', () => { DM.closeDrawer(); DM.closeModal(); DM.render(); });

  DM.boot = () => {
    DM.root = document.getElementById('root'); DM.root.innerHTML = shell();
    let uc = null; try { uc = localStorage.getItem(LS); } catch (e) {}
    if (!DM.ucs[uc]) uc = Object.keys(DM.ucs)[0];
    DM.uc = uc; DM.resetState(); DM.render();
    setTimeout(() => { const b = document.getElementById('boot'); if (b) { b.classList.add('out'); setTimeout(() => b.remove(), 400); } }, 900);
  };
})();
