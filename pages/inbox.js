/* Inbox — NewHome + Stuffcool (Access has none). Replica of the live Inbox: docs/spec/inbox.md.
   Three columns: case list (289px) · WhatsApp chat · AI summary + Activity.   State lives in DM.S.threads (shapes: data/seed-inbox.js).
   Scenario/other-module API:  DM.inbox.addMessage(thread|id, msg)  DM.inbox.system(thread, '**System** … **x**')  DM.inbox.setStatus / setOwner / find(caseNo|id) */
(function () {
  const D = window.DM, I = D.icon, esc = D.esc;
  const ME = 'u-rohan';

  /* ───────────────────────── styles ───────────────────────── */
  const st = document.createElement('style'); st.dataset.for = 'inbox';
  st.textContent = `
  .ib{display:grid;grid-template-columns:289px minmax(0,1fr) 280px;height:100%;min-height:0;position:relative}
  .ib.nopanel{grid-template-columns:289px minmax(0,1fr)}
  @media(max-width:1330px){.ib{grid-template-columns:289px minmax(0,1fr)}.ib .ib-r{position:absolute;right:0;top:0;bottom:0;width:290px;z-index:8;box-shadow:-12px 0 32px rgba(0,0,0,.14);background:#fff}.ib.nopanel .ib-r{display:none}}
  .ib-l{display:flex;flex-direction:column;min-height:0;min-width:0;border-right:1px solid var(--border);background:#fff}
  .ib-lh{padding:14px 14px 10px;display:flex;flex-direction:column;gap:10px}
  .ib-num{display:inline-flex;align-items:center;gap:8px;height:28px;padding:0 6px;margin:0 -6px;border-radius:8px;font-size:14px;font-weight:600;align-self:flex-start;transition:background-color .15s}
  .ib-num:hover{background:#f5f5f5}.ib-num svg.i{width:14px;height:14px;color:#737373}
  .wa{width:16px;height:16px;color:#25d366;flex:none}
  .ib-srow{display:flex;gap:8px}
  .ib-sg{flex:1;display:flex;align-items:center;gap:6px;height:28px;padding:0 6px 0 8px;border:1px solid var(--input);border-radius:8px;background:#fff;transition:border-color .15s,box-shadow .15s}
  .ib-sg:focus-within{border-color:#a3a3a3;box-shadow:0 0 0 3px rgba(0,0,0,.06)}.ib-sg svg.i{width:14px;height:14px;color:#737373;flex:none}
  .ib-sg input{border:0;outline:0;background:transparent;font-size:12px;flex:1;min-width:0}.ib-sg button{width:18px;height:18px;border-radius:5px;display:grid;place-items:center;color:#737373}.ib-sg button:hover{background:#f0f0f0}
  .ib-tabs .pills{width:100%;display:flex}.ib-tabs .pill{flex:1;justify-content:center;height:25px;padding:0 8px}
  .ib-list{flex:1;overflow:auto;min-height:0;border-top:1px solid var(--border)}
  .ib-foot{height:44px;flex:none;border-top:1px solid var(--border);display:flex;align-items:center;padding:0 14px;font-size:12px;color:var(--muted-foreground)}
  .crow{position:relative;display:flex;flex-direction:column;gap:6px;min-height:97px;padding:10px 14px 8px;border-bottom:1px solid var(--border);cursor:pointer;text-align:left;transition:background-color .15s}
  .crow:hover{background:#f5f5f5}.crow.on{background:rgba(245,245,245,.6)}.crow.on::before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:#0a0a0a}
  .crow.esc{background:#fefce8}.crow.esc:hover{background:#fdf8d4}
  .crow .r1{display:flex;align-items:center;gap:6px;min-height:20px}.crow .tm{margin-left:auto;font-size:12px;color:var(--muted-foreground)}
  .cchip{display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 8px;border:1px solid var(--border);border-radius:999px;font:500 10px var(--font);background:#f5f5f5;color:#737373}
  .cchip i{width:6px;height:6px;border-radius:50%;background:#a3a3a3}.cchip.open{color:#13a269;background:#eefbe8;border-color:#d4f0c6}.cchip.open i{background:#13a269}.cchip.escalated{color:#9a6208;background:#fff;border-color:#f4e2b0}.cchip.escalated i{background:#f4b23e}
  .slap{display:inline-flex;align-items:center;gap:3px;height:20px;padding:0 7px;border-radius:999px;font:500 10px var(--font);border:1px solid #f4e2b0;color:#9a6208;background:#fff}.slap.over{color:#b42318;border-color:#fcd5d0;background:#fff2f0}.slap svg.i{width:10px;height:10px}
  .uchip{min-width:18px;height:18px;border-radius:9px;background:#13a269;color:#fff;font:600 10px var(--font);display:grid;place-items:center;padding:0 5px;animation:badge-pop .3s ease both}
  .crow .nm{font-size:12px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:30px}.crow .nm b{font-weight:600}.crow .nm span{color:var(--muted-foreground)}
  .crow .pv{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--muted-foreground);min-width:0;padding-right:30px;line-height:16px}.crow .pv span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.crow .pv svg.i{width:14px;height:14px;flex:none;color:#8a8a8a}
  .crow .who{position:absolute;right:12px;bottom:10px;display:flex}
  .amk{display:inline-grid;width:24px;height:24px;border-radius:50%;flex:none}.amk svg{width:100%;height:100%}.amk.ring{box-shadow:0 0 0 2px #fff,0 0 0 4px #13a269}
  .ib-skel{padding:10px 14px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:9px;height:97px}
  .ib-empty{display:flex;flex-direction:column;align-items:center;padding:56px 16px;gap:2px}
  /* middle */
  .ib-m{display:flex;flex-direction:column;min-width:0;min-height:0;position:relative}
  .ib-h{height:68px;flex:none;display:flex;align-items:center;gap:8px;padding:0 20px;background:#fff}
  .ib-h .tt{font-size:16px;font-weight:600;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ib-h .tt span{font-size:14px;font-weight:400;color:var(--muted-foreground);margin-left:8px}
  .ib-h .mt2{font-size:12px;color:var(--muted-foreground);display:flex;gap:8px;align-items:center;margin-top:2px}.ib-h .mt2 i{width:1px;height:11px;background:#d4d4d4}
  .ib-h .typingtxt{color:#13a269;font-weight:500;animation:os-fade .2s both}
  .ib-stream{flex:1;overflow:auto;min-height:0;padding:18px 28px 104px;display:flex;flex-direction:column;gap:10px;background:var(--chat-wallpaper) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' viewBox='0 0 88 88'%3E%3Cg fill='none' stroke='%23000' stroke-opacity='.06' stroke-width='1.3'%3E%3Ccircle cx='14' cy='16' r='5'/%3E%3Cpath d='M44 12l6 6-6 6-6-6z'/%3E%3Cpath d='M70 60c4-6 10-6 14 0'/%3E%3Cpath d='M12 62h12M18 56v12'/%3E%3Crect x='52' y='44' width='10' height='10' rx='3'/%3E%3Cpath d='M30 40q5-8 10 0t10 0'/%3E%3C/g%3E%3C/svg%3E")}
  .ib-stream.xf{animation:os-fade .16s both}
  .mrow{display:flex;align-items:flex-end;gap:8px;position:relative;flex:none}.mrow.out{justify-content:flex-end}.mrow.mid{justify-content:center}
  .mrow.ib-hold,.ib-hold{display:none!important}
  .bub{position:relative;max-width:min(72%,624px);padding:7px 12px 6px;border-radius:18px;font-size:13px;line-height:1.38;background:#fff;white-space:pre-wrap;word-break:break-word;box-shadow:0 1px 1px rgba(0,0,0,.04)}
  .bub.out{background:#d9fdd3;color:#111b21}
  .bub .mt{float:right;margin:5px 0 0 10px;font-size:10px;line-height:1;opacity:.62;display:inline-flex;align-items:center;gap:2px;white-space:nowrap}
  .bub.emoji{font-size:15px}
  .tick{width:15px;height:15px;color:#8a9a8f}.tick.read{color:#53bdeb}.tick svg{width:100%;height:100%}
  .rx{position:absolute;bottom:-12px;left:8px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.18);display:grid;place-items:center;font-size:12px;z-index:2;animation:pop-in .2s both}.bub.out .rx{left:auto;right:8px}
  .qt{display:block;border-left:3px solid #13a269;background:rgba(0,0,0,.06);border-radius:8px;padding:5px 8px;margin:1px 0 6px;font-size:12px;line-height:1.3}.qt b{display:block;font-weight:600;font-size:12px;color:#13a269}.qt span{color:#525252;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .bub:not(.out) .qt{background:#f3f4f6}
  .btns{margin:6px -12px -6px;border-top:1px solid rgba(0,0,0,.09);display:flex;flex-direction:column}.btns button{height:34px;font-size:13px;font-weight:500;color:#0b7a4e;border-top:1px solid rgba(0,0,0,.07);transition:background-color .15s,transform .1s}.btns button:first-child{border-top:0}.btns button:hover:not([disabled]){background:rgba(0,0,0,.05)}.btns button:active:not([disabled]){transform:scale(.985)}.btns button[disabled]{color:#8a8a8a;cursor:default}
  .mav{width:24px;height:24px;flex:none;display:grid;place-items:end}
  .imgb{position:relative;width:252px;height:176px;border-radius:12px;overflow:hidden;cursor:zoom-in;box-shadow:0 1px 1px rgba(0,0,0,.06);background:#e5e5e5}.imgb img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}.imgb:hover img{transform:scale(1.03)}
  .imgb .mt{position:absolute;right:8px;bottom:6px;font-size:10px;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)}.imgb::after{content:"";position:absolute;left:0;right:0;bottom:0;height:34px;background:linear-gradient(transparent,rgba(0,0,0,.35));pointer-events:none}
  .imgwrap{position:relative;display:flex;flex-direction:column;gap:4px;margin-bottom:10px}.imgwrap .rx{left:8px;bottom:-12px}.mrow.out .imgwrap .rx{left:auto;right:8px}
  .lblchip{align-self:flex-start;background:#fff;border-radius:999px;font-size:11px;padding:1px 8px;box-shadow:0 1px 2px rgba(0,0,0,.1)}
  .ap{display:flex;align-items:center;gap:10px;min-width:228px;background:#f4f4f5;border-radius:10px;padding:9px 12px}.bub.out .ap{background:rgba(255,255,255,.55)}
  .ap .pl{width:26px;height:26px;border-radius:50%;background:#0a0a0a;color:#fff;display:grid;place-items:center;flex:none;transition:transform .1s}.ap .pl:active{transform:scale(.92)}.ap .pl svg{width:12px;height:12px;fill:currentColor;stroke:currentColor}
  .ap .trk{flex:1;height:3px;background:#d4d4d4;border-radius:2px;position:relative;min-width:80px}.ap .trk i{position:absolute;left:0;top:0;bottom:0;background:#0a0a0a;border-radius:2px;width:0}
  .ap .tm{font-size:12px;color:#737373;font-variant-numeric:tabular-nums;white-space:nowrap}
  .wave{display:flex;align-items:center;gap:2px;height:18px;flex:1;min-width:90px}.wave i{width:2px;border-radius:1px;background:#a3a3a3;flex:none}.wave i.on{background:#0a0a0a}
  .doc{display:flex;align-items:center;gap:10px;min-width:240px}.doc .di{width:34px;height:40px;border-radius:6px;background:#eef2ff;color:#4f46e5;display:grid;place-items:center;flex:none}.doc .dn{font-size:12.5px;font-weight:500}.doc .ds{font-size:11px;color:#737373}
  .tool{position:relative;align-self:center;display:inline-flex;align-items:center;gap:6px;height:30px;padding:4px 4px 4px 8px;border:1px solid var(--border);border-radius:10px;background:#f5f5f5;font-size:12px;cursor:default;flex:none;max-width:90%}
  .tool svg.i{width:13px;height:13px;color:#737373}.tool .tx{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tool .term{display:grid;place-items:center;width:22px;height:20px;border-radius:6px;background:#fff;border:1px solid var(--border);font:600 9.5px ui-monospace,monospace;color:#525252}
  .tool .hc{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);width:320px;z-index:20;background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.1),0 10px 28px rgba(0,0,0,.16);padding:12px;text-align:left;animation:pop-in .12s both;white-space:normal}.tool:hover .hc{display:block}
  .hc .hh{display:flex;align-items:center;gap:8px}.hc .hh b{font-size:12px}.hc .hh .sub{font-size:11px;color:#737373}.hc .hh img{width:36px;height:36px;border-radius:6px;object-fit:cover;margin-left:auto}
  .hc hr{border:0;border-top:1px solid var(--border);margin:8px 0}.hc .lb{font-size:11px;color:#737373}.hc .vl{font-size:12px;margin-top:2px;font-family:ui-monospace,monospace}.hc .ln{display:flex;gap:8px;font-size:12px;padding:2px 0}.hc .ln b{margin-left:auto;font-weight:600;color:#13a269}
  .sysl{align-self:center;font-size:12px;color:#525252;text-align:center;max-width:80%;line-height:1.35;margin:1px 0;flex:none}.sysl b{font-weight:600;color:#171717}
  .cmt{align-self:center;width:100%;max-width:600px;background:#fefce8;border:1px dashed #e7c872;border-radius:14px;padding:12px 14px;flex:none}
  .cmt .ch{display:flex;align-items:center;gap:7px;font-size:12px;padding-bottom:8px;border-bottom:1px dashed #e7c872;margin-bottom:8px}.cmt .ch svg.i{width:13px;height:13px;color:#9a6208}.cmt .ch b{font-weight:600}.cmt .ch .d{margin-left:auto;color:#737373;font-size:11px}
  .cmt .cb{font-size:12.5px;line-height:1.4;white-space:pre-wrap;word-break:break-word}
  .dvd{align-self:stretch;display:flex;align-items:center;gap:10px;font-size:11px;color:#737373;flex:none}.dvd::before,.dvd::after{content:"";flex:1;border-top:1px solid rgba(0,0,0,.12)}
  .cdiv{align-self:center;position:sticky;top:-8px;z-index:3;background:#fff;border:1px solid var(--border);border-radius:999px;padding:2px 12px;font-size:11px;box-shadow:0 1px 2px rgba(0,0,0,.06);flex:none}
  .tkt{align-self:center;display:inline-flex;gap:6px;align-items:center;font-size:11.5px;color:#525252;flex:none}.tkt svg.i{width:13px;height:13px}
  .more{align-self:center;font-size:12px;color:#737373;text-decoration:underline;text-underline-offset:2px;flex:none}
  .hov{display:flex;gap:2px;opacity:0;transition:opacity .15s;align-self:center}.mrow:hover .hov{opacity:1}.hov button{width:24px;height:24px;border-radius:7px;display:grid;place-items:center;color:#525252}.hov button:hover:not([disabled]){background:rgba(0,0,0,.06)}.hov button[disabled]{opacity:.4}.hov svg.i{width:14px;height:14px}
  .typing{display:inline-flex;gap:3px;padding:11px 13px;border-radius:14px;align-self:flex-end;background:#d9fdd3;box-shadow:0 1px 1px rgba(0,0,0,.05);flex:none}.typing i{width:5px;height:5px;border-radius:50%;background:#5b7a63;animation:typing-wave 1.2s infinite}.typing i:nth-child(2){animation-delay:.15s}.typing i:nth-child(3){animation-delay:.3s}
  .fab{position:absolute;right:18px;bottom:96px;width:32px;height:32px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);display:grid;place-items:center;z-index:5;animation:pop-in .15s both}
  .ib-bot{position:absolute;left:0;right:0;bottom:14px;display:flex;justify-content:center;pointer-events:none;padding:0 20px;z-index:4}.ib-bot>*{pointer-events:auto}
  .pill48{display:flex;align-items:center;gap:10px;min-width:442px;max-width:620px;background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.08),0 8px 24px rgba(0,0,0,.12);padding:10px;animation:os-enter .25s both}
  .pill48 .sum{font-size:12px;color:#737373;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pill48 .vr{width:1px;height:20px;background:var(--border);flex:none}
  .pill48 .ah{display:flex;align-items:center;gap:8px;font-size:12px;position:relative}.pill48 .ah b{font-weight:600}.pill48 .ah .dot{position:absolute;left:16px;bottom:-1px;width:8px;height:8px;border-radius:50%;background:#13a269;border:2px solid #fff}
  .win{display:flex;align-items:center;gap:10px;min-width:442px;max-width:620px;background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.08),0 8px 24px rgba(0,0,0,.12);padding:10px;animation:os-enter .25s both}
  .win .lk{width:32px;height:32px;border-radius:10px;background:#fff2f0;color:#e03a3a;display:grid;place-items:center;flex:none}.win .t1{font-size:12px;font-weight:600}.win .t2{font-size:12px;color:#737373}
  .comp{width:min(620px,100%);background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.1),0 8px 24px rgba(0,0,0,.12);animation:os-enter .25s both}
  .comp .ch{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:12px;border-bottom:1px solid var(--border)}.comp .ch .x{color:#737373}
  .comp textarea{display:block;width:100%;border:0;outline:0;resize:none;padding:10px 12px;font:13px var(--font);min-height:54px;background:transparent}
  .comp .cb{display:flex;align-items:center;gap:4px;padding:6px 8px;border-top:1px solid var(--border)}
  .tplc{display:flex;gap:10px;padding:10px;border:1px solid var(--border);border-radius:10px;cursor:pointer;transition:border-color .15s,background-color .15s;text-align:left;width:100%}.tplc:hover{background:#fafafa}.tplc.on{border-color:#0a0a0a;box-shadow:0 0 0 1px #0a0a0a inset}
  .tplc .tn{font-size:12px;font-weight:600}.tplc .tb{font-size:12px;color:#525252;margin-top:2px;line-height:1.35}
  .cpop{max-height:357px;overflow:auto;margin:-4px}.cpop .ph{padding:10px 12px;font-size:12px;font-weight:600;border-bottom:1px solid var(--border);position:sticky;top:0;background:#fff}
  .cpop .cr{display:flex;gap:8px;padding:9px 12px;border-bottom:1px solid var(--border)}.cpop .cr .a{font-size:12px;font-weight:600}.cpop .cr .d{margin-left:auto;font-size:11px;color:#737373;white-space:nowrap}.cpop .cr .x{font-size:12px;color:#525252;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin-top:2px;white-space:pre-wrap}
  /* right column */
  .ib-r{border-left:1px solid var(--border);overflow:auto;background:#fafafa;padding:12px;display:flex;flex-direction:column;gap:12px;min-height:0}
  .rc{background:#fff;border-radius:14px;box-shadow:0 0 0 1px rgba(10,10,10,.08)}.rc .rh{display:flex;align-items:center;padding:12px 14px 6px}.rc .rh b{font-size:13px;font-weight:600;flex:1}.rc .rb{padding:2px 14px 14px;font-size:12px;line-height:1.5}
  .rc .up{font-size:11px;color:#737373;margin-top:8px}
  .ev{display:flex;gap:8px;align-items:flex-start;padding:4px 0 18px;position:relative;animation:os-enter .3s both}.ev:not(:last-child)::before{content:"";position:absolute;left:49px;top:30px;bottom:-4px;border-left:1px solid #ececec}
  .ev .et{width:36px;font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:#737373;padding-top:5px;flex:none}.ev .eg{width:26px;height:26px;border-radius:8px;background:#f1f1f1;display:grid;place-items:center;color:#737373;flex:none}.ev .eg svg.i{width:13px;height:13px}.ev .ex{font-size:12px;line-height:1.4;padding-top:4px}
  .dh{font-size:12px;color:#737373;margin:6px 0 4px}
  /* email layout */
  .eml{flex:1;overflow:auto;padding:0 28px 28px;background:#fff}.eml .eh{display:flex;align-items:center;gap:12px;padding:6px 0 14px}.eml .chips{display:flex;gap:6px;align-items:center;margin-top:3px}
  .echip{display:inline-flex;align-items:center;gap:4px;height:20px;padding:0 8px;border-radius:999px;font-size:11px;font-weight:500;background:#fff7e6;color:#9a6208}.echip.m{background:#f4f4f5;color:#404040;font-family:ui-monospace,monospace}.echip.t{background:#f0f8ff;color:#2563eb;border:1px dotted #bce4fc}
  .emc{border:1px solid var(--border);border-radius:14px;padding:14px 16px}.emc .eh2{display:flex;align-items:center;gap:8px;font-size:12px}.emc .eh2 .d{color:#737373}
  .turn{font-size:12.5px;line-height:1.5;margin-top:6px}.turn b{font-weight:600}
  .vmc{border:1px solid var(--border);border-radius:16px;padding:12px;margin-top:12px;min-width:260px;box-shadow:0 1px 2px rgba(0,0,0,.04)}
  .rep{border:1px solid var(--border);border-radius:14px;margin-top:16px;background:#fff}.rep textarea{width:100%;border:0;outline:0;resize:none;min-height:70px;padding:10px 12px;font:13px var(--font)}
  /* order intake dialog */
  .oi-b{display:flex;gap:8px;align-items:flex-start;background:#f0f8ff;border:1px solid #bce4fc;color:#1d4ed8;border-radius:10px;padding:8px 10px;font-size:12px;margin-bottom:12px}
  .oi-r{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);font-size:12.5px}.oi-r:last-child{border:0}.oi-r .n{color:#737373;width:16px}.oi-r .l{flex:1;min-width:0;font-weight:500}
  .stp{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:8px;height:26px}.stp button{width:24px;height:24px;display:grid;place-items:center}.stp button:hover{background:#f5f5f5}.stp span{min-width:34px;text-align:center;font-variant-numeric:tabular-nums}
  `;
  document.head.appendChild(st);

  /* ───────────────────────── helpers ───────────────────────── */
  const S = () => D.S;
  const U = () => {
    if (!D.ui.inbox || D.ui.inbox.uc !== D.uc) D.ui.inbox = { uc: D.uc, sel: null, tab: 'all', q: '', sort: 'new', num: 'all', panel: true, all: false, seen: {}, rows: {}, holding: new Set(), q2: [], typing: false, loaded: false, divs: {}, draft: {}, reply: {}, tpl: null, play: null, first: true, lastSel: null };
    return D.ui.inbox;
  };
  const th = () => S().threads || [];
  const msx = (v) => (typeof v === 'number' ? v : Date.parse(v));
  const now = () => D.now().getTime();
  const IST = 19800000;
  const parts = (ms) => { const d = new Date(ms + IST); return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: d.getUTCDay(), day: Math.floor((ms + IST) / 864e5) }; };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'], MONL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hm12 = (ms) => { const p = parts(ms); const h = p.h % 12 || 12; return h + ':' + String(p.mi).padStart(2, '0') + (p.h >= 12 ? 'pm' : 'am'); };
  const hm24 = (ms) => { const p = parts(ms); return String(p.h).padStart(2, '0') + ':' + String(p.mi).padStart(2, '0'); };
  const dayDiff = (ms) => parts(now()).day - parts(ms).day;
  const listTime = (ms) => { const dd = dayDiff(ms); if (dd <= 0) return hm12(ms); if (dd === 1) return 'Yesterday'; if (dd < 7) return WD[parts(ms).wd]; const p = parts(ms); return p.d + ' ' + MON[p.m]; };
  const cmtTime = (ms) => { const dd = dayDiff(ms), p = parts(ms); if (dd <= 0) return 'Today, ' + hm12(ms); if (dd === 1) return 'Yesterday, ' + hm12(ms); if (dd < 7) return WD[p.wd] + ', ' + hm12(ms); return p.d + ' ' + MON[p.m] + ', ' + hm12(ms); };
  const longDay = (ms) => { const p = parts(ms); return p.d + ' ' + MONL[p.m] + ' ' + p.y; };
  const iso = (ms) => new Date(ms).toISOString();
  const CHAT = { text: 1, image: 1, audio: 1, file: 1, template: 1, call: 1 };
  const U_ = () => S().users || [];
  const user = (id) => U_().find((u) => u.id === id);
  const uname = (id) => (user(id) || {}).name || id;
  const party = (t) => (S().parties || []).find((p) => p.id === t.partyId);
  const contact = (t) => (S().contacts || []).find((c) => c.id === t.contactId);
  const phoneOf = (t) => t.phone || (contact(t) || {}).phone || (party(t) || {}).phone || '';
  const nameOf = (t) => t.name || (party(t) && !/^\+?\d/.test(party(t).name) ? party(t).name : null) || (contact(t) && !/^\+?\d/.test(contact(t).name) ? contact(t).name : null) || phoneOf(t);
  const subOf = (t) => { if (t.subName != null) return t.subName; const c = contact(t); const n = nameOf(t); return c && c.name && c.name !== n && !/^\+?\d/.test(c.name) ? c.name : ''; };
  const chatMsgs = (t) => t.messages.filter((m) => CHAT[m.type]);
  const lastChat = (t) => { const c = chatMsgs(t); return c[c.length - 1]; };
  const lastIn = (t) => { const c = chatMsgs(t).filter((m) => m.from === 'customer'); return c[c.length - 1]; };
  const windowLeft = (t) => { const li = lastIn(t); return li ? msx(li.at) + 864e5 - now() : -1; };
  const windowClosed = (t) => t.channel === 'email' || windowLeft(t) <= 0;
  const isOut = (m) => m.from !== 'customer' && m.from !== 'system';
  const holder = (t) => (t.owner === 'anuma' ? 'anuma' : t.owner);
  const firstName = (t) => { const c = contact(t); const n = (c && c.name) || ''; if (n && !/^\+?\d/.test(n)) return n.split(/\s+/)[0]; const pn = nameOf(t); return /^\+?\d/.test(pn) ? pn : pn.split(/\s+/)[0]; };
  const stripMd = (s) => String(s).replace(/\*\*/g, '');
  const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const caseTag = (t) => (D.uc === 'stuffcool' ? t.caseNo : t.caseNo);
  const mark = (ring, size) => `<span class="amk ${ring ? 'ring' : ''}" ${size ? `style="width:${size}px;height:${size}px"` : ''}><svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#0a0a0a"/><circle cx="11" cy="16" r="2.3" fill="#fff"/><rect x="15" y="13.8" width="8.5" height="4.4" rx="2.2" fill="#fff"/></svg></span>`;
  const waGlyph = `<svg class="wa" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
  const ticks = (k) => (k === 'sent' ? `<span class="tick">${I('check')}</span>` : `<span class="tick ${k === 'read' ? 'read' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 12 5 5L18 6"/><path d="m12 15 1.5 1.5L22 7"/></svg></span>`);
  const photo = (id, cls = 'sm') => { const u = user(id); return D.avatar(u ? u.name : String(id), cls, { org: false }); };
  const authorAvatar = (by) => (by === 'Anuma' || by === 'System' ? (by === 'Anuma' ? mark(false, 24) : `<span class="eg" style="width:24px;height:24px;border-radius:8px;background:#f1f1f1;display:grid;place-items:center;color:#737373">${I('settings')}</span>`) : user(by) ? photo(by) : D.avatar(by, 'sm'));
  const authorName = (by) => (user(by) ? user(by).name : by);

  /* case-list model */
  const statusOf = (t) => t.status || 'open';
  const view = () => {
    const u = U(); let L = th().slice();
    if (u.num !== 'all') L = L.filter((t) => t.numberId === u.num);
    const tabs = { open: 'open', escalated: 'escalated', closed: 'closed' };
    if (tabs[u.tab]) L = L.filter((t) => statusOf(t) === u.tab);
    const q = u.q.trim().toLowerCase(); if (q) L = L.filter((t) => (t.caseNo + ' ' + nameOf(t) + ' ' + subOf(t) + ' ' + phoneOf(t)).toLowerCase().includes(q) || phoneOf(t).replace(/\D/g, '').includes(q.replace(/\D/g, '') || '§'));
    L.sort((a, b) => (u.sort === 'new' ? msx(b.lastAt) - msx(a.lastAt) : msx(a.lastAt) - msx(b.lastAt)));
    return L;
  };
  const selected = () => { const u = U(); const q = D.query(); const want = q.get('thread') || q.get('case'); if (want && (u.sel !== want || u._q !== want)) { u._q = want; const t = th().find((x) => x.id === want || x.caseNo === want); if (t) u.sel = t.id; } let t = th().find((x) => x.id === u.sel); if (!t) { const L = view(); t = L[0]; u.sel = t ? t.id : null; } return t; };
  const preview = (t) => {
    const m = lastChat(t); if (!m) return ''; const out = isOut(m); let tx = '';
    if (m.type === 'text') tx = m.text.split('\n')[0]; else if (m.type === 'image') tx = m.caption || 'Photo'; else if (m.type === 'audio') tx = 'Voice message'; else if (m.type === 'file') tx = 'Document'; else if (m.type === 'template') tx = m.name || 'Template'; else if (m.type === 'call') tx = 'customer: ' + ((m.turns || []).find((x) => x.who === 'customer') || { text: '' }).text;
    return `${out ? `<span class="tick" style="width:14px;height:14px;display:inline-flex">${I('check').replace('class="i "', 'class="i" style="width:14px;height:14px"')}</span>` : ''}<span>${esc(tx)}</span>`;
  };
  const slaPill = (t) => {
    if (t.status === 'closed') return ''; let ms;
    if (D.uc === 'stuffcool') { const w = windowLeft(t); if (w <= 0) return ''; ms = w; const h = Math.floor(ms / 36e5), mi = Math.floor((ms % 36e5) / 6e4); return `<span class="slap" title="WhatsApp 24-hour window">${I('clock')}${h}:${String(mi).padStart(2, '0')} left</span>`; }
    if (!t.slaDueAt) return ''; ms = msx(t.slaDueAt) - now(); const a = Math.abs(ms), h = Math.floor(a / 36e5), mi = Math.floor((a % 36e5) / 6e4);
    return `<span class="slap ${ms < 0 ? 'over' : ''}">${I('clock')}${h}:${String(mi).padStart(2, '0')} ${ms < 0 ? 'over' : 'left'}</span>`;
  };
  const rowHtml = (t, sel) => {
    const s = statusOf(t); const n = nameOf(t), sb = subOf(t);
    const who = s === 'closed' ? '' : t.owner === 'anuma' ? mark(true) : photo(t.owner, 'sm');
    return `<div class="crow ${sel && sel.id === t.id ? 'on' : ''} ${s === 'escalated' ? 'esc' : ''}" data-act="ib-open" data-arg="${esc(t.id)}" data-cid="${esc(t.id)}">
      <div class="r1"><span class="cchip ${s}"><i></i>${esc(caseTag(t))}</span>${slaPill(t)}${t.unread ? `<span class="uchip" style="margin-left:auto">${t.unread}</span><span class="tm" style="margin-left:6px">${listTime(msx(t.lastAt))}</span>` : `<span class="tm">${listTime(msx(t.lastAt))}</span>`}</div>
      <div class="nm"><b>${esc(n)}</b>${sb ? `<span>, ${esc(sb)}</span>` : ''}</div><div class="pv">${preview(t)}</div><span class="who">${who}</span></div>`;
  };

  /* ───────────────────────── messages ───────────────────────── */
  const quoteHtml = (q) => (q ? `<span class="qt"><b>${esc(q.who)}</b><span>${esc(q.text)}</span></span>` : '');
  const reactionHtml = (m) => (m.reaction ? `<span class="rx">${m.reaction}</span>` : '');
  const outAvatar = (m) => `<span class="mav">${m.from === 'anuma' ? mark(false, 24) : photo(m.from)}</span>`;
  const lastPromptId = (t) => { const ms = t.messages; for (let i = ms.length - 1; i >= 0; i--) { const m = ms[i]; if (m.type === 'text' && m.buttons) { const later = ms.slice(i + 1).some((x) => x.from === 'customer' && CHAT[x.type]); return later ? null : m.id; } } return null; };
  const hoverActs = (t, m) => { const closed = windowClosed(t); const tt = closed ? ' title="React — WhatsApp\'s 24-hour window is closed — the customer has to message first"' : ''; return `<span class="hov"><button data-act="ib-react" data-arg="${esc(m.id)}" ${closed ? 'disabled' : ''} ${closed ? tt : 'title="React"'}>${I('star')}</button><button data-act="ib-reply" data-arg="${esc(m.id)}" ${closed ? 'disabled' : ''} title="${closed ? "Reply — WhatsApp's 24-hour window is closed" : 'Reply to this message'}">${I('arrowL')}</button></span>`; };
  const msgHtml = (t, m, ctx) => {
    const hold = U().holding.has(m.id) ? ' ib-hold' : ''; const T = hm12(msx(m.at)); const mid = `data-mid="${esc(m.id)}"`;
    switch (m.type) {
      case 'system': return `<div class="sysl${hold}" ${mid}>${md(m.text)}</div>`;
      case 'comment': return `<div class="cmt${hold}" ${mid}><div class="ch">${I('chat')}<b>${esc(authorName(m.by))}</b><span class="muted">Comment</span><span class="d">${cmtTime(msx(m.at))}</span></div><div class="cb">${esc(m.text)}</div></div>`;
      case 'tool': return `<div class="tool${hold}" ${mid}>${I('clock').replace('class="i "', 'class="i"')}<span class="tx">${esc(m.agent)} performed <b>${esc(m.tool)}</b>${m.detail ? ' ' + esc(m.detail) : ''}</span><span class="term">&gt;_</span>${m.hover ? `<div class="hc"><div class="hh"><span class="term" style="border:0;background:#f1f1f1">&gt;_</span><div><b>${esc(m.hover.head || 'What ' + m.agent + ' read')}</b><div class="sub">${esc(m.hover.sub || '')}</div></div>${m.hover.thumb ? `<img src="${m.hover.thumb}" alt="">` : ''}</div><hr>${m.hover.label ? `<div class="lb">${esc(m.hover.label)}</div>` : ''}${m.hover.value ? `<div class="vl">${esc(m.hover.value)}</div>` : ''}${(m.hover.lines || []).map((l) => `<div class="ln"><span>${esc(l.name)}</span><b>${l.conf}%</b></div>`).join('')}</div>` : ''}</div>`;
      case 'image': {
        const out = isOut(m); const img = `<div class="imgwrap"><div class="imgb" data-act="ib-img" data-arg="${esc(m.id)}"><img src="${m.src}" alt=""><span class="mt">${T}</span></div>${m.label ? `<span class="lblchip" style="position:absolute;left:8px;top:8px">${esc(m.label)}</span>` : ''}${reactionHtml(m)}</div>`;
        return `<div class="mrow ${out ? 'out' : ''}${hold}" ${mid}>${out ? hoverActs(t, m) : ''}${img}${out ? outAvatar(m) : ''}</div>`;
      }
      case 'audio': case 'file': case 'template': case 'text': {
        const out = isOut(m); let body = '';
        if (m.type === 'text') body = quoteHtml(m.quote) + esc(m.text);
        else if (m.type === 'template') body = `<div class="b" style="font-weight:600;margin-bottom:2px">${esc(m.name || 'Template')}</div>${esc(m.text)}`;
        else if (m.type === 'file') body = `<div class="doc"><span class="di">${I('file')}</span><div class="grow"><div class="dn">${esc(m.name)}</div><div class="ds">${esc(m.size || '')}</div></div><span class="muted">${I('download')}</span></div>`;
        else body = quoteHtml(m.quote) + audioHtml(m);
        const emoji = m.type === 'text' && /^\p{Extended_Pictographic}{1,3}$/u.test(m.text.trim());
        const btnsOn = m.id === ctx.promptId; const btns = m.buttons ? `<div class="btns">${m.buttons.map((b) => `<button data-act="ib-btn" data-arg="${esc(m.id)}|${esc(b)}" ${btnsOn ? '' : 'disabled'}>${esc(b)}</button>`).join('')}</div>` : '';
        const tk = out ? ticks(m.ticks || 'read') : '';
        return `<div class="mrow ${out ? 'out' : ''}${hold}" ${mid}>${out ? hoverActs(t, m) : ''}<div class="bub ${out ? 'out' : ''} ${emoji ? 'emoji' : ''}">${body}${m.type === 'text' || m.type === 'template' ? `<span class="mt">${T}${tk}</span>` : `<span class="mt" style="float:none;display:block;text-align:right;margin-top:4px">${T}${tk}</span>`}${btns}${reactionHtml(m)}</div>${out ? outAvatar(m) : ''}</div>`;
      }
      default: return '';
    }
  };
  const fmtDur = (s) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const waveBars = (id, frac) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return Array.from({ length: 26 }, (_, i) => { h = (h * 1103515245 + 12345) >>> 0; const v = 4 + (h >> 8) % 14; return `<i class="${i / 26 < frac ? 'on' : ''}" style="height:${v}px"></i>`; }).join(''); };
  const playState = (m) => { const p = U().play; if (!p || p.id !== m.id) return { cur: 0, frac: 0, on: false }; const cur = Math.min(m.seconds, (Date.now() - p.t0) / 1000); return { cur, frac: cur / m.seconds, on: cur < m.seconds }; };
  const audioHtml = (m) => { const ps = playState(m); return `<div class="ap" data-ap="${esc(m.id)}"><button class="pl" data-act="ib-play" data-arg="${esc(m.id)}" title="${ps.on ? 'Pause' : 'Play'}">${I(ps.on ? 'pause' : 'play')}</button><div class="wave">${waveBars(m.id, ps.frac)}</div><span class="tm">${fmtDur(ps.cur)} / ${fmtDur(m.seconds)}</span></div>`; };

  const streamHtml = (t) => {
    const u = U(); const ctx = { promptId: lastPromptId(t) }; let out = '';
    let msgs = t.messages.slice(); let more = '';
    if (u.all) {
      const others = th().filter((x) => x.id !== t.id && ((t.partyId && x.partyId === t.partyId) || (!t.partyId && phoneOf(x) === phoneOf(t)))).sort((a, b) => msx(a.openedAt) - msx(b.openedAt));
      out += `<div class="more">Scroll up to load older messages</div>`;
      others.forEach((o) => { out += `<div class="cdiv">Case #${esc(o.caseNo)}</div><div class="tkt">${I('receipt')}#${esc(o.caseNo)} · ${longDayShort(msx(o.openedAt))}</div>` + o.messages.map((m) => msgHtml(o, m, { promptId: null })).join(''); });
      out += `<div class="cdiv">Case #${esc(t.caseNo)}</div>`;
    } else if (msgs.length > 60) { msgs = msgs.slice(-60); more = `<button class="more" data-act="ib-earlier">Show earlier conversation</button>`; }
    out += more;
    const div = u.divs[D.uc + ':' + t.id]; let divAt = -1;
    if (div) { let c = 0; for (let i = msgs.length - 1; i >= 0; i--) { if (CHAT[msgs[i].type] && msgs[i].from === 'customer') { c++; if (c === div) { divAt = i; break; } } } }
    msgs.forEach((m, i) => { if (i === divAt) out += `<div class="dvd">${div} unread message${div > 1 ? 's' : ''}</div>`; out += msgHtml(t, m, ctx); });
    if (u.typing) out += typingHtml();
    return out;
  };
  const longDayShort = (ms) => { const p = parts(ms); return p.d + ' ' + MON[p.m] + ' ' + p.y + ', ' + hm12(ms).replace(/(am|pm)/, ' $1'); };
  const typingHtml = () => `<div class="mrow out" id="ib-typing"><div class="typing"><i></i><i></i><i></i></div><span class="mav">${mark(false, 24)}</span></div>`;

  /* ───────────────────────── columns ───────────────────────── */
  const aiSummary = (t) => {
    if (D.uc !== 'newhome' || t.noSummary) return ''; const ov = (S().aiSummaries || {})[t.id]; const L = t.lines || [];
    const nm = firstName(t); let s;
    const noMatch = L.filter((l) => l.state === 'flagged').length, noQty = L.filter((l) => l.qty == null).length;
    if (ov) s = ov;
    else if (!L.length) { if (t.status === 'escalated') s = 'One human task is waiting on this case.'; else return ''; }
    else {
      const need = []; if (noMatch) need.push(noMatch + ' product match' + (noMatch > 1 ? 'es' : '')); if (noQty) need.push(noQty + ' quantit' + (noQty > 1 ? 'ies' : 'y'));
      s = `${nm} has ${L.length} requested item${L.length > 1 ? 's' : ''}. `;
      if (need.length) s += `Still needed: ${need.join(' · ')}. ` + (t.status === 'closed' ? 'The case is closed.' : `Anuma will ask ${nm} for the rest.`);
      else s += 'The product, quantity and unit details are captured. ' + (t.status === 'closed' ? 'The case is closed.' : 'Anuma has the case.');
      if (t.status === 'escalated' && noMatch) s += ' 1 human task remains.';
    }
    const at = msx(t.lastAt), p = parts(at);
    return `<div class="rc"><div class="rh"><b>AI summary</b>${D.icoTile('sparkle')}</div><div class="rb">${esc(s)}<div class="up">Updated ${p.d} ${MON[p.m].slice(0, 3)} · ${hm12(at).replace(/(am|pm)/, ' $1')}</div></div></div>`;
  };
  const eventsOf = (t) => t.messages.filter((m) => m.type === 'system').map((m) => { const plain = m.act || stripMd(m.text); const bold = (m.text.match(/\*\*(.+?)\*\*/) || [])[1] || 'System'; return { at: msx(m.at), text: plain, actor: /^Case /.test(plain) ? 'System' : bold }; }).sort((a, b) => b.at - a.at);
  const activityHtml = (t) => {
    const ev = eventsOf(t); const days = []; ev.forEach((e) => { const k = parts(e.at).day; let g = days.find((x) => x.k === k); if (!g) days.push((g = { k, at: e.at, rows: [] })); g.rows.push(e); });
    return `<div class="rc"><div class="rh"><b>Activity</b>${D.icoTile('history')}</div><div class="rb" style="padding-top:0">${days.map((g) => `<div class="dh">${longDay(g.at)}</div>${g.rows.map((e) => `<div class="ev" data-eid="${e.at}-${esc(e.text.slice(0, 12))}"><span class="et">${hm24(e.at)}</span><span class="eg">${e.actor !== 'System' && e.actor !== 'Anuma' && (S().users || []).find((u) => u.name === e.actor) ? D.avatar(e.actor, 'sm') : I('settings')}</span><span class="ex">${esc(e.text)}</span></div>`).join('')}`).join('') || '<div class="muted">No activity yet.</div>'}</div></div>`;
  };

  const headerHtml = (t) => {
    const cmts = t.messages.filter((m) => m.type === 'comment').length; const s = statusOf(t); const u = U();
    const ICON = { open: 'clock', escalated: 'alert', closed: 'check' };
    const sBtn = s === 'closed' ? `<button class="btn outline sm" style="height:28px;opacity:.55;cursor:not-allowed" disabled title="This case is closed — it reopens on its own if the customer writes again">${I('check')} Closed ${I('chevD')}</button>` : `<button class="btn outline sm" style="height:28px" data-act="ib-status">${I(ICON[s])} ${s === 'escalated' ? 'Escalated' : 'Open'} ${I('chevD')}</button>`;
    return `<div class="ib-h"><div class="grow" style="min-width:0"><div class="tt">${esc(nameOf(t))}${subOf(t) ? `<span>${esc(subOf(t))}</span>` : ''}</div><div class="mt2"><span class="mono">${esc(phoneOf(t).replace(/^\+/, ''))}</span><i></i><span class="mono">${esc(t.caseNo)}</span>${u.typing ? `<span class="typingtxt">${esc(t.owner === 'anuma' ? (D.uc === 'stuffcool' ? 'Order Desk' : 'Anuma') : uname(t.owner))} is typing…</span>` : ''}</div></div>
      ${cmts ? `<button class="btn outline sm" style="height:28px" data-act="ib-cmts" title="${cmts} comments on this case — internal, never sent to the customer">${I('file')} ${cmts} comment${cmts > 1 ? 's' : ''}</button>` : ''}
      ${sBtn}<button class="btn sm ${u.all ? '' : 'outline'}" style="height:28px" data-act="ib-all" title="Show every message on this thread">${I(u.all ? 'x' : 'history')} ${u.all ? 'Close all orders' : 'View all orders'}</button>
      <button class="btn ghost icon sm" style="width:28px;height:28px" data-act="ib-panel" title="${u.panel ? 'Hide details' : 'Show details'}" aria-label="${u.panel ? 'Hide details' : 'Show details'}">${I('sidebar')}</button></div>`;
  };

  const bottomHtml = (t) => {
    const u = U();
    if (windowClosed(t)) { const li = lastIn(t); const who = (contact(t) && contact(t).name && !/^\+?\d/.test(contact(t).name) ? contact(t).name : phoneOf(t)); const ms = li ? msx(li.at) : msx(t.lastAt); const dd = dayDiff(ms); const when = hm12(ms) + (dd === 0 ? '' : dd === 1 ? ' yesterday' : ' on ' + WD[parts(ms).wd] + ' ' + parts(ms).d + ' ' + MON[parts(ms).m]); return `<div class="win"><span class="lk">${I('lock')}</span><div class="grow"><div class="t1">24-hour window closed</div><div class="t2">${esc(who)} last wrote at ${when}. Free text will not be delivered.</div></div><button class="btn sm" style="height:28px" data-act="ib-tpl">${I('file')} Send a template</button></div>`; }
    if (t.owner === 'anuma') {
      const L = t.lines || []; const nm = L.filter((l) => l.state === 'flagged').length; const sum = L.length ? `${L.length} item${L.length > 1 ? 's' : ''}${nm ? ` · ${nm} to match` : ''}` : 'No summary';
      const agent = D.uc === 'stuffcool' ? 'Order Desk' : 'Anuma';
      return `<div class="pill48"><span class="sum">${esc(sum)}</span><span class="vr"></span><span class="ah">${mark(false, 24)}<i class="dot"></i><span><b>${agent}</b> <span class="muted">handling</span></span></span><button class="btn sm" style="height:28px" data-act="ib-take" title="Take this case off ${agent} and handle it yourself">${I('user')} Take over</button><button class="btn outline sm icon" style="width:28px;height:28px" data-act="ib-details" title="View details" aria-label="View details">${I('clipboard')}</button><button class="btn ghost sm icon" style="width:28px;height:28px" data-act="ib-more" title="More">${I('more')}</button></div>`;
    }
    if (t.owner !== ME) return `<div class="pill48"><span class="ah">${photo(t.owner)}<span><b>${esc(uname(t.owner))}</b> <span class="muted">has this case</span></span></span><span class="sum"></span><button class="btn sm" style="height:28px" data-act="ib-take">${I('user')} Take over</button><button class="btn ghost sm icon" style="width:28px;height:28px" data-act="ib-more" title="More">${I('more')}</button></div>`;
    const left = windowLeft(t), h = Math.floor(left / 36e5), mi = Math.floor((left % 36e5) / 6e4); const rp = u.reply[D.uc + ':' + t.id];
    return `<div class="comp"><div class="ch">${photo(ME)}<span>Replying as <b>You</b></span><span class="muted">·</span><span class="muted" style="display:inline-flex;gap:4px;align-items:center">${I('clock').replace('class="i "', 'class="i" style="width:12px;height:12px"')} ${h}h ${String(mi).padStart(2, '0')}m left</span><span class="grow"></span><button class="btn ghost sm" style="height:24px" data-act="ib-hand">${I('rotate')} Hand back</button><button class="btn ghost sm icon x" style="width:24px;height:24px" data-act="ib-hand" title="Hand back to Anuma">${I('x')}</button></div>${rp ? `<div style="padding:8px 12px 0"><span class="qt" style="margin:0"><b>Replying to ${esc(rp.who)}</b><span>${esc(rp.text)}</span></span></div>` : ''}<textarea data-input="ib-draft" placeholder="Write your message here…" rows="2">${esc(u.draft[D.uc + ':' + t.id] || '')}</textarea><div class="cb"><button class="btn ghost sm icon" style="width:28px;height:28px" disabled title="Attachments — coming soon">${I('paperclip')}</button><button class="btn ghost sm icon" style="width:28px;height:28px" disabled title="Emoji — coming soon">${I('star')}</button><button class="btn ghost sm icon" style="width:28px;height:28px" disabled title="Voice — coming soon">${I('mic')}</button><span class="grow"></span><button class="btn outline sm" style="height:28px" data-act="ib-tpl">${I('file')} Templates</button><button class="btn sm" style="height:28px" data-act="ib-send" id="ib-sendbtn">${I('send')} Send</button></div></div>`;
  };

  const emailHtml = (t) => {
    const m = chatMsgs(t).find((x) => x.type === 'call') || { turns: [], seconds: 60 }; const T = msx(m.at);
    return `<div class="eml"><div class="eh">${D.avatar(phoneOf(t), 'lg', { org: true })}<div class="grow"><div class="b" style="font-size:14px">${esc(nameOf(t))}</div><div class="chips"><span class="echip">${I('mail').replace('class="i "', 'class="i" style="width:11px;height:11px"')} Email</span><span class="echip m">#${esc(t.caseNo)}</span>${(t.tags || []).map((g) => `<span class="echip t">${esc(g)}</span>`).join('')}</div></div><button class="btn ghost icon sm" title="Snooze">${I('clock')}</button><button class="btn ghost icon sm">${I('mail')}</button><button class="btn outline sm">${I('phone')} Phone Call</button></div>
      <div class="emc"><div class="eh2"><b>${esc(phoneOf(t))}</b><span class="muted">&lt; ${esc(phoneOf(t))} &gt;</span><span class="d">${longDayShort(T)}</span></div>${(m.turns || []).map((x) => `<div class="turn"><b>${x.who === 'customer' ? 'customer' : 'agent'}:</b> ${esc(x.text)}</div>`).join('')}<div class="vmc">${audioHtml({ id: m.id, seconds: m.seconds })}</div></div>
      <div class="rep"><div style="padding:10px 12px 0;font-size:12px" class="muted">Replying as <b style="color:#171717">You</b></div><textarea placeholder="Write your reply here…" disabled></textarea><div class="cb" style="display:flex;gap:4px;padding:6px 8px;border-top:1px solid var(--border)"><button class="btn ghost sm icon" disabled>${I('paperclip')}</button><span class="grow"></span><button class="btn sm" disabled>${I('send')} Send</button></div></div></div>`;
  };

  /* ───────────────────────── page ───────────────────────── */
  const numLabel = () => { const u = U(); if (u.num === 'all') return 'All numbers'; const n = (S().numbers || []).find((x) => x.id === u.num); return n ? n.label : 'All numbers'; };
  const render = () => {
    if (D.uc === 'rfq') { setTimeout(() => D.go('/dashboard'), 0); return ''; }
    const u = U(); const sel = selected(); const L = view();
    // capture scroll of the old DOM before replacement
    const oldS = document.getElementById('ib-stream'), oldL = document.querySelector('.ib-list');
    u.keep = { stream: oldS ? { top: oldS.scrollTop, bottom: oldS.scrollHeight - oldS.scrollTop - oldS.clientHeight < 60, id: oldS.dataset.tid } : null, list: oldL ? oldL.scrollTop : 0 };
    if (sel && u.lastSel !== sel.id) { if (sel.unread) { u.divs[D.uc + ':' + sel.id] = sel.unread; } else delete u.divs[D.uc + ':' + sel.id]; }
    const dist = th().filter((t) => u.num === 'all' || t.numberId === u.num).length;
    const counts = { all: L.length };
    const tabs = [{ key: 'all', label: 'All' }, { key: 'open', label: 'Open' }, { key: 'escalated', label: 'Escalated' }, { key: 'closed', label: 'Closed' }];
    const list = !u.loaded ? Array.from({ length: 6 }, () => `<div class="ib-skel"><div class="shimmer" style="height:18px;width:110px;border-radius:9px"></div><div class="shimmer" style="height:12px;width:70%"></div><div class="shimmer" style="height:12px;width:90%"></div></div>`).join('')
      : L.length ? L.map((t) => rowHtml(t, sel)).join('') : `<div class="ib-empty">${D.icoTile('search', 'lg')}<div class="b" style="margin-top:10px">${u.q ? 'No matches' : 'No cases'}</div><div class="muted">${u.q ? `Nothing here matches “${esc(u.q)}”` : 'Cases show up here as customers write in.'}</div></div>`;
    const left = `<div class="ib-l"><div class="ib-lh"><button class="ib-num" data-act="ib-num">${waGlyph}<span>${esc(numLabel())}</span>${I('chevD')}</button>
      <div class="ib-srow"><div class="ib-sg">${I('search')}<input data-input="ib-q" placeholder="Search cases" value="${esc(u.q)}">${u.q ? `<button data-act="ib-qclear" aria-label="Clear">${I('x')}</button>` : ''}</div><button class="btn outline sm icon" style="width:28px;height:28px" data-act="ib-sort" title="${u.sort === 'new' ? 'Newest first — click for oldest first' : 'Oldest first — click for newest first'}" aria-label="${u.sort === 'new' ? 'Newest first. Switch to oldest first' : 'Oldest first. Switch to newest first'}">${I(u.sort === 'new' ? 'arrowDown' : 'arrowUp')}</button></div>
      <div class="ib-tabs">${D.seg(tabs, u.tab, 'ib-tab')}</div></div><div class="ib-list">${list}</div><div class="ib-foot">${dist === 1 ? '1 case' : L.length + ' cases'} · Demo Merchant User</div></div>`;
    let mid;
    if (!sel) mid = `<div class="ib-m"><div class="ib-empty" style="margin:auto">${D.icoTile('inbox', 'lg')}<div class="b" style="margin-top:10px">No case selected</div><div class="muted">Pick a case on the left to read it.</div></div></div>`;
    else if (sel.channel === 'email') mid = `<div class="ib-m">${emailHtml(sel)}</div>`;
    else mid = `<div class="ib-m">${headerHtml(sel)}<div class="ib-stream" id="ib-stream" data-tid="${esc(sel.id)}">${streamHtml(sel)}</div><button class="fab hide" id="ib-fab" data-act="ib-bottom" aria-label="Scroll to latest">${I('arrowDown')}</button><div class="ib-bot" id="ib-bot">${bottomHtml(sel)}</div></div>`;
    const ai = sel ? aiSummary(sel) : '';
    const right = sel && u.panel ? `<div class="ib-r">${ai}${activityHtml(sel)}</div>` : '';
    return `<div class="page-full"><div class="ib ${sel && u.panel ? '' : 'nopanel'}">${left}${mid}${right}</div></div>`;
  };

  /* ───────────────────────── after-render: scroll, stage new messages, FLIP ───────────────────────── */
  const scrollBottom = (smooth) => { const s = document.getElementById('ib-stream'); if (s) s.scrollTo({ top: s.scrollHeight, behavior: smooth ? 'smooth' : 'auto' }); };
  const reveal = (id) => { U().holding.delete(id); const el = document.querySelector(`[data-mid="${CSS.escape(id)}"]`); if (el) { el.classList.remove('ib-hold'); el.classList.add('msg-new'); } };
  const setTyping = (on) => {
    const u = U(); u.typing = on; const s = document.getElementById('ib-stream'); const ex = document.getElementById('ib-typing');
    if (on && s && !ex) { s.insertAdjacentHTML('beforeend', typingHtml()); scrollBottom(true); } else if (!on && ex) ex.remove();
    const mt = document.querySelector('.ib-h .mt2'); if (mt) { const cur = mt.querySelector('.typingtxt'); const t = selected(); if (on && !cur && t) mt.insertAdjacentHTML('beforeend', `<span class="typingtxt">${esc(t.owner === 'anuma' ? (D.uc === 'stuffcool' ? 'Order Desk' : 'Anuma') : uname(t.owner))} is typing…</span>`); if (!on && cur) cur.remove(); }
  };
  let pumping = false;
  const pump = () => {
    const u = U(); if (pumping) return; const job = u.q2.shift(); if (!job) { setTyping(false); return; }
    pumping = true; const fast = u.q2.length > 6 ? 0.45 : 1;
    if (job.typing) setTyping(true);
    setTimeout(() => { setTyping(false); reveal(job.id); const s = document.getElementById('ib-stream'); if (s) { const near = s.scrollHeight - s.scrollTop - s.clientHeight < 260; if (near) scrollBottom(true); } pumping = false; setTimeout(pump, 120 * fast); }, job.delay * fast);
  };
  const after = (root) => {
    const u = U(); const sel = selected(); const key = (id) => D.uc + ':' + id;
    // restore list scroll + stream position
    const lst = root.querySelector('.ib-list'); if (lst && u.keep) lst.scrollTop = u.keep.list || 0;
    const stream = document.getElementById('ib-stream');
    if (!u.loaded) { setTimeout(() => { u.loaded = true; if (DM.path().startsWith('/inbox')) D.render(); }, 480); return; }
    if (sel && stream) {
      const k = key(sel.id); const prev = u.seen[k]; const cur = new Set(sel.messages.map((m) => m.id));
      const sameThread = u.lastSel === sel.id;
      if (!prev || !sameThread) { u.seen[k] = cur; u.q2 = []; u.holding = new Set(); u.typing = false; scrollBottom(false); stream.classList.add('xf'); const dv = stream.querySelector('.dvd'); if (dv && !sameThread) dv.scrollIntoView({ block: 'center' }); }
      else {
        // prune ids that vanished (scenario stepped back) so they animate again when re-added
        [...prev].forEach((id) => { if (!cur.has(id)) prev.delete(id); });
        const fresh = sel.messages.filter((m) => !prev.has(m.id)); fresh.forEach((m) => prev.add(m.id));
        if (fresh.length) {
          fresh.forEach((m) => {
            const mine = m.from === ME; const agent = m.from === 'anuma' && (m.type === 'text' || m.type === 'image'); const delay = mine ? 0 : m.from === 'customer' ? (m.type === 'text' ? 380 : 650) : agent ? (m.type === 'text' ? 1250 : 700) : m.type === 'tool' ? 520 : m.type === 'comment' ? 420 : m.type === 'system' ? 300 : 500;
            if (delay === 0) { const el = document.querySelector(`[data-mid="${CSS.escape(m.id)}"]`); if (el) el.classList.add('msg-new'); return; }
            u.holding.add(m.id); const el = document.querySelector(`[data-mid="${CSS.escape(m.id)}"]`); if (el) el.classList.add('ib-hold');
            u.q2.push({ id: m.id, delay, typing: agent && m.type === 'text' });
          });
          if (fresh.some((m) => m.from === ME)) scrollBottom(true);
          pump();
        } else if (u.keep && u.keep.stream && u.keep.stream.id === sel.id) { stream.scrollTop = u.keep.stream.bottom ? stream.scrollHeight : u.keep.stream.top; }
        if (u.typing && !document.getElementById('ib-typing')) setTyping(true);
      }
      // fab
      const fab = document.getElementById('ib-fab'); if (fab) { const f = () => fab.classList.toggle('hide', stream.scrollHeight - stream.scrollTop - stream.clientHeight < 140); stream.addEventListener('scroll', f, { passive: true }); f(); }
      if (sel.unread) { sel.unread = 0; const ch = root.querySelector(`.crow[data-cid="${sel.id}"] .uchip`); if (ch) ch.remove(); }
    }
    u.lastSel = sel ? sel.id : null;
    // FLIP + flash for list rows
    const rows = [...root.querySelectorAll('.crow')]; const nr = {};
    rows.forEach((r) => { const id = r.dataset.cid; const t = th().find((x) => x.id === id); const sig = t ? t.lastAt + '|' + t.status + '|' + t.unread + '|' + t.owner : ''; const top = r.offsetTop; nr[id] = { top, sig }; const p = u.rows[id];
      if (p && p.sig !== sig && id !== (u.sel)) r.classList.add('row-new'); else if (p && p.sig !== sig) r.classList.add('row-new');
      if (p && p.top !== top && r.animate) r.animate([{ transform: `translateY(${p.top - top}px)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,.8,.24,1)' }); });
    u.rows = nr;
  };
  D.page('/inbox/threads', { title: 'Inbox', crumb: 'Inbox', render, after });
  D.page('/inbox', { title: 'Inbox', render: () => { setTimeout(() => D.go('/inbox/threads'), 0); return ''; } });

  /* ───────────────────────── state helpers (also exported for scenarios) ───────────────────────── */
  const byId = (x) => (typeof x === 'string' ? th().find((t) => t.id === x || t.caseNo === x) : x);
  let mseq = 0; const nid = () => 'x' + Date.now().toString(36) + (++mseq);
  const addMessage = (tt, m) => { const t = byId(tt); if (!t) return null; m = Object.assign({ id: nid(), at: iso(now()), type: 'text', from: 'customer' }, m); t.messages.push(m);
    if (CHAT[m.type]) { t.lastAt = m.at; if (m.from === 'customer') { if (t.status === 'closed') { t.status = 'open'; t.messages.push({ id: nid(), from: 'system', type: 'system', at: m.at, text: `**System** ${phoneOf(t)} re-opened the conversation`, act: `${phoneOf(t)} re-opened the conversation` }); } if (U().sel !== t.id || !location.hash.startsWith('#/inbox')) t.unread = (t.unread || 0) + 1; } }
    return m; };
  const system = (tt, text, act) => addMessage(tt, { from: 'system', type: 'system', text, act });
  const setStatus = (tt, s, actor) => { const t = byId(tt); if (!t) return; t.status = s; system(t, `**${actor || 'System'}** set status to **${s[0].toUpperCase() + s.slice(1)}**`); };
  const setOwner = (tt, o, actor) => { const t = byId(tt); if (!t) return; t.owner = o; system(t, o === 'anuma' ? `**${actor || 'System'}** handed back the conversation to **Anuma**` : `**${actor || 'System'}** assigned conversation to **${o === actor ? 'self' : uname(o)}**`); };
  D.inbox = { addMessage, system, setStatus, setOwner, find: byId, caseNo: (t) => (byId(t) || {}).caseNo };

  /* ───────────────────────── actions ───────────────────────── */
  const A = (n, f) => D.act(n, f);
  const cur = () => selected();
  const closeMenus = () => document.querySelectorAll('.menu').forEach((m) => m.remove());
  const flashSent = (t, id) => { setTimeout(() => { const m = t.messages.find((x) => x.id === id); if (m) { m.ticks = 'delivered'; softRefresh(); } }, 700); setTimeout(() => { const m = t.messages.find((x) => x.id === id); if (m) { m.ticks = 'read'; softRefresh(); } }, 2200); };
  const softRefresh = () => { if (location.hash.startsWith('#/inbox')) D.render(); };
  A('ib-open', (el) => { const u = U(); const id = el.dataset.arg; if (u.sel === id) return; u.sel = id; u._q = null; u.all = false; u.holding = new Set(); u.q2 = []; u.typing = false; history.replaceState(null, '', '#/inbox/threads?thread=' + id); D.render(); });
  A('ib-tab', (el) => { U().tab = el.dataset.arg; D.render(); });
  A('ib-sort', () => { const u = U(); u.sort = u.sort === 'new' ? 'old' : 'new'; D.render(); });
  A('ib-qclear', () => { U().q = ''; D.render(); });
  let qt; D.input('ib-q', (v) => { U().q = v; clearTimeout(qt); qt = setTimeout(() => { if (location.hash.startsWith('#/inbox')) D.render(); }, 280); });
  A('ib-panel', () => { const u = U(); u.panel = !u.panel; D.render(); });
  A('ib-all', () => { const u = U(); u.all = !u.all; D.render(); });
  A('ib-earlier', () => { D.toast('Showing the full conversation', 'history'); });
  A('ib-bottom', () => scrollBottom(true));
  A('ib-num', (el) => { const u = U(); const N = S().numbers || []; const items = [{ custom: `<button class="ib-numi" data-act="ib-numpick" data-arg="all" style="display:flex;width:100%;align-items:center;gap:8px;padding:6px 8px;border-radius:8px;text-align:left;min-height:44px"><span class="grow"><div style="font-size:12px;font-weight:500">All numbers</div><div style="font-size:11px;color:#737373">Across ${N.length > 1 ? 'both' : 'all'} WhatsApp inbox${N.length > 1 ? 'es' : ''}</div></span>${u.num === 'all' ? I('check') : ''}</button>` }].concat(N.map((n) => ({ custom: `<button data-act="ib-numpick" data-arg="${n.id}" style="display:flex;width:100%;align-items:center;gap:8px;padding:4px 8px;border-radius:8px;min-height:28px;font-size:12px;text-align:left"><span class="grow">${esc(n.label)}</span>${u.num === n.id ? I('check') : ''}</button>` })), [{ sep: true }, { custom: `<button data-act="ib-addnum" style="display:flex;width:100%;align-items:center;gap:8px;padding:4px 8px;border-radius:8px;min-height:32px;font-size:12px;color:#525252;text-align:left">${I('plus')} Add WhatsApp number</button>` }]);
    DM.menu(el, items, { w: 261 }); });
  A('ib-numpick', (el) => { closeMenus(); U().num = el.dataset.arg; D.render(); });
  A('ib-addnum', () => { closeMenus(); D.go('/settings/channels'); });
  A('ib-status', (el) => { const t = cur(); const s = statusOf(t); const set = (v) => () => { if (v === s) return; setStatus(t, v, 'Rohan Mehta'); if (v === 'escalated') { t.escalatedAt = iso(now()); t.handoffAt = t.handoffAt || t.escalatedAt; } D.toast('Status set to ' + v[0].toUpperCase() + v.slice(1)); D.render(); };
    DM.menu(el, [['open', 'Open', 'clock'], ['escalated', 'Escalated', 'alert'], ['closed', 'Closed', 'check']].map(([v, l, ic]) => ({ label: l, icon: ic, check: v === s, run: set(v) })), { w: 224, right: true }); });
  A('ib-cmts', (el) => { const t = cur(); const C = t.messages.filter((m) => m.type === 'comment').slice().reverse();
    DM.menu(el, [{ custom: `<div class="cpop"><div class="ph">${C.length} comment${C.length > 1 ? 's' : ''}</div>${C.map((c) => `<div class="cr"><span style="flex:none">${authorAvatar(c.by)}</span><div class="grow" style="min-width:0"><div style="display:flex"><span class="a">${esc(authorName(c.by))}</span><span class="d">${cmtTime(msx(c.at))}</span></div><div class="x">${esc(c.text)}</div></div></div>`).join('')}</div>` }], { w: 280, right: true }); });
  A('ib-take', () => { const t = cur(); if (!t) return; setOwner(t, ME, 'Rohan Mehta'); if (t.status === 'closed') t.status = 'open'; D.toast('You have this case'); D.render(); });
  A('ib-hand', () => { const t = cur(); setOwner(t, 'anuma', 'Rohan Mehta'); D.toast('Handed back to Anuma'); D.render(); });
  A('ib-more', (el) => { const t = cur(); DM.menu(el, [{ label: 'Assign', icon: 'user', run: () => assignMenu(el) }, { label: 'Comment', icon: 'chat', run: () => commentDialog(t) }], { up: true, w: 176 }); });
  const assignMenu = (anchor) => { const t = cur(); const people = U_().filter((x) => x.status !== 'invited').slice(0, 14);
    setTimeout(() => DM.menu(anchor, [{ heading: 'Assign to' }].concat(people.map((p) => ({ custom: `<button data-act="ib-assign" data-arg="${esc(p.id)}" style="display:flex;width:100%;align-items:center;gap:8px;padding:4px 8px;border-radius:8px;min-height:32px;font-size:12px;text-align:left">${D.avatar(p.name, 'sm')}<span class="grow">${esc(p.name)}</span>${t.owner === p.id ? I('check') : ''}</button>` }))), { w: 224, up: true }), 0); };
  A('ib-assign', (el) => { closeMenus(); const t = cur(); setOwner(t, el.dataset.arg, 'Rohan Mehta'); if (t.status === 'closed') t.status = 'open'; D.toast('Assigned to ' + uname(el.dataset.arg)); D.render(); });
  const commentDialog = (t) => D.dialog({ title: 'Add a comment', sub: 'Internal note — never sent to the customer.', body: '<textarea class="textarea" name="c" rows="4" placeholder="Write a comment…" style="width:100%"></textarea>', w: 460, actions: [{ label: 'Cancel', cls: 'outline' }, { label: 'Post comment', run: (el) => { const v = el.querySelector('[name=c]').value.trim(); if (!v) return false; addMessage(t, { from: 'system', type: 'comment', by: ME, text: v }); D.toast('Comment added'); D.render(); } }] });
  A('ib-details', () => orderDialog(cur()));
  A('ib-img', (el) => { const t = cur(); const m = t.messages.find((x) => x.id === el.dataset.arg); if (m) D.dialog({ title: 'Photo', body: `<img src="${m.src}" style="width:100%;border-radius:10px" alt="">`, w: 640, actions: [{ label: 'Close', cls: 'outline' }] }); });
  A('ib-play', (el) => { const u = U(); const id = el.dataset.arg; const t = cur(); const m = (t.messages || []).find((x) => x.id === id) || { seconds: 60 }; if (u.play && u.play.id === id && playState(m).on) { u.play = null; } else u.play = { id, t0: Date.now() };
    clearInterval(u._pi); u._pi = setInterval(() => { const box = document.querySelector(`[data-ap="${CSS.escape(id)}"]`); if (!box || !u.play) { clearInterval(u._pi); return; } const ps = playState(m); box.querySelector('.tm').textContent = fmtDur(ps.cur) + ' / ' + fmtDur(m.seconds); box.querySelectorAll('.wave i').forEach((b, i, all) => b.classList.toggle('on', i / all.length < ps.frac)); box.querySelector('.pl').innerHTML = I(ps.on ? 'pause' : 'play'); if (!ps.on) { clearInterval(u._pi); u.play = null; } }, 120); });
  A('ib-react', (el) => { const t = cur(); const m = t.messages.find((x) => x.id === el.dataset.arg); DM.menu(el, ['👍', '✅', '🙏', '👀', '❤️'].map((e) => ({ label: e, run: () => { m.reaction = e; D.render(); } })), { w: 120 }); });
  A('ib-reply', (el) => { const t = cur(); const m = t.messages.find((x) => x.id === el.dataset.arg); if (t.owner !== ME) { D.toast('Take over the case to reply', 'info'); return; } U().reply[D.uc + ':' + t.id] = { who: 'Anuma', text: (m.text || '').slice(0, 90) }; D.render(); setTimeout(() => { const ta = document.querySelector('.comp textarea'); ta && ta.focus(); }, 30); });
  D.input('ib-draft', (v) => { const u = U(); const t = cur(); if (t) u.draft[D.uc + ':' + t.id] = v; });
  document.addEventListener('keydown', (e) => { if (e.target && e.target.dataset && e.target.dataset.input === 'ib-draft' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const b = document.getElementById('ib-sendbtn'); b && b.click(); } });
  A('ib-send', () => { const u = U(); const t = cur(); const k = D.uc + ':' + t.id; const v = (u.draft[k] || '').trim(); if (!v) return; const rp = u.reply[k]; const m = addMessage(t, { from: ME, type: 'text', text: v, ticks: 'sent', quote: rp ? { who: rp.who, text: rp.text } : undefined }); u.draft[k] = ''; delete u.reply[k]; D.render(); flashSent(t, m.id); });
  A('ib-tpl', (el) => { const T = S().templates || []; const t = cur(); const u = U(); u.tpl = T[0] ? T[0].id : null;
    DM.menu(el, [{ custom: `<div style="min-width:394px"><div style="display:flex;align-items:center;padding:4px 4px 8px"><b style="font-size:12px;flex:1">Templates</b><button class="btn ghost icon sm" style="width:24px;height:24px" data-act="ib-tplx">${I('x')}</button></div><div id="tpl-list" style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto">${T.map((x, i) => `<button class="tplc ${i === 0 ? 'on' : ''}" data-act="ib-tplpick" data-arg="${x.id}">${D.icoTile('file')}<span><div class="tn">${esc(x.name)}</div><div class="tb">${esc(x.text)}</div></span></button>`).join('')}</div><div style="padding:8px 0 0;display:flex;justify-content:flex-end"><button class="btn sm" style="height:28px" data-act="ib-tplsend" id="tplsend">${I('send')} Send template</button></div></div>` }], { w: 418, up: true }); });
  A('ib-tplx', () => closeMenus());
  A('ib-tplpick', (el) => { U().tpl = el.dataset.arg; document.querySelectorAll('.tplc').forEach((b) => b.classList.toggle('on', b === el)); });
  A('ib-tplsend', () => { const u = U(); const t = cur(); const tp = (S().templates || []).find((x) => x.id === u.tpl); if (!tp) return; closeMenus(); const nm = firstName(t); const txt = tp.text.replace('{{1}}', nm).replace('{{2}}', t.lines && t.lines.length ? t.lines.map((l, i) => `${i + 1}. ${l.label}`).join(' ') : 'a', '').replace('{{3}}', '1').replace(/\{\{\d\}\}/g, '…');
    const m = addMessage(t, { from: ME, type: 'template', name: tp.name, text: txt, ticks: 'sent' }); system(t, `**Rohan Mehta** sent template **${tp.name}**`); D.toast('Template sent'); D.render(); flashSent(t, m.id); });
  A('ib-btn', (el) => { const [id, label] = el.dataset.arg.split('|'); const t = cur(); const p = t.messages.find((x) => x.id === id); if (!p) return; const quote = { who: 'Anuma', text: (p.text || '').replace(/\n/g, ' ').slice(0, 120) };
    addMessage(t, { from: 'customer', type: 'text', text: label, quote, reaction: label === 'Confirm' ? '✅' : undefined });
    const list = (t.lines || []).map((l, i) => `${i + 1}. ${l.label} — ${l.qty}.000 ${l.unit}`).join('\n') || p.text.split('\n').slice(1).join('\n');
    if (label === 'Confirm') { const n = 170 + Math.floor(Math.random() * 40); addMessage(t, { from: 'system', type: 'comment', by: 'Anuma', text: `Resolution summary — enquiry #${n - 22}: Converted to #${n}.\n${list}` }); t.status = 'closed'; t.owner = 'anuma'; system(t, `**System** closed — **Intake enquiry converted → DraftOrder #${n}**`, `System closed — Intake enquiry converted → DraftOrder #${n}`); addMessage(t, { from: 'anuma', type: 'text', text: `Thanks — your order (#${n}) is confirmed! We'll get started on it right away.`, quote: { who: phoneOf(t), text: 'Confirm' }, ticks: 'read' }); }
    else if (label === 'Edit') addMessage(t, { from: 'anuma', type: 'text', text: 'Which line?', ticks: 'read' });
    else { t.status = 'closed'; addMessage(t, { from: 'anuma', type: 'text', text: 'No problem — your order has been cancelled.', ticks: 'read' }); system(t, '**System** set status to **Closed**'); }
    D.render(); });

  // Order intake dialog (editable "Current order" when a human holds the case)
  const pickLine = (t, after2) => { const styles = S().styles || []; const opts = []; styles.forEach((s) => (s.variants || []).slice(0, 4).forEach((v) => opts.push({ s, v })));
    D.dialog({ title: 'Pick the catalogue match', w: 520, body: `<input class="input" id="oi-s" placeholder="Search catalogue" style="margin-bottom:10px"><div id="oi-l" style="max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:2px">${opts.slice(0, 40).map((o, i) => `<button class="mi" data-oi="${i}" style="display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;text-align:left;width:100%;font-size:12px"><span class="grow">${esc(o.s.name + ' - ' + o.v.name)}</span><span class="muted">${esc(o.v.unit || '')}</span></button>`).join('')}</div>`, actions: [{ label: 'Cancel', cls: 'outline' }],
      onMount: (d) => { const inp = d.querySelector('#oi-s'), lst = d.querySelector('#oi-l'); const draw = () => { const q = inp.value.toLowerCase(); const sub = opts.filter((o) => (o.s.name + ' ' + o.v.name).toLowerCase().includes(q)).slice(0, 40); lst.innerHTML = sub.map((o, i) => `<button class="mi" data-oi="${opts.indexOf(o)}" style="display:flex;gap:8px;align-items:center;padding:6px 8px;border-radius:8px;text-align:left;width:100%;font-size:12px"><span class="grow">${esc(o.s.name + ' - ' + o.v.name)}</span></button>`).join('') || '<div class="muted" style="padding:12px">No matches</div>'; }; inp.addEventListener('input', draw); lst.addEventListener('click', (e) => { const b = e.target.closest('[data-oi]'); if (!b) return; const o = opts[+b.dataset.oi]; D.closeModal(); after2({ label: o.s.name + ' - ' + o.v.name, variantId: o.v.id, unit: o.v.unit || 'Meter' }); }); } }); };
  const orderDialog = (t) => {
    if (!t) return; const mine = t.owner === ME;
    const body = () => { const L = t.lines || []; return `${mine ? '' : `<div class="oi-b">${I('info')}<span class="grow">${t.owner === 'anuma' ? 'Anuma still has this case. Take it over to edit the order.' : esc(uname(t.owner)) + ' has this case. Take it over to edit the order.'}</span></div>`}${L.length ? L.map((l, i) => `<div class="oi-r"><span class="n">${i + 1}</span><span class="l">${esc(l.label)}${l.state === 'flagged' ? ' <span class="badge amber" style="margin-left:6px">Needs a match</span>' : ''}</span>${mine ? `${l.state === 'flagged' ? `<button class="btn outline sm" data-oi-match="${i}">Pick match</button>` : ''}<span class="stp"><button data-oi-q="${i}:-1">−</button><span>${l.qty == null ? '—' : l.qty}</span><button data-oi-q="${i}:1">+</button></span><span class="muted">${esc(l.unit || '')}</span><button class="btn ghost icon sm" data-oi-rm="${i}">${I('x')}</button>` : `<span class="mono">${l.qty == null ? '—' : l.qty + ' ' + esc(l.unit || '')}</span>`}</div>`).join('') : '<div class="muted" style="text-align:center;padding:18px">No items on this order yet.</div>'}${mine ? `<div style="margin-top:10px"><button class="btn outline sm" data-oi-add>${I('plus')} Add line</button></div>` : ''}`; };
    D.dialog({ title: mine ? 'Current order' : 'Order intake', sub: esc(nameOf(t)) + (subOf(t) ? ' · ' + esc(subOf(t)) : ''), w: 520, body: `<div id="oi">${body()}</div>`, actions: [{ label: 'Close', cls: 'outline' }],
      onMount: (d) => { const box = d.querySelector('#oi'); const redraw = () => { box.innerHTML = body(); }; box.addEventListener('click', (e) => {
        const q = e.target.closest('[data-oi-q]'); if (q) { const [i, dl] = q.dataset.oiQ.split(':').map(Number); const l = t.lines[i]; l.qty = Math.max(1, (l.qty || 0) + dl); redraw(); return; }
        const rm = e.target.closest('[data-oi-rm]'); if (rm) { t.lines.splice(+rm.dataset.oiRm, 1); addMessage(t, { from: 'system', type: 'comment', by: ME, text: '[Rohan] Edited the order — removed 1 line.' }); redraw(); return; }
        const mt = e.target.closest('[data-oi-match]'); if (mt) { pickLine(t, (o) => { const l = t.lines[+mt.dataset.oiMatch]; Object.assign(l, { label: o.label, variantId: o.variantId, state: 'ok', unit: l.unit || o.unit }); addMessage(t, { from: 'system', type: 'comment', by: ME, text: `[Rohan] Attached variant ${o.label} to the line.` }); D.render(); orderDialog(t); }); return; }
        if (e.target.closest('[data-oi-add]')) { pickLine(t, (o) => { t.lines.push({ id: nid(), label: o.label, variantId: o.variantId, qty: 1, unit: o.unit, state: 'ok' }); addMessage(t, { from: 'system', type: 'comment', by: ME, text: '[Rohan] Edited the order — added 1 line.' }); D.render(); orderDialog(t); }); } }); } });
  };
})();
