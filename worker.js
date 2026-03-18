// ─── 多用户盯盘助手 Worker ────────────────────────────────────
// KV绑定: USERS (账号密码), HOLDINGS (持仓数据)

const HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>盯盘助手</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0c0f;--bg2:#0f1318;--bg3:#151b22;--bg4:#1c2530;--border:#1e2d3d;--border2:#253444;--text:#c8d8e8;--text2:#7a9ab8;--text3:#4a6a88;--up:#e84040;--up-bg:#2a0a0a;--dn:#00c878;--dn-bg:#0a1e14;--gold:#f0a030;--gold-bg:#1e1400;--blue:#3090f0;--blue-bg:#0a1828;--mono:'IBM Plex Mono',monospace;--sans:'Noto Sans SC',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:var(--sans);font-size:13px;min-height:100vh}

/* LOGIN */
#login-page{display:flex;align-items:center;justify-content:center;min-height:100vh;padding:20px}
.login-box{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:36px 32px;width:360px;max-width:100%}
.login-logo{font-family:var(--mono);font-size:18px;font-weight:600;color:var(--gold);letter-spacing:2px;margin-bottom:6px}
.login-sub{font-size:12px;color:var(--text3);margin-bottom:28px;font-family:var(--mono)}
.form-group{margin-bottom:14px}
.form-label{font-size:11px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;display:block;margin-bottom:5px}
.form-input{width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:13px;padding:9px 12px;border-radius:3px;outline:none;transition:border-color .15s}
.form-input:focus{border-color:var(--blue)}
.btn-login{width:100%;padding:10px;background:var(--blue);color:#fff;border:none;border-radius:3px;font-family:var(--mono);font-size:13px;cursor:pointer;letter-spacing:1px;margin-top:6px;transition:opacity .15s}
.btn-login:hover{opacity:.85}
.login-tabs{display:flex;gap:0;margin-bottom:22px;border:1px solid var(--border);border-radius:3px;overflow:hidden}
.login-tab{flex:1;padding:8px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--text3);cursor:pointer;transition:all .15s}
.login-tab.active{background:var(--blue-bg);color:var(--blue)}
.login-err{font-size:12px;color:var(--up);font-family:var(--mono);margin-top:8px;min-height:18px}
.login-hint{font-size:11px;color:var(--text3);text-align:center;margin-top:14px}

