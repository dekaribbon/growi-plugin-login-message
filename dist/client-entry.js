const p="/plugin/login-message",s="Welcome to our wiki! Please log in to access content.",f=["/login","/register","/forgot-password"];let r=null,c=!1;function a(){const e=window.location.pathname;return f.some(n=>e===n||e.startsWith(n+"/"))}async function w(){var e,n;try{const t=await fetch(`/_api/v3/page?path=${encodeURIComponent(p)}`,{credentials:"include"});if(!t.ok)return s;const o=await t.json(),i=(n=(e=o==null?void 0:o.page)==null?void 0:e.revision)==null?void 0:n.body;return i&&typeof i=="string"&&i.trim().length>0?i.trim():s}catch{return s}}function y(e){const n=document.createElement("div");n.id="growi-plugin-login-message";const t=document.createElement("div");t.className="growi-login-message-content";const o=e.split(`
`);for(const i of o){const g=document.createElement("p");g.textContent=i,t.appendChild(g)}return n.appendChild(t),n}const l="growi-plugin-login-message-style";function h(){if(document.getElementById(l))return;const e=document.createElement("style");e.id=l,e.textContent=`
    #growi-plugin-login-message {
      width: 100%;
      max-width: 520px;
      margin: 0 auto 24px auto;
      padding: 16px 20px;
      border-radius: 8px;
      background: #f0f7ff;
      border: 1px solid #b3d4ff;
      box-sizing: border-box;
    }
    #growi-plugin-login-message .growi-login-message-content {
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      text-align: center;
    }
    #growi-plugin-login-message .growi-login-message-content p {
      margin: 4px 0;
      padding: 0;
    }
  `,document.head.appendChild(e)}function u(){a()&&(document.getElementById("growi-plugin-login-message")||c||(c=!0,d(),h(),w().then(e=>{const n=y(e),t=document.querySelector(".nologin-header")||document.querySelector(".noLogin-form-errors")||document.querySelector(".login-form")||document.querySelector('form[action*="login"]')||document.querySelector(".nologin")||document.querySelector(".col-md-4")||document.querySelector(".col-md-6");if(t!=null&&t.parentElement)t.parentElement.insertBefore(n,t);else{const o=document.querySelector("main")||document.querySelector("#main")||document.querySelector(".main")||document.body;o.insertBefore(n,o.firstChild)}}).finally(()=>{c=!1})))}function d(){var e;(e=document.getElementById("growi-plugin-login-message"))==null||e.remove()}function E(){r=new MutationObserver(()=>{a()&&!document.getElementById("growi-plugin-login-message")&&u()}),r.observe(document.body,{childList:!0,subtree:!0})}function b(){r==null||r.disconnect(),r=null}function m(){u(),E()}function v(){var e;b(),d(),(e=document.getElementById(l))==null||e.remove()}window.pluginActivators==null&&(window.pluginActivators={});window.pluginActivators["growi-plugin-login-message"]={activate:m,deactivate:v};m();
