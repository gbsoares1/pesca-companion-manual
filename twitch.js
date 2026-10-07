(()=>{'use strict';if(globalThis.companionTwitchActive)return;globalThis.companionTwitchActive=true;let view=null,todayWatch=null,fishWatch=null;
function restoreView(){if(!view)return;for(const [el,x,y] of view.positions)if(el.isConnected){el.scrollLeft=x;el.scrollTop=y;}window.scrollTo(view.x,view.y);view=null;}

function editor(){const inputs=[...document.querySelectorAll('[data-a-target="chat-input"]')].filter(e=>e.getClientRects().length);return inputs.length===1?inputs[0]:null;}
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
if(sender.id!==chrome.runtime.id||!/^\/(?:[a-z0-9_]+|popout\/[a-z0-9_]+\/chat)\/?$/i.test(location.pathname))return;
 if(m.type==='armToday'){
 todayWatch?.resolve?.({today:null});todayWatch?.observer.disconnect();if(todayWatch?.timer)clearTimeout(todayWatch.timer);
 const seen=new WeakSet([...document.querySelectorAll('[data-a-target="chat-line-message"]')]);const watch={value:null,observer:null,timer:null,resolve:null,user:m.user||''};
 watch.observer=new MutationObserver(()=>{for(const row of document.querySelectorAll('[data-a-target="chat-line-message"]')){if(seen.has(row))continue;const author=row.getAttribute('data-a-user')||row.querySelector('[data-a-target="chat-message-username"]')?.textContent||row.querySelector('[data-a-user]')?.getAttribute('data-a-user')||'';if(author.trim().toLowerCase().replace(/:$/,'')!=='twishgamebot')continue;const text=row.querySelector('[data-a-target="chat-line-message-body"]')?.textContent||row.textContent||'';const data=CompanionReplies.today(text,watch.user);if(data){watch.value={...data,at:Date.now()};watch.observer.disconnect();clearTimeout(watch.timer);watch.resolve?.({today:watch.value});watch.resolve=null;return;}}});
 watch.observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-a-user','data-a-target']});watch.timer=setTimeout(()=>{watch.observer.disconnect();watch.resolve?.({today:null});watch.resolve=null;},15000);todayWatch=watch;reply({armed:true});return;
}
if(m.type==='awaitTodayResult'){if(!todayWatch||todayWatch.value){reply({today:todayWatch?.value||null});return;}todayWatch.resolve=reply;return true;}
if(m.type==='todayResult'){reply({today:todayWatch?.value||null});return;}
if(m.type==='cancelToday'){todayWatch?.observer.disconnect();if(todayWatch?.timer)clearTimeout(todayWatch.timer);todayWatch?.resolve?.({today:null});todayWatch=null;reply({ok:true});return;}
if(m.type==='armFish'){
 fishWatch?.observer.disconnect();if(fishWatch?.timer)clearTimeout(fishWatch.timer);fishWatch?.resolve?.({fish:null});
 const seen=new WeakSet([...document.querySelectorAll('[data-a-target="chat-line-message"]')]);const watch={value:null,observer:null,timer:null,resolve:null,commandSeen:false,user:m.user||''};
 watch.observer=new MutationObserver(()=>{for(const row of document.querySelectorAll('[data-a-target="chat-line-message"]')){if(seen.has(row))continue;const author=row.getAttribute('data-a-user')||row.querySelector('[data-a-target="chat-message-username"]')?.textContent||row.querySelector('[data-a-user]')?.getAttribute('data-a-user')||'';const text=row.querySelector('[data-a-target="chat-line-message-body"]')?.textContent||row.textContent||'';const who=author.trim().toLowerCase().replace(/:$/,'');if(who===watch.user.toLowerCase().replace(/^@/,'')&&/\$pescar\b/i.test(text)){watch.commandSeen=true;seen.add(row);continue;}if(!watch.commandSeen){if(who==='twishgamebot'&&CompanionReplies.fish(text,watch.user))seen.add(row);continue;}if(who!=='twishgamebot')continue;const data=CompanionReplies.fish(text,watch.user);if(data){watch.value={...data,at:Date.now()};watch.observer.disconnect();clearTimeout(watch.timer);watch.resolve?.({fish:watch.value});watch.resolve=null;return;}}});
 watch.observer.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-a-user','data-a-target']});watch.timer=setTimeout(()=>{watch.observer.disconnect();watch.resolve?.({fish:null});watch.resolve=null;},15000);fishWatch=watch;reply({armed:true});return;
}
// Responde diretamente à mutação do chat, sem consultar por temporizadores da aba inativa.
if(m.type==='awaitFishResult'){if(!fishWatch||fishWatch.value){reply({fish:fishWatch?.value||null});return;}fishWatch.resolve=reply;return true;}
if(m.type==='fishResult'){reply({fish:fishWatch?.value||null});return;}
if(m.type==='cancelFish'){fishWatch?.observer.disconnect();if(fishWatch?.timer)clearTimeout(fishWatch.timer);fishWatch?.resolve?.({fish:null});fishWatch=null;reply({ok:true});return;}
if(m.type==='chatBottom'){view=null;const lines=[...document.querySelectorAll('[data-a-target="chat-line-message"]')];let area=lines.at(-1)?.parentElement;while(area&&area!==document.body){if(area.scrollHeight>area.clientHeight&&['auto','scroll'].includes(getComputedStyle(area).overflowY)){area.scrollTop=area.scrollHeight;break;}area=area.parentElement;}reply({ok:true});return;}
const input=editor();
if(m.type==='focusEditor'){
if(!input||document.querySelector('iframe[src*="captcha"],iframe[src*="arkoselabs"]')){reply({error:'Editor indisponível ou verificação pendente.'});return;}
view={x:window.scrollX,y:window.scrollY,positions:[...document.querySelectorAll('div')].filter(e=>e.scrollHeight>e.clientHeight&&['auto','scroll'].includes(getComputedStyle(e).overflowY)).map(e=>[e,e.scrollLeft,e.scrollTop])};
input.focus({preventScroll:true});reply({focused:document.activeElement===input||input.contains(document.activeElement)});return;
}
if(m.type==='insertChatCommand'){
 const text=(input?.value??input?.innerText??'').replace(/\uFEFF/g,'').trim();if(!input||!navigator.onLine||document.querySelector('iframe[src*="captcha"],iframe[src*="arkoselabs"]')||typeof m.command!=='string'||!/^\$[a-z0-9_ ]{1,100}$/i.test(m.command)){reply({error:'Chat indisponível para preencher.'});return;}if(text&&text!==m.command){reply({error:'Há um rascunho ou texto não reconhecido no chat. Recarregue a aba fixa antes de tentar novamente.'});return;}
 (async()=>{const editable=input.matches?.('[contenteditable="true"]')?input:input.querySelector?.('[contenteditable="true"]')||input;editable.focus({preventScroll:true});if(!text){const clipboard=new DataTransfer();clipboard.setData('text/plain',m.command);editable.dispatchEvent(new ClipboardEvent('paste',{clipboardData:clipboard,bubbles:true,cancelable:true,composed:true}));}for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,100));const strings=[...editable.querySelectorAll('[data-slate-string]')];const current=strings.length?strings.map(e=>e.textContent).join(''):(editable.value??editable.innerText??'').replace(/\uFEFF/g,'').trim();const placeholder=editable.querySelector('[data-slate-placeholder]');if(current===m.command&&(!placeholder||!placeholder.getClientRects().length)){reply({hasCommand:true});return;}}reply({error:'O editor da Twitch não reconheceu o comando. Nenhum envio realizado.'});})().catch(()=>reply({error:'Não foi possível colar no editor da Twitch.'}));return true;
}
if(m.type==='submitNative'){
 const text=(input?.value??input?.innerText??'').replace(/\uFEFF/g,'').trim();
 const buttons=[...document.querySelectorAll('button[data-a-target="chat-send-button"]')].filter(e=>e.getClientRects().length);
 if(!input||text!==m.command||!navigator.onLine||document.querySelector('iframe[src*="captcha"],iframe[src*="arkoselabs"]')){reply({error:'Texto ou chat indisponível para envio.'});return;}
 const button=buttons.length===1?buttons[0]:null;
 if(!button||button.disabled||button.getAttribute('aria-disabled')==='true'){reply({error:'O botão de envio da Twitch está indisponível. Confira o chat.'});return;}
 const r=button.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,top=document.elementFromPoint(x,y);if(r.width<=0||r.height<=0||!Number.isFinite(x)||!Number.isFinite(y)||(top!==button&&!button.contains(top))){reply({error:'O botão Chat está coberto ou fora da área disponível.'});return;}button.click();reply({clicked:true});return;
}
if(m.type==='restoreView'){restoreView();reply({ok:true});return;}
if(m.type==='probe'){reply({ready:!!input});return;}
if(m.type==='prepareNative'){
if(!input||!navigator.onLine||!input.getClientRects().length){reply({error:'Chat indisponível.'});return;}
if(document.querySelector('iframe[src*="captcha"],iframe[src*="arkoselabs"]')){reply({error:'Resolva a verificação manualmente.'});return;}
const text=(input.value??input.innerText??'').replace(/\uFEFF/g,'').trim();
if(text&&text!==(m.command||'$pescar')){reply({error:'Há outro rascunho no chat. Nenhuma alteração feita.'});return;}
const r=input.getBoundingClientRect();const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(top!==input&&!input.contains(top)){reply({error:'O editor está coberto por um aviso. Feche o aviso manualmente.'});return;}reply({x:r.left+r.width/2,y:r.top+r.height/2,hasCommand:text===(m.command||'$pescar'),focused:document.activeElement===input||input.contains(document.activeElement)});return;}
if(m.type==='nativeStatus'){const text=(input?.value??input?.innerText??'').replace(/\uFEFF/g,'').trim();restoreView();reply({remains:!input||!!text,cleared:!!input&&!text});}
});})();
