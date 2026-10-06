(()=>{'use strict';if(globalThis.fishReaderActive)return;globalThis.fishReaderActive=true;let busy=false,lastProfileAt=0,lastSnapshotSignature=null;
const inventoryMatch=()=>location.pathname.match(/^\/c\/([a-z0-9_]+)\/([a-z0-9_]+)\/inventory$/i);
const currentUser=()=>inventoryMatch()?.[2]?.toLowerCase()||CompanionSiteData.profile()?.name||CompanionSiteData.account()||null;
function collectSnapshot(){ const fish=[...document.querySelectorAll('.inv-slot.clickable[title]')].filter(e=>{try{return new URL(e.querySelector('img')?.src||'').pathname.includes('/fish/');}catch{return false;}}).map(e=>({name:e.title,count:Number(e.querySelector('.inv-count')?.textContent||1),tier:[...e.classList].find(x=>x.startsWith('tier-'))?.slice(5)||'',image:e.querySelector('img')?.src||'',protected:!!e.querySelector('.inv-whitelist-badge')}));
 return {fish,pageStartedAt:performance.timeOrigin,directSaleTotal:CompanionSiteData.number(document.querySelector('.inv-sell-actions .coin-value')?.textContent),profile:CompanionSiteData.profile(),at:Date.now(),cards:[...document.querySelectorAll('.stat-card')].map(e=>e.innerText)};
}

chrome.runtime.onMessage.addListener((m,sender,reply)=>{if(sender.id===chrome.runtime.id&&m.type==='readerPing'){reply({alive:true,pageStartedAt:performance.timeOrigin});read();}});
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 if(sender.id!==chrome.runtime.id||!inventoryMatch())return;
 if(m.type==='snapshot'){
 reply(collectSnapshot());return;
 }
 if(m.type==='inspectFish'||m.type==='setProtection'){
 (async()=>{
 document.querySelector('.sellmodal-close')?.click();
 const slot=[...document.querySelectorAll('.inv-slot.clickable[title]')].find(e=>e.title===m.name);
 if(!slot)throw Error('Peixe não encontrado. Atualize a lista.');slot.click();
 await new Promise(r=>setTimeout(r,400));
 if(m.type==='setProtection'){
 const button=document.querySelector('.sellmodal-whitelist-btn');if(!button)throw Error('Proteção oficial indisponível.');
 const status=()=>{const t=(document.querySelector('.sellmodal-whitelist-btn')?.textContent||'').toLowerCase();return /desproteger|remover/.test(t)?true:/proteger/.test(t)?false:null;};
 if(status()===null)throw Error('Estado da proteção desconhecido.');if(status()!==!!m.protected){button.click();for(let i=0;i<30;i++){const current=[...document.querySelectorAll('.inv-slot.clickable[title]')].find(e=>e.title===m.name);if(status()===!!m.protected&&current&&!!current.querySelector('.inv-whitelist-badge')===!!m.protected)break;await new Promise(r=>setTimeout(r,300));}}
 const confirmedSlot=[...document.querySelectorAll('.inv-slot.clickable[title]')].find(e=>e.title===m.name);if(status()!==!!m.protected||!confirmedSlot||!!confirmedSlot.querySelector('.inv-whitelist-badge')!==!!m.protected)throw Error('Proteção não confirmada pelo site.');reply({protected:status(),at:Date.now()});return;
 }
 if(m.market){const btn=[...document.querySelectorAll('button')].find(e=>e.getClientRects().length&&/mercado/i.test(e.textContent));if(!btn)throw Error('Opção de mercado indisponível.');btn.click();await new Promise(r=>setTimeout(r,1200));}
 const box=document.querySelector('.marketmodal-box')||document.querySelector('.sellmodal-box');
 const prices=[...document.querySelectorAll('.marketmodal-price-card')].map(e=>({label:e.querySelector('.marketmodal-price-label')?.textContent,value:e.querySelector('.coin-value')?.textContent,hint:e.querySelector('.marketmodal-price-hint')?.textContent}));
 reply({at:Date.now(),text:box?.innerText||'Abra o inventário fixo para ver os detalhes.',prices,limits:(()=>{const e=document.querySelector('.marketmodal-price-input input');return e?{min:e.min,max:e.max,value:e.value}:null;})(),name:document.querySelector('.sellmodal-species-name')?.textContent||m.name,tier:document.querySelector('.sellmodal-species-tier')?.textContent||''});
 })().catch(e=>reply({error:e.message}));return true;
 }
});
async function read(){if(busy||!inventoryMatch())return;busy=true;
try{const {fishState:s}=await chrome.storage.local.get('fishState');if(!s?.enabled)return;
const user=currentUser();
const els=[...document.querySelectorAll('.stat-card.has-chime .value')].filter(e=>e.getClientRects().length);
let seconds=TwishReminderCore.seconds(els.length===1?els[0].textContent.trim().replace(/!$/,''):'');
let error=!navigator.onLine?'Sem conexão.':seconds===null?(document.querySelector('.shell-user-trigger')?'Contador ainda indisponível no inventário fixo. Aguarde a leitura.':'Entre com Twitch no inventário fixo.'):null;
if(/verificação rápida|captcha|pesca.{0,30}bloquead/i.test(document.body.innerText)){seconds=null;error='Verificação ou bloqueio: resolva manualmente.';}
const message={type:'reading',seconds,error,pageStartedAt:performance.timeOrigin,user};if(!error&&document.querySelector('.inv-sell-actions')){const snapshot=collectSnapshot();if(snapshot.profile?.name===user){const signature=JSON.stringify([snapshot.fish,snapshot.directSaleTotal,{...snapshot.profile,at:0}]);if(signature!==lastSnapshotSignature){message.snapshot=snapshot;lastSnapshotSignature=signature;}}}if(!error){const profile=CompanionSiteData.profile();if(profile?.equipment?.length===4)message.equipment=profile.equipment;message.wallet=profile?{coins:profile.coins,pearls:profile.pearls}:null;message.fishProtection=[...document.querySelectorAll('.inv-slot.clickable[title]')].filter(e=>{try{return new URL(e.querySelector('img')?.src||'').pathname.includes('/fish/');}catch{return false;}}).map(e=>({name:e.title,protected:!!e.querySelector('.inv-whitelist-badge')}));}if(!error)message.liveRod=[...document.querySelectorAll('.inv-equip-slot')].map(e=>e.querySelector('.inv-equip-name')?.textContent?.trim()).find(name=>/^vara\b/i.test(name||''))||null;if(!error&&document.querySelector('.player-card-name')?.textContent?.trim().toLowerCase()===user)message.event=CompanionSiteData.event();if(s.catchResult?.caught&&!s.catchResult.image){const slot=[...document.querySelectorAll('.inv-slot.clickable[title]')].find(e=>e.title.toLowerCase()===s.catchResult.name.toLowerCase());message.catchImage=slot?.querySelector('img')?.src||null;}if(!lastProfileAt){message.profile=CompanionSiteData.profile();lastProfileAt=Date.now();}await chrome.runtime.sendMessage(message);
}catch{}finally{busy=false;}}
setInterval(read,1000);read();})();