/* HEADER */
header{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 20px;height:48px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.logo{font-family:var(--mono);font-size:15px;font-weight:600;color:var(--gold);letter-spacing:2px}
.logo span{color:var(--text3);font-weight:300}
.header-right{display:flex;align-items:center;gap:14px}
#clock{font-family:var(--mono);font-size:13px;color:var(--text2);letter-spacing:1px}
#market-status{font-size:11px;padding:2px 8px;border-radius:2px;font-family:var(--mono)}
.status-open{background:var(--dn-bg);color:var(--dn);border:1px solid #00a060}
.status-close{background:var(--up-bg);color:var(--text3);border:1px solid var(--border)}
.user-badge{font-family:var(--mono);font-size:11px;color:var(--text2);padding:3px 10px;border:1px solid var(--border);border-radius:2px}
.btn-logout{font-family:var(--mono);font-size:11px;color:var(--text3);padding:3px 10px;border:1px solid var(--border);border-radius:2px;background:transparent;cursor:pointer;transition:all .15s}
.btn-logout:hover{color:var(--up);border-color:var(--up)}

/* LAYOUT */
.layout{display:grid;grid-template-columns:260px 1fr;height:calc(100vh - 48px)}
aside{background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden}
.sidebar-section{border-bottom:1px solid var(--border);padding:10px 12px}
.sidebar-title{font-family:var(--mono);font-size:10px;color:var(--text3);letter-spacing:2px;text-transform:uppercase}
.fund-list{display:flex;flex-direction:column;gap:2px;overflow-y:auto;flex:1;padding:8px}
.fund-item{padding:7px 8px;border-radius:3px;border:1px solid transparent;transition:all .15s}
.fund-item-row{display:flex;justify-content:space-between;align-items:center;cursor:pointer}
.fund-item:hover{background:var(--bg3);border-color:var(--border)}
.fund-item.editing{background:var(--bg4);border-color:var(--blue)}
.fund-item-left{flex:1;min-width:0}
.fund-item-code{font-family:var(--mono);font-size:11px;color:var(--text3)}
.fund-item-name{font-size:12px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:110px}
.fund-item-right{text-align:right;display:flex;align-items:center;gap:6px}
.fund-item-nums{text-align:right}
.fund-pct{font-family:var(--mono);font-size:12px;font-weight:500}
.fund-val{font-family:var(--mono);font-size:10px;color:var(--text3)}
.fund-actions{display:none;gap:3px}
.fund-item:hover .fund-actions{display:flex}
.fund-action-btn{width:20px;height:20px;border-radius:2px;border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;transition:all .12s;flex-shrink:0}
.fund-action-btn:hover.edit-btn{color:var(--blue);border-color:var(--blue);background:var(--blue-bg)}
.fund-action-btn:hover.del-btn{color:var(--up);border-color:var(--up);background:var(--up-bg)}
.inline-edit{display:none;margin-top:8px;padding-top:8px;border-top:1px dashed var(--border2);flex-direction:column;gap:5px}
.fund-item.editing .inline-edit{display:flex}
.ie-row{display:flex;gap:5px;align-items:center}
.ie-label{font-size:10px;color:var(--text3);font-family:var(--mono);width:36px;flex-shrink:0}
.ie-input{flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:12px;padding:4px 7px;border-radius:2px;outline:none;min-width:0}
.ie-input:focus{border-color:var(--blue)}
.ie-btns{display:flex;gap:4px;margin-top:2px}
.ie-save{flex:1;padding:4px 0;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue);border-radius:2px;font-family:var(--mono);font-size:10px;cursor:pointer}
.ie-save:hover{background:var(--blue);color:#fff}
.ie-cancel{flex:1;padding:4px 0;background:transparent;color:var(--text3);border:1px solid var(--border);border-radius:2px;font-family:var(--mono);font-size:10px;cursor:pointer}
.add-form{padding:10px 12px;border-top:1px solid var(--border)}
.add-form input{width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-family:var(--mono);font-size:12px;padding:6px 10px;border-radius:2px;outline:none;margin-bottom:0}
.add-form input:focus{border-color:var(--blue)}
.add-form input::placeholder{color:var(--text3)}
.btn{flex:1;padding:6px 0;border-radius:2px;font-family:var(--mono);font-size:11px;cursor:pointer;border:1px solid;letter-spacing:.5px;transition:all .15s}
.btn-primary{background:var(--blue-bg);color:var(--blue);border-color:var(--blue)}
.btn-primary:hover{background:var(--blue);color:#fff}
.btn-danger{background:var(--up-bg);color:var(--up);border-color:var(--up)}
.btn-ghost{background:transparent;color:var(--text2);border-color:var(--border)}
main{display:flex;flex-direction:column;overflow:hidden}
.summary-bar{background:var(--bg2);border-bottom:1px solid var(--border);padding:10px 20px;display:flex;gap:24px;align-items:center;flex-wrap:wrap}
.summary-item{display:flex;flex-direction:column;gap:2px}
.summary-label{font-size:10px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;text-transform:uppercase}
.summary-value{font-family:var(--mono);font-size:16px;font-weight:500}
.summary-divider{width:1px;height:32px;background:var(--border)}
.up-color{color:var(--up)}.dn-color{color:var(--dn)}.na-color{color:var(--text3)}
.tabs{display:flex;border-bottom:1px solid var(--border);background:var(--bg2);padding:0 20px}
.tab{padding:10px 16px;font-size:12px;cursor:pointer;border-bottom:2px solid transparent;color:var(--text3);font-family:var(--mono);letter-spacing:.5px;transition:all .15s}
.tab:hover{color:var(--text2)}.tab.active{color:var(--gold);border-bottom-color:var(--gold)}
.content{flex:1;overflow-y:auto;padding:16px 20px}
.cards-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-bottom:16px}
.card{background:var(--bg2);border:1px solid var(--border);border-radius:4px;overflow:hidden;transition:border-color .15s}
.card:hover{border-color:var(--border2)}
.card-header{padding:10px 14px 8px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--border)}
.card-code{font-family:var(--mono);font-size:10px;color:var(--text3)}
.card-name{font-size:13px;font-weight:500;color:var(--text);margin-top:1px}
.tag{font-size:10px;padding:2px 6px;border-radius:2px;font-family:var(--mono);white-space:nowrap}
.tag-up{background:var(--up-bg);color:var(--up)}.tag-dn{background:var(--dn-bg);color:var(--dn)}
.card-body{padding:10px 14px}
.val-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.val-label{font-size:11px;color:var(--text3);font-family:var(--mono)}
.val-num{font-family:var(--mono);font-size:14px;font-weight:500;color:var(--text)}
.val-num-lg{font-family:var(--mono);font-size:20px;font-weight:600}
.divider-dashed{border:none;border-top:1px dashed var(--border2);margin:8px 0}
.est-label{font-size:10px;color:var(--text3);font-family:var(--mono);letter-spacing:1px;margin-bottom:6px;display:flex;align-items:center;gap:6px}
.est-badge{font-size:9px;padding:1px 5px;border-radius:2px;background:var(--gold-bg);color:var(--gold);border:1px solid #3a2800}
.progress-bar{height:3px;background:var(--bg3);border-radius:2px;margin-top:10px;overflow:hidden}
.progress-fill{height:100%;border-radius:2px;transition:width .6s ease}
.card-footer{padding:8px 14px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.suggestion-pill{font-size:11px;padding:3px 10px;border-radius:2px;font-family:var(--mono);font-weight:500}
.s-sell{background:var(--up-bg);color:var(--up);border:1px solid #400}
.s-watch{background:#1a1000;color:#c08000;border:1px solid #3a2000}
.s-try{background:#0a1a0a;color:#60c060;border:1px solid #1a3a1a}
.s-buy{background:var(--dn-bg);color:var(--dn);border:1px solid #004020}
.s-hold{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
.card-action-btn{font-size:10px;color:var(--text3);cursor:pointer;font-family:var(--mono);letter-spacing:.5px;border:1px solid var(--border);padding:3px 8px;border-radius:2px;background:transparent;transition:all .15s}
.card-action-btn:hover{color:var(--blue);border-color:var(--blue)}
.news-list{display:flex;flex-direction:column;gap:8px}
.news-item{background:var(--bg2);border:1px solid var(--border);border-left:3px solid var(--border2);padding:10px 14px;border-radius:0 4px 4px 0;transition:border-color .15s}
.news-item:hover{border-left-color:var(--gold)}
.news-sector{font-size:10px;color:var(--gold);font-family:var(--mono);margin-bottom:4px}
.news-text{font-size:13px;color:var(--text);line-height:1.5}
.news-meta{font-size:10px;color:var(--text3);margin-top:4px;font-family:var(--mono)}
.suggestion-card{background:var(--bg2);border:1px solid var(--border);border-radius:4px;padding:14px 16px;margin-bottom:10px}
.suggestion-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.suggestion-name{font-size:14px;font-weight:500}
.suggestion-body{font-size:12px;color:var(--text2);line-height:1.7}
.suggestion-ops{margin-top:10px;display:flex;flex-direction:column;gap:6px}
.op-row{display:flex;gap:8px;align-items:flex-start}
.op-day{font-size:10px;color:var(--text3);font-family:var(--mono);width:36px;flex-shrink:0;padding-top:2px}
.op-text{font-size:12px;color:var(--text)}
.settings-section{margin-bottom:20px}
.settings-title{font-family:var(--mono);font-size:11px;color:var(--text3);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:6px}
.settings-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed var(--border)}
.settings-label{font-size:13px;color:var(--text2)}
.settings-value{font-family:var(--mono);font-size:12px;color:var(--text)}
.alert{padding:10px 14px;border-radius:3px;font-size:12px;margin-bottom:10px;display:flex;gap:8px;align-items:flex-start}
.alert-warn{background:var(--gold-bg);border:1px solid #3a2800;color:#c08030}
.alert-info{background:var(--blue-bg);border:1px solid #0a3060;color:var(--blue)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border2);border-radius:2px}
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}
.modal-backdrop.show{opacity:1;pointer-events:all}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:6px;padding:20px;width:380px;max-width:90vw;transform:translateY(10px);transition:transform .2s}
.modal-backdrop.show .modal{transform:translateY(0)}
.modal-title{font-family:var(--mono);font-size:13px;color:var(--gold);margin-bottom:14px;letter-spacing:1px}
.modal-actions{display:flex;gap:8px;margin-top:16px}
.btn-row{display:flex;gap:6px}
.spin{display:inline-block;width:12px;height:12px;border:2px solid var(--border);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.fade-in{animation:fadeIn .3s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
.sync-status{font-family:var(--mono);font-size:10px;color:var(--text3);padding:2px 8px}
@media(max-width:700px){.layout{grid-template-columns:1fr}aside{display:none}}
</style>
</head>
<body>

<!-- LOGIN PAGE -->
<div id="login-page">
  <div class="login-box">
    <div class="login-logo">盯盘助手</div>
    <div class="login-sub">/ MONITOR · 登录你的账号</div>
    <div class="login-tabs">
      <div class="login-tab active" id="tab-login" onclick="switchLoginTab('login')">登录</div>
      <div class="login-tab" id="tab-register" onclick="switchLoginTab('register')">注册</div>
    </div>
    <div class="form-group">
      <label class="form-label">账号</label>
      <input class="form-input" id="auth-username" placeholder="输入你的账号" autocomplete="username">
    </div>
    <div class="form-group">
      <label class="form-label">密码</label>
      <input class="form-input" id="auth-password" type="password" placeholder="输入密码" autocomplete="current-password">
    </div>
    <div class="form-group" id="confirm-group" style="display:none">
      <label class="form-label">确认密码</label>
      <input class="form-input" id="auth-confirm" type="password" placeholder="再次输入密码">
    </div>
    <button class="btn-login" id="auth-btn" onclick="doAuth()">登 录</button>
    <div class="login-err" id="auth-err"></div>
    <div class="login-hint">数据安全存储在云端，多设备同步</div>
  </div>
</div>

<!-- MAIN APP (hidden until login) -->
<div id="app" style="display:none">
<header>
  <div class="logo">盯盘助手 <span>/ MONITOR</span></div>
  <div class="header-right">
    <div id="clock">--:--:--</div>
    <div id="market-status" class="status-close">休市</div>
    <div class="user-badge" id="user-badge"></div>
    <span class="sync-status" id="sync-status"></span>
    <button class="btn-ghost btn" style="padding:3px 10px;font-size:11px;flex:none" onclick="refreshAll()"><span id="refresh-icon">↻</span> 刷新</button>
    <button class="btn-logout" onclick="doLogout()">退出</button>
  </div>
</header>

<div class="layout">
  <aside>
    <div class="sidebar-section" style="padding:10px 12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="sidebar-title" style="margin-bottom:0">持仓列表 <span id="holding-count" style="color:var(--text3);font-size:9px"></span></div>
        <button class="btn btn-primary" style="padding:3px 10px;font-size:10px;flex:none" onclick="openAddModal()">+ 添加</button>
      </div>
    </div>
    <div class="fund-list" id="fund-list"></div>
    <div class="add-form">
      <input type="text" id="quick-code" placeholder="快速添加：输入基金代码 Enter" maxlength="10" style="margin-bottom:0">
    </div>
  </aside>

  <main>
    <div class="summary-bar">
      <div class="summary-item"><div class="summary-label">总持仓市值</div><div class="summary-value" id="sum-total">--</div></div>
      <div class="summary-divider"></div>
      <div class="summary-item"><div class="summary-label">今日估算盈亏</div><div class="summary-value" id="sum-today">--</div></div>
      <div class="summary-divider"></div>
      <div class="summary-item"><div class="summary-label">总浮盈亏</div><div class="summary-value" id="sum-pnl">--</div></div>
      <div class="summary-divider"></div>
      <div class="summary-item"><div class="summary-label">持仓只数</div><div class="summary-value" id="sum-count">0</div></div>
    </div>
    <div class="tabs">
      <div class="tab active" onclick="switchTab('overview')" id="tab-overview">总览</div>
      <div class="tab" onclick="switchTab('valuation')" id="tab-valuation">实时估值</div>
      <div class="tab" onclick="switchTab('news')" id="tab-news">新闻播报</div>
      <div class="tab" onclick="switchTab('suggestion')" id="tab-suggestion">买卖建议</div>
      <div class="tab" onclick="switchTab('settings')" id="tab-settings">设置</div>
    </div>
    <div class="content" id="content">
      <div id="tab-content-overview" class="tab-content"></div>
      <div id="tab-content-valuation" class="tab-content" style="display:none"></div>
      <div id="tab-content-news" class="tab-content" style="display:none"></div>
      <div id="tab-content-suggestion" class="tab-content" style="display:none"></div>
      <div id="tab-content-settings" class="tab-content" style="display:none"></div>
    </div>
  </main>
</div>
</div>

<!-- ADD MODAL -->
<div class="modal-backdrop" id="modal-backdrop" onclick="closeModalOutside(event)">
  <div class="modal">
    <div class="modal-title">添加持仓</div>
    <div class="form-group"><label class="form-label">代码 *</label><input class="form-input" id="m-code" placeholder="如 014855"></div>
    <div class="form-group"><label class="form-label">名称</label><input class="form-input" id="m-name" placeholder="如 嘉实半导体"></div>
    <div class="form-group"><label class="form-label">持仓市值（元）</label><input class="form-input" id="m-value" type="number" placeholder="如 2294.41"></div>
    <div class="form-group"><label class="form-label">买入成本（元）</label><input class="form-input" id="m-cost" type="number" placeholder="如 2000"></div>
    <div class="form-group"><label class="form-label">板块</label><input class="form-input" id="m-sector" placeholder="如 半导体、电力"></div>
    <div class="modal-actions">
      <button class="btn btn-primary" style="flex:2" onclick="addFund()">确认添加</button>
      <button class="btn btn-ghost" style="flex:1" onclick="closeModal()">取消</button>
    </div>
  </div>
</div>

<script>
// ─── 状态 ──────────────────────────────────────────────────────
let currentUser = null;
let token = null;
let holdings = [];
let currentTab = 'overview';
let editingIndex = -1;
let refreshing = false;
let loginMode = 'login';

const EST_DATA = {
  '016185':{gsz:1.1994,gszzl:-2.33,gztime:'14:32',acc:93},
  '019924':{gsz:null,gszzl:+0.28,gztime:'14:30',acc:88},
  '015558':{gsz:null,gszzl:-0.69,gztime:'14:30',acc:91},
  '004433':{gsz:null,gszzl:-2.97,gztime:'14:30',acc:90},
  '014855':{gsz:2.1087,gszzl:+1.02,gztime:'14:35',acc:93},
  '012922':{gsz:null,gszzl:+0.09,gztime:'14:30',acc:55},
};
const SIGNALS = {
  '016185':{label:'🟠 观望等待',cls:'s-watch',reason:'近1月涨13.9%，今日回调，暂勿追高'},
  '019924':{label:'🟡 轻仓持有',cls:'s-try',reason:'小盘风格偏弱，震荡等方向'},
  '015558':{label:'⚫ 长期持有',cls:'s-hold',reason:'红利防御资产，不适合短线'},
  '004433':{label:'🟠 观望等待',cls:'s-watch',reason:'情绪高位，拥挤度处近3年95分位'},
  '014855':{label:'🟢 可以关注',cls:'s-buy',reason:'全场最强逻辑，AI算力主线'},
  '012922':{label:'⚫ 长期持有',cls:'s-hold',reason:'QDII时差，跟昨晚纳斯达克走'},
};
const NEWS = [
  {sector:'⚡电力',text:'政府工作报告首次将"算电协同"写入，列为新基建重点工程',time:'2026-03-15'},
  {sector:'⚡电力',text:'国家电网"十五五"投资超4万亿，较"十四五"增长40%',time:'2026-03-14'},
  {sector:'🪨有色',text:'3月初多只有色股涨停，钨类个股年内涨幅突破200%',time:'2026-03-10'},
  {sector:'🪨有色',text:'机构警告：行业成交占比处近3年95分位，拥挤度风险升高',time:'2026-03-12'},
  {sector:'💻半导体',text:'寒武纪2025年营收同比增长453%，摩尔线程增长243%',time:'2026-03-14'},
  {sector:'💻半导体',text:'台积电2026年资本开支指引520-560亿，同比增长37%超预期',time:'2026-03-13'},
  {sector:'📈小盘',text:'创业板指本周涨2.51%领跑，小盘股有结构性机会但分化明显',time:'2026-03-14'},
  {sector:'🌍QDII',text:'高盛报告：中国AI股自DeepSeek以来平均上涨50%，与美股相关性23%',time:'2026-03-13'},
  {sector:'💰红利',text:'银行股股息率回升至4.5%以上，机构配置高股息资产意愿增强',time:'2026-03-12'},
];

// ─── 登录相关 ──────────────────────────────────────────────────
function switchLoginTab(mode) {
  loginMode = mode;
  document.getElementById('tab-login').className = 'login-tab' + (mode==='login'?' active':'');
  document.getElementById('tab-register').className = 'login-tab' + (mode==='register'?' active':'');
  document.getElementById('confirm-group').style.display = mode==='register'?'block':'none';
  document.getElementById('auth-btn').textContent = mode==='login'?'登 录':'注 册';
  document.getElementById('auth-err').textContent = '';
}

async function doAuth() {
  const username = document.getElementById('auth-username').value.trim();
  const password = document.getElementById('auth-password').value;
  const confirm = document.getElementById('auth-confirm').value;
  const errEl = document.getElementById('auth-err');
  errEl.textContent = '';

  if (!username || !password) { errEl.textContent = '请输入账号和密码'; return; }
  if (username.length < 2) { errEl.textContent = '账号至少2个字符'; return; }
  if (password.length < 4) { errEl.textContent = '密码至少4位'; return; }
  if (loginMode === 'register' && password !== confirm) { errEl.textContent = '两次密码不一致'; return; }

  const btn = document.getElementById('auth-btn');
  btn.textContent = '请稍候...';
  btn.disabled = true;
  errEl.style.color = 'var(--text2)';
  errEl.textContent = '正在连接服务器...';

  try {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({action: loginMode, username, password})
    });
    
    if (!res.ok) {
      errEl.style.color = 'var(--up)';
      errEl.textContent = '服务器错误 ' + res.status + '，请检查部署是否成功';
      btn.textContent = loginMode==='login'?'登 录':'注 册';
      btn.disabled = false;
      return;
    }
    
    const data = await res.json();
    if (data.success) {
      currentUser = username;
      token = data.token;
      sessionStorage.setItem('dp_token', token);
      sessionStorage.setItem('dp_user', username);
      await loadHoldings();
      showApp();
    } else {
      errEl.style.color = 'var(--up)';
      errEl.textContent = data.error || '操作失败，请重试';
    }
  } catch(e) {
    errEl.style.color = 'var(--up)';
    errEl.textContent = '网络错误：' + e.message;
  }
  btn.textContent = loginMode==='login'?'登 录':'注 册';
  btn.disabled = false;
}

function doLogout() {
  currentUser = null; token = null;
  sessionStorage.removeItem('dp_token');
  sessionStorage.removeItem('dp_user');
  holdings = [];
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
}

function showApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('user-badge').textContent = '👤 ' + currentUser;
  renderAll();
}

// ─── 云端数据同步 ──────────────────────────────────────────────
async function loadHoldings() {
  try {
    const res = await fetch('/api/holdings', {
      headers: {'Authorization': 'Bearer ' + token}
    });
    const data = await res.json();
    if (data.success) holdings = data.holdings || [];
  } catch(e) { holdings = []; }
}

async function saveHoldings() {
  setSyncStatus('同步中...');
  try {
    await fetch('/api/holdings', {
      method: 'POST',
      headers: {'Content-Type':'application/json','Authorization':'Bearer '+token},
      body: JSON.stringify({holdings})
    });
    setSyncStatus('已同步 ✓');
    setTimeout(()=>setSyncStatus(''), 2000);
  } catch(e) {
    setSyncStatus('同步失败');
  }
}

function setSyncStatus(s) {
  const el = document.getElementById('sync-status');
  if (el) el.textContent = s;
}

// ─── 时钟 ──────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h=String(now.getHours()).padStart(2,'0');
  const m=String(now.getMinutes()).padStart(2,'0');
  const s=String(now.getSeconds()).padStart(2,'0');
  const el=document.getElementById('clock');
  if(el) el.textContent=h+':'+m+':'+s;
  const total=now.getHours()*60+now.getMinutes();
  const ms=document.getElementById('market-status');
  if(!ms) return;
  if((total>=570&&total<690)||(total>=780&&total<900)){ms.className='status-open';ms.textContent='交易中'}
  else if(total>=540&&total<570){ms.className='status-open';ms.textContent='集合竞价'}
  else{ms.className='status-close';ms.textContent='已收盘'}
}
setInterval(updateClock,1000);
updateClock();

// ─── 工具函数 ──────────────────────────────────────────────────
const fmt=(n,d=2)=>n==null||isNaN(n)?'--':n.toFixed(d);
const fmtM=n=>n==null||isNaN(n)?'--':'¥'+n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,',');
const pctCls=v=>v==null?'na-color':v>0?'up-color':v<0?'dn-color':'na-color';
const pctSign=v=>v==null||isNaN(v)?'--':(v>0?'+':'')+v.toFixed(2)+'%';
const getEst=code=>EST_DATA[code]||{};
const getSig=code=>SIGNALS[code]||{label:'⚫ 持仓观察',cls:'s-hold',reason:'数据更新中'};
const calcToday=h=>{const e=getEst(h.code);return e.gszzl==null?null:h.value*e.gszzl/100};
const calcPnl=h=>(!h.cost||!h.value)?null:h.value-h.cost;

// ─── 汇总栏 ────────────────────────────────────────────────────
function updateSummary() {
  let total=0,today=0,pnl=0,hasCost=false;
  holdings.forEach(h=>{
    total+=h.value||0;
    const t=calcToday(h); if(t!=null)today+=t;
    const p=calcPnl(h); if(p!=null){pnl+=p;hasCost=true;}
  });
  document.getElementById('sum-total').textContent=fmtM(total);
  document.getElementById('sum-count').textContent=holdings.length;
  const te=document.getElementById('sum-today');
  te.textContent=(today>=0?'+':'')+fmt(today)+'元';
  te.className='summary-value '+(today>=0?'up-color':'dn-color');
  if(hasCost){const pe=document.getElementById('sum-pnl');pe.textContent=(pnl>=0?'+':'')+fmt(pnl)+'元';pe.className='summary-value '+(pnl>=0?'up-color':'dn-color')}
}

// ─── 侧边栏 ────────────────────────────────────────────────────
function renderSidebar() {
  const el=document.getElementById('fund-list');
  const ce=document.getElementById('holding-count');
  if(ce)ce.textContent=holdings.length?'('+holdings.length+')':'';
  el.innerHTML=holdings.map((h,i)=>{
    const e=getEst(h.code),p=calcPnl(h),isE=editingIndex===i;
    return '<div class="fund-item'+(isE?' editing':'')+'" id="fi-'+i+'">'+
      '<div class="fund-item-row">'+
      '<div class="fund-item-left" onclick="focusFund('+i+')" style="cursor:pointer">'+
      '<div class="fund-item-code">'+h.code+' · <span style="font-size:10px;color:var(--text3)">'+( h.sector||'')+'</span></div>'+
      '<div class="fund-item-name">'+h.name+'</div></div>'+
      '<div class="fund-item-right">'+
      '<div class="fund-actions">'+
      '<button class="fund-action-btn edit-btn" onclick="toggleEdit('+i+',event)">✎</button>'+
      '<button class="fund-action-btn del-btn" onclick="removeFund('+i+',event)">✕</button></div>'+
      '<div class="fund-item-nums">'+
      '<div class="fund-pct '+pctCls(e.gszzl)+'">'+pctSign(e.gszzl)+'</div>'+
      '<div class="fund-val">'+fmtM(h.value)+'</div>'+
      (p!=null?'<div style="font-family:var(--mono);font-size:10px" class="'+(p>=0?'up-color':'dn-color')+'">'+(p>=0?'+':'')+fmt(p)+'元</div>':'')+
      '</div></div></div>'+
      '<div class="inline-edit">'+
      '<div class="ie-row"><span class="ie-label">名称</span><input class="ie-input" id="ie-name-'+i+'" value="'+h.name+'"></div>'+
      '<div class="ie-row"><span class="ie-label">板块</span><input class="ie-input" id="ie-sector-'+i+'" value="'+(h.sector||'')+'"></div>'+
      '<div class="ie-row"><span class="ie-label">市值</span><input class="ie-input" id="ie-value-'+i+'" type="number" value="'+(h.value||'')+'"></div>'+
      '<div class="ie-row"><span class="ie-label">成本</span><input class="ie-input" id="ie-cost-'+i+'" type="number" value="'+(h.cost||'')+'"></div>'+
      '<div class="ie-btns"><button class="ie-save" onclick="saveEdit('+i+')">✓ 保存</button><button class="ie-cancel" onclick="cancelEdit()">取消</button></div>'+
      '</div></div>';
  }).join('');
}

function toggleEdit(i,e){e.stopPropagation();if(editingIndex===i){cancelEdit();return}editingIndex=i;renderSidebar();setTimeout(()=>{const el=document.getElementById('ie-name-'+i);if(el)el.focus()},50)}
function cancelEdit(){editingIndex=-1;renderSidebar()}
async function saveEdit(i){
  const n=document.getElementById('ie-name-'+i)?.value.trim();
  const s=document.getElementById('ie-sector-'+i)?.value.trim();
  const v=parseFloat(document.getElementById('ie-value-'+i)?.value);
  const c=parseFloat(document.getElementById('ie-cost-'+i)?.value);
  if(n)holdings[i].name=n;
  if(s!==undefined)holdings[i].sector=s;
  if(!isNaN(v)&&v>0)holdings[i].value=v;
  if(!isNaN(c)&&c>0)holdings[i].cost=c;
  else if(document.getElementById('ie-cost-'+i)?.value==='')holdings[i].cost=null;
  editingIndex=-1;
  await saveHoldings();
  renderAll();toast('已保存 '+holdings[i].name);
}
function focusFund(i){switchTab('overview');setTimeout(()=>{const c=document.querySelectorAll('.fund-card');if(c[i])c[i].scrollIntoView({behavior:'smooth',block:'center'})},100)}

// ─── 卡片 ──────────────────────────────────────────────────────
function renderCard(h){
  const e=getEst(h.code),sig=getSig(h.code),tp=calcToday(h),pp=calcPnl(h);
  const en=e.gsz?'~'+fmt(e.gsz):(h.nav?'~'+fmt(h.nav*(1+(e.gszzl||0)/100)):'--');
  const tc=Math.min(100,Math.max(5,50+(e.gszzl||0)*8));
  return '<div class="card fund-card fade-in">'+
    '<div class="card-header"><div><div class="card-code">'+h.code+' · '+(h.sector||'')+'</div><div class="card-name">'+h.name+'</div></div>'+
    '<div class="tag '+((e.gszzl||0)>=0?'tag-up':'tag-dn')+'">'+pctSign(e.gszzl)+'</div></div>'+
    '<div class="card-body">'+
    '<div class="val-row"><span class="val-label">持仓市值</span><span class="val-num">'+fmtM(h.value)+'</span></div>'+
    (h.cost?'<div class="val-row"><span class="val-label">浮盈亏</span><span class="val-num '+(pp>=0?'up-color':'dn-color')+'">'+(pp>=0?'+':'')+fmt(pp)+'元 ('+pctSign((pp/h.cost)*100)+')</span></div>':'')+
    (h.nav?'<div class="val-row"><span class="val-label">昨日净值</span><span class="val-num" style="color:var(--text2)">'+fmt(h.nav)+'</span></div>':'')+
    '<hr class="divider-dashed"><div class="est-label">今日实时估值 <span class="est-badge">精度~'+(e.acc||'?')+'%</span></div>'+
    '<div class="val-row"><span class="val-label">估算净值</span><span class="val-num-lg '+pctCls(e.gszzl)+'">'+en+'</span></div>'+
    '<div class="val-row"><span class="val-label">今日预计</span><span class="val-num '+(tp!=null?(tp>=0?'up-color':'dn-color'):'na-color')+'">'+(tp!=null?(tp>=0?'+':'')+fmt(tp)+'元':'--')+'</span></div>'+
    '<div class="val-row"><span class="val-label">更新时间</span><span style="font-family:var(--mono);font-size:11px;color:var(--text3)">'+(e.gztime||'--')+'</span></div>'+
    '<div class="progress-bar"><div class="progress-fill" style="width:'+tc+'%;background:'+((e.gszzl||0)>=0?'#e84040':'#00c878')+'"></div></div>'+
    '</div><div class="card-footer"><div class="suggestion-pill '+sig.cls+'">'+sig.label+'</div>'+
    '<button class="card-action-btn" onclick="switchTab(\'suggestion\')">操作建议 →</button></div></div>';
}

// ─── 标签页 ────────────────────────────────────────────────────
function switchTab(n){
  currentTab=n;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t=>t.style.display='none');
  document.getElementById('tab-'+n).classList.add('active');
  document.getElementById('tab-content-'+n).style.display='block';
  renderTab(n);
}
function renderTab(n){
  const el=document.getElementById('tab-content-'+n);
  if(n==='overview')renderOverview(el);
  if(n==='valuation')renderValuation(el);
  if(n==='news')renderNews(el);
  if(n==='suggestion')renderSuggestion(el);
  if(n==='settings')renderSettings(el);
}
function renderOverview(el){
  if(!holdings.length){el.innerHTML='<div class="alert alert-info">⚡ 暂无持仓，点击"+ 添加"开始使用</div>';return}
  el.innerHTML='<div class="cards-grid">'+holdings.map(renderCard).join('')+'</div><div class="alert alert-warn">⚠️ 实时估值为估算值，误差约5-10%。申购赎回截止：每日15:00。仅供参考，不构成投资建议。</div>';
}
function renderValuation(el){
  const rows=holdings.map(h=>{const e=getEst(h.code),p=calcToday(h);return '<tr><td style="padding:10px 14px;font-family:var(--mono);font-size:12px;color:var(--text3)">'+h.code+'</td><td style="padding:10px 14px">'+h.name+'</td><td style="padding:10px 14px;font-family:var(--mono);color:var(--text2)">'+(h.nav?fmt(h.nav):'--')+'</td><td style="padding:10px 14px;font-family:var(--mono);font-weight:500" class="'+pctCls(e.gszzl)+'">'+(e.gsz?'~'+fmt(e.gsz):(h.nav&&e.gszzl!=null?'~'+fmt(h.nav*(1+e.gszzl/100)):'--'))+'</td><td style="padding:10px 14px;font-family:var(--mono)" class="'+pctCls(e.gszzl)+'">'+pctSign(e.gszzl)+'</td><td style="padding:10px 14px;font-family:var(--mono)" class="'+(p!=null?(p>=0?'up-color':'dn-color'):'na-color')+'">'+(p!=null?(p>=0?'+':'')+fmt(p)+'元':'--')+'</td><td style="padding:10px 14px;font-family:var(--mono);font-size:11px;color:var(--text3)">'+(e.acc||'?')+'%</td></tr>';}).join('');
  el.innerHTML='<div class="alert alert-warn" style="margin-bottom:12px">⚠️ 公募基金每天15:00后才公布官方净值，盘中为估算值。</div><div style="background:var(--bg2);border:1px solid var(--border);border-radius:4px;overflow:hidden"><table style="width:100%;border-collapse:collapse"><thead><tr style="background:var(--bg3)"><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">代码</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">名称</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">昨日净值</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">今日估值~</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">涨跌</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">今日预计</th><th style="padding:8px 14px;text-align:left;font-family:var(--mono);font-size:10px;color:var(--text3);font-weight:400">精度</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function renderNews(el){el.innerHTML='<div class="news-list">'+NEWS.map(n=>'<div class="news-item"><div class="news-sector">'+n.sector+'</div><div class="news-text">'+n.text+'</div><div class="news-meta">'+n.time+'</div></div>').join('')+'</div>'}
function renderSuggestion(el){
  const now=new Date(),b15=now.getHours()<15;
  el.innerHTML='<div class="alert '+(b15?'alert-info':'alert-warn')+'" style="margin-bottom:12px">'+(b15?'⚡ 距今日截止（15:00）还有时间，如需操作请尽快提交。':'⚠️ 今日15:00已过，提交的操作将以明日净值成交。')+'</div>'+
  holdings.map(h=>{const s=getSig(h.code);return '<div class="suggestion-card fade-in"><div class="suggestion-header"><div class="suggestion-name">'+h.name+' <span style="font-family:var(--mono);font-size:11px;color:var(--text3)">'+h.code+'</span></div><div class="suggestion-pill '+s.cls+'">'+s.label+'</div></div><div class="suggestion-body">'+s.reason+'</div></div>'}).join('')+
  '<div class="alert alert-warn" style="margin-top:8px">⚠️ 以上建议仅供参考，不构成投资建议。投资有风险，请结合自身情况决策。</div>';
}
function renderSettings(el){
  const total=holdings.reduce((s,h)=>s+(h.value||0),0);
  el.innerHTML='<div class="settings-section"><div class="settings-title">持仓管理</div>'+
  holdings.map((h,i)=>'<div class="settings-row"><div><div style="font-size:13px;color:var(--text)">'+h.name+'</div><div style="font-family:var(--mono);font-size:11px;color:var(--text3)">'+h.code+' · '+(h.sector||'未分类')+'</div></div><div style="display:flex;align-items:center;gap:10px"><div style="text-align:right"><div class="settings-value">'+fmtM(h.value)+'</div>'+(h.cost?'<div style="font-size:11px;color:var(--text3);font-family:var(--mono)">成本 '+fmtM(h.cost)+'</div>':'')+'</div><button class="btn btn-danger" style="padding:4px 10px;font-size:11px" onclick="removeFund('+i+')">移除</button></div></div>').join('')+
  (!holdings.length?'<div style="color:var(--text3);font-size:13px;padding:12px 0">暂无持仓</div>':'')+
  '</div><div class="settings-section"><div class="settings-title">仓位分析</div>'+
  holdings.map(h=>{const p=total>0?h.value/total*100:0;return '<div class="settings-row"><span class="settings-label">'+h.name+'</span><div style="display:flex;align-items:center;gap:10px"><div style="width:80px;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+p+'%;background:var(--gold);border-radius:2px"></div></div><span class="settings-value">'+p.toFixed(1)+'%</span></div></div>'}).join('')+
  '</div><div class="settings-section"><div class="settings-title">赎回费参考</div>'+
  '<div class="settings-row"><span class="settings-label">持有 &lt; 7天</span><span class="settings-value up-color">1.5%（避免）</span></div>'+
  '<div class="settings-row"><span class="settings-label">持有 7-30天</span><span class="settings-value" style="color:#c08000">0.5%-1%</span></div>'+
  '<div class="settings-row"><span class="settings-label">持有 &gt; 1年</span><span class="settings-value dn-color">0%（免费）</span></div>'+
  '</div><div class="settings-section"><div class="settings-title">账号</div>'+
  '<div class="settings-row"><span class="settings-label">当前登录</span><span class="settings-value">'+currentUser+'</span></div>'+
  '<div class="settings-row"><span class="settings-label">数据存储</span><span class="settings-value dn-color">☁️ 云端同步</span></div>'+
  '</div><div class="settings-section"><div class="settings-title">危险操作</div>'+
  '<button class="btn btn-danger" style="padding:8px 20px" onclick="clearAll()">清空所有持仓</button></div>';
}

// ─── 持仓 CRUD ─────────────────────────────────────────────────
function openAddModal(){document.getElementById('modal-backdrop').classList.add('show');document.getElementById('m-code').focus()}
function closeModal(){document.getElementById('modal-backdrop').classList.remove('show');['m-code','m-name','m-value','m-cost','m-sector'].forEach(id=>document.getElementById(id).value='')}
function closeModalOutside(e){if(e.target.id==='modal-backdrop')closeModal()}

async function addFund(){
  const code=document.getElementById('m-code').value.trim();
  if(!code){alert('请输入代码');return}
  if(holdings.find(h=>h.code===code)){alert('该代码已存在');return}
  holdings.push({code,name:document.getElementById('m-name').value.trim()||code,value:parseFloat(document.getElementById('m-value').value)||0,cost:parseFloat(document.getElementById('m-cost').value)||null,sector:document.getElementById('m-sector').value.trim()||'其他',nav:null});
  await saveHoldings();closeModal();renderAll();toast('已添加 '+code);
}

async function quickAdd(){
  const code=document.getElementById('quick-code').value.trim();
  if(!code)return;
  if(holdings.find(h=>h.code===code)){toast('该代码已存在');return}
  holdings.push({code,name:code,value:0,cost:null,sector:'待分类',nav:null});
  document.getElementById('quick-code').value='';
  await saveHoldings();renderAll();toast('已添加 '+code);
}

async function removeFund(i,e){
  if(e)e.stopPropagation();
  const removed=holdings[i];
  holdings.splice(i,1);
  if(editingIndex===i)editingIndex=-1;
  else if(editingIndex>i)editingIndex--;
  await saveHoldings();renderAll();
  const t=document.createElement('div');
  t.innerHTML='已删除 <b>'+removed.name+'</b> &nbsp;<span style="color:var(--blue);cursor:pointer;text-decoration:underline" onclick="undoRemove(this)">撤销</span>';
  t.dataset.removed=JSON.stringify(removed);t.dataset.idx=i;
  t.style.cssText='position:fixed;bottom:20px;right:20px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);padding:9px 16px;border-radius:4px;font-family:var(--mono);font-size:12px;z-index:500;animation:fadeIn .2s ease;display:flex;align-items:center;gap:8px';
  document.body.appendChild(t);
  const tid=setTimeout(()=>t.remove(),4000);
  t.querySelector('span').addEventListener('click',()=>clearTimeout(tid));
}

async function undoRemove(el){
  const t=el.closest('[data-removed]');if(!t)return;
  const removed=JSON.parse(t.dataset.removed),idx=parseInt(t.dataset.idx);
  holdings.splice(Math.min(idx,holdings.length),0,removed);
  await saveHoldings();renderAll();t.remove();toast('已恢复 '+removed.name);
}

async function clearAll(){
  if(!confirm('确认清空所有持仓？'))return;
  holdings=[];await saveHoldings();renderAll();
}

// ─── 刷新 ──────────────────────────────────────────────────────
function refreshAll(){
  if(refreshing)return;refreshing=true;
  const icon=document.getElementById('refresh-icon');
  icon.innerHTML='<span class="spin"></span>';
  setTimeout(()=>{refreshing=false;icon.textContent='↻';renderAll();toast('已刷新')},1500);
}

function toast(msg){
  const t=document.createElement('div');t.textContent=msg;
  t.style.cssText='position:fixed;bottom:20px;right:20px;background:var(--bg4);border:1px solid var(--border2);color:var(--text);padding:8px 16px;border-radius:4px;font-family:var(--mono);font-size:12px;z-index:500;animation:fadeIn .2s ease';
  document.body.appendChild(t);setTimeout(()=>t.remove(),2500);
}

function renderAll(){renderSidebar();updateSummary();renderTab(currentTab)}

// ─── 快捷键 ────────────────────────────────────────────────────
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeModal();
  if(e.key==='r'&&!e.ctrlKey&&!e.metaKey&&document.activeElement.tagName!=='INPUT')refreshAll();
});
document.getElementById('quick-code').addEventListener('keydown',e=>{if(e.key==='Enter')quickAdd()});
document.getElementById('m-code').addEventListener('keydown',e=>{if(e.key==='Enter')addFund()});
document.getElementById('auth-password').addEventListener('keydown',e=>{if(e.key==='Enter')doAuth()});
document.getElementById('auth-username').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('auth-password').focus()});

// ─── 自动登录（session恢复）──────────────────────────────────
(async function init(){
  const t=sessionStorage.getItem('dp_token');
  const u=sessionStorage.getItem('dp_user');
  if(t&&u){
    token=t;currentUser=u;
    const res=await fetch('/api/verify',{headers:{'Authorization':'Bearer '+t}}).catch(()=>null);
    if(res&&res.ok){
      await loadHoldings();showApp();return;
    }
  }
  // 显示登录页
})();
</script>
</body>
</html>`;

// ─── Worker 主逻辑 ────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API 路由
    if (url.pathname === '/api/auth') return handleAuth(request, env);
    if (url.pathname === '/api/verify') return handleVerify(request, env);
    if (url.pathname === '/api/holdings') return handleHoldings(request, env);

    // 返回前端页面
    return new Response(HTML, {
      headers: {'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store'}
    });
  }
};

// ─── 简单 token 生成（用户名+时间戳的 base64）────────────────
function makeToken(username) {
  const payload = username + ':' + Date.now();
  return btoa(payload);
}
function parseToken(token) {
  try { return atob(token).split(':')[0]; } catch { return null; }
}

// ─── 密码哈希（简单 SHA-256）────────────────────────────────
async function hashPassword(password) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ─── 认证接口 ────────────────────────────────────────────────
async function handleAuth(request, env) {
  try {
  const {action, username, password} = await request.json();
  if (!env.USERS) return json({success:false, error:'KV存储未绑定，请检查Worker配置'});
  const hash = await hashPassword(password);
  const key = 'user:' + username.toLowerCase();

  if (action === 'register') {
    const existing = await env.USERS.get(key);
    if (existing) return json({success:false, error:'账号已存在，请直接登录'});
    await env.USERS.put(key, JSON.stringify({username, hash, created: Date.now()}));
    const token = makeToken(username);
    return json({success:true, token, username});
  }

  if (action === 'login') {
    const data = await env.USERS.get(key);
    if (!data) return json({success:false, error:'账号不存在，请先注册'});
    const user = JSON.parse(data);
    if (user.hash !== hash) return json({success:false, error:'密码错误'});
    const token = makeToken(username);
    return json({success:true, token, username});
  }

  return json({success:false, error:'无效操作'});
  } catch(e) {
    return json({success:false, error:'服务器内部错误: ' + e.message});
  }
}

// ─── 验证 token ───────────────────────────────────────────────
async function handleVerify(request, env) {
  const username = getUser(request);
  if (!username) return new Response('Unauthorized', {status: 401});
  const key = 'user:' + username.toLowerCase();
  const data = await env.USERS.get(key);
  if (!data) return new Response('Unauthorized', {status: 401});
  return json({success:true, username});
}

// ─── 持仓数据接口 ─────────────────────────────────────────────
async function handleHoldings(request, env) {
  const username = getUser(request);
  if (!username) return new Response('Unauthorized', {status: 401});
  const key = 'holdings:' + username.toLowerCase();

  if (request.method === 'GET') {
    const data = await env.HOLDINGS.get(key);
    return json({success:true, holdings: data ? JSON.parse(data) : []});
  }

  if (request.method === 'POST') {
    const {holdings} = await request.json();
    await env.HOLDINGS.put(key, JSON.stringify(holdings));
    return json({success:true});
  }

  return json({success:false, error:'Method not allowed'});
}

// ─── 工具 ────────────────────────────────────────────────────
function getUser(request) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace('Bearer ', '');
  return token ? parseToken(token) : null;
}
function json(data) {
  return new Response(JSON.stringify(data), {headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
}
