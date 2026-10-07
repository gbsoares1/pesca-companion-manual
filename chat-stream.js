(()=>{'use strict';
if(!/^\/popout\/[a-z0-9_]+\/chat\/?$/i.test(location.pathname))return;
if(globalThis.companionChatStream)return;globalThis.companionChatStream=true;
let state=null,pending=null,timer=null,candidate=null;
const seen=new WeakMap();
const rows=()=>[...document.querySelectorAll('[data-a-target="chat-line-message"]')];
const read=row=>({author:(row.getAttribute('data-a-user')||row.querySelector('[data-a-target="chat-message-username"]')?.textContent||'').trim().toLowerCase().replace(/:$/,''),text:(row.querySelector('[data-a-target="chat-line-message-body"]')?.textContent||row.textContent||'').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim()});
for(const row of rows())seen.set(row,JSON.stringify(read(row)));
chrome.storage.local.get('fishState').then(v=>{state=v.fishState;});
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.fishState){state=changes.fishState.newValue;if(!state?.enabled)pending=null;}});
function scan(){
 if(!state?.enabled||!state.user)return;
 const channel=location.pathname.match(/^\/(?:popout\/)?([a-z0-9_]+)/i)?.[1];if(channel!==state.boat)return;
 const currentRows=rows();
 for(const [index,row] of currentRows.entries()){
  const data=read(row),signature=JSON.stringify(data);if(seen.get(row)===signature)continue;
  if(data.author==='twishgamebot'){
   const today=CompanionReplies.today(data.text,state.user);
   if(today){seen.set(row,signature);chrome.runtime.sendMessage({type:'todayOutcome',user:state.user,text:data.text,observedAt:Date.now()}).catch(()=>{});continue;}
  }
  if(data.author===state.user.toLowerCase().replace(/^@/,'')&&/\$pescar\b/i.test(data.text)){
   seen.set(row,signature);pending={at:Date.now(),user:state.user,before:new WeakSet(currentRows.slice(0,index+1))};continue;
  }
  if(!pending||pending.before.has(row)||Date.now()-pending.at>30000||data.author!=='twishgamebot')continue;
  const mention=new RegExp('@'+pending.user.replace(/^@/,'')+'(?![a-z0-9_])','i');
  if(!mention.test(data.text)||/hoje voc[eê] teve:|evento especial:|o evento .*acabou/i.test(data.text))continue;
  const attempt=pending;
  function deliver(text){
   if(pending!==attempt||!row.isConnected)return;
   const result=CompanionReplies.fish(text,attempt.user,true);if(!result)return;
   seen.set(row,signature);pending=null;clearTimeout(timer);
   chrome.runtime.sendMessage({type:'chatOutcome',user:attempt.user,commandAt:attempt.at,text}).catch(()=>{});
  }
  // Frases concluídas são reconhecidas na mutação, sem timer em aba inativa.
  if(CompanionReplies.fish(data.text,attempt.user)){deliver(data.text);continue;}
  if(candidate?.signature===signature&&candidate.row===row)continue;
  candidate={signature,row};clearTimeout(timer);
  timer=setTimeout(()=>{const complete=read(row);if(JSON.stringify(complete)===signature)deliver(complete.text);},350);
 }
}
new MutationObserver(scan).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-a-user','data-a-target']});
})();
