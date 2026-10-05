(()=>{
'use strict';
if(globalThis.companionBoatTrackerActive)return;
globalThis.companionBoatTrackerActive=true;
let busy=false;
const context=()=>{const match=location.pathname.match(/^\/c\/([a-z0-9_]+)(?:\/([a-z0-9_]+)\/inventory|\/(?:shop|ranking|tournament|expedicoes))\/?$/i);if(!match)return null;const user=(match[2]||document.querySelector('.shell-user-trigger')?.getAttribute('title')||'').trim().toLowerCase().replace(/^@/,'');return {boat:match[1].toLowerCase(),user:/^[a-z0-9_]{1,64}$/.test(user)?user:null};};
async function detectBoat(){
 if(busy||document.visibilityState==='hidden')return;
 const next=context();if(!next)return;
 busy=true;try{await chrome.runtime.sendMessage({type:'selectBoat',context:next});}catch{}finally{busy=false;}
}
window.addEventListener('focus',detectBoat);
document.addEventListener('visibilitychange',detectBoat);
setInterval(detectBoat,1000);detectBoat();
})();
