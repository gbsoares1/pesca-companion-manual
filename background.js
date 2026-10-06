function validCommand(text){
 // Varas só podem ser vendidas manualmente na loja.
 if(/^\$vender\s+vara(?:_|\s|$)/i.test(text))return false;
 const simple=['inventario','ranking','rankingascensao','ra','rankingpts','rankingcoins','rc','meurank','coins','points','pts','nivel','level','hoje','cooldown','destaque','apoio','loja','aceitar','recusar','entrar','join','rankingtorneio','rt','tempotorneio','tt','evento','comandos','tutorial','desequiparanzol','da','desequiparisca','di','cancelarduelo','cd'];
 if(simple.some(x=>text==='$'+x))return true;
 if(/^\$vender todos(?: |$)/.test(text))return text==='$vender todos';
 if(/^\$autovenda (on|off)$/.test(text))return true;
 if(/^\$titulo(?: [a-zA-Z0-9_-]{1,64})?$/.test(text))return true;
 if(/^\$(?:whitelist|wl|whitelistremove|wlr|duelar) [a-zA-Z0-9_]{1,64}$/.test(text))return true;
 return /^\$(?:vender|comprar|isca) [a-zA-Z0-9_]{1,64}(?: [1-9][0-9]{0,3})?$/.test(text);
}
'use strict';
const TEST_SEND=false; // Versão definitiva: envio apenas por clique e com cooldown disponível.
const DEFAULT_BOAT='faturetosl';
const normalizeUser=value=>{const text=String(value??'').trim().toLowerCase().replace(/^@/,'');return /^[a-z0-9_]{1,64}$/.test(text)?text:null;};
const inventoryUrl=(boatName=boat,userName=user)=>userName?'https://twish.com.br/c/'+boatName+'/'+userName+'/inventory':null;
let boat=DEFAULT_BOAT,user=null,INVENTORY=null;
const boatKey=key=>'boat:'+boat+':'+(user||'unknown')+':'+key;
function setContext(next={}){if(next.boat)boat=next.boat;if('user' in next)user=normalizeUser(next.user);INVENTORY=inventoryUrl();}
const contextFromTwish=url=>{try{const u=new URL(url);if(u.origin!=='https://twish.com.br')return null;const match=u.pathname.match(/^\/c\/([a-z0-9_]{1,64})(?:\/([a-z0-9_]{1,64})\/inventory|\/(?:shop|ranking|tournament|expedicoes))\/?$/i);return match?{boat:match[1].toLowerCase(),user:normalizeUser(match[2])}:null;}catch{return null;}};
const isChannel=url=>{try{const u=new URL(url);return u.origin==='https://www.twitch.tv'&&['/'+boat,'/popout/'+boat+'/chat'].includes(u.pathname);}catch{return false;}};
const isTwish=url=>{try{const u=new URL(url);return u.origin==='https://twish.com.br'&&u.pathname.startsWith('/c/');}catch{return false;}};
async function syncProtection(entries){
 const key=boatKey('companionSiteProtected');const saved=await chrome.storage.local.get(key);const locked=new Set(saved[key]||[]);
 for(const entry of entries||[])if(typeof entry.name==='string'&&typeof entry.protected==='boolean'){if(entry.protected)locked.add(entry.name);else locked.delete(entry.name);}
 const next=[...locked].sort();if(JSON.stringify(next)!==JSON.stringify([...(saved[key]||[])].sort()))await chrome.storage.local.set({[key]:next});
 const snapshotKey=boatKey('companionSnapshot');const queryKey=boatKey('query:profile:');const cache=await chrome.storage.local.get([snapshotKey,queryKey]);const patches={};for(const k of [snapshotKey,queryKey])if(cache[k]?.fish){let changed=false;const data=cache[k];data.fish=data.fish.map(fish=>{const entry=entries.find(e=>e.name===fish.name);if(entry&&typeof entry.protected==='boolean'&&fish.protected!==entry.protected){changed=true;return {...fish,protected:entry.protected};}return fish;});if(changed)patches[k]=data;}if(Object.keys(patches).length)await chrome.storage.local.set(patches);
}
async function readSnapshot(tabId,previousPage=null){for(let i=0;i<20;i++){const tab=await chrome.tabs.get(tabId);if(tab.url!==INVENTORY)throw Error('O inventário mudou.');if(tab.status!=='loading'){try{const data=await chrome.tabs.sendMessage(tabId,{type:'snapshot'});if(normalizeUser(data?.profile?.name)===user&&(!Number.isFinite(previousPage)||data.pageStartedAt>previousPage))return data;}catch{}}await new Promise(r=>setTimeout(r,500));}throw Error('Inventário indisponível. Confira o login.');}
async function freshSnapshot(tabId){let previous=null;try{previous=(await chrome.tabs.sendMessage(tabId,{type:'readerPing'}))?.pageStartedAt;}catch{}await chrome.tabs.reload(tabId);return readSnapshot(tabId,previous);}
async function saveSnapshot(data){await syncProtection(data.fish||[]);const patches={[boatKey('companionSnapshot')]:data,[boatKey('query:profile:')]:data,[boatKey('companionProfile')]:data.profile};const all=await chrome.storage.local.get(null);for(const key of Object.keys(all))if(key.startsWith(boatKey('fish:')))patches[key]=null;await chrome.storage.local.set(patches);}
async function sendNative(tabId,text='$pescar'){
 let attempted=false;
 const check=async()=>{const {companionOwnedChatTab:owned}=await chrome.storage.session.get('companionOwnedChatTab');const tab=await chrome.tabs.get(tabId);if(owned!==tabId||!isOwnedChatUrl(tab.url,boat))throw Error('A aba própria do chat mudou. Operação interrompida.');};
 try{await check();const editor=await chrome.tabs.sendMessage(tabId,{type:'prepareNative',command:text});if(editor.error)throw Error(editor.error);const focused=await chrome.tabs.sendMessage(tabId,{type:'focusEditor'});if(focused.error||!focused.focused)throw Error(focused.error||'O campo do chat não recebeu foco.');await check();const inserted=await chrome.tabs.sendMessage(tabId,{type:'insertChatCommand',command:text});if(inserted?.error||!inserted?.hasCommand)throw Error(inserted?.error||'O comando não foi confirmado no campo.');await new Promise(r=>setTimeout(r,250));await check();const submitted=await chrome.tabs.sendMessage(tabId,{type:'submitNative',command:text});attempted=!!submitted?.clicked;if(submitted?.error||!attempted)throw Error(submitted?.error||'O chat não confirmou o clique.');let cleared=false;for(let i=0;i<8;i++){await new Promise(r=>setTimeout(r,250));const status=await chrome.tabs.sendMessage(tabId,{type:'nativeStatus',command:text});if(status?.cleared===true){cleared=true;break;}}return {attempted,sent:cleared,retry:!cleared,message:cleared?'Mensagem enviada. Aguardando a resposta do bot.':'A Twitch não confirmou o envio. Confira o chat antes de tentar novamente.'};}catch(e){return {attempted,sent:false,retry:attempted,message:e.message||'Falha no envio.'};}finally{try{await chrome.tabs.sendMessage(tabId,{type:text==='$pescar'&&attempted?'chatBottom':'restoreView'});}catch{}}
}
let queue=Promise.resolve(),monitorOperation=null,chatOperation=null,referenceNavigation=false;
function isOwnedChatUrl(url,channel){try{const u=new URL(url);return u.origin==='https://www.twitch.tv'&&u.pathname.replace(/\/$/,'')==='/popout/'+channel+'/chat';}catch{return false;}}
// Referências próprias sobrevivem à recarga da extensão; nunca busca/adota abas por domínio.
async function restoreOwnedTab(key){const current=await chrome.storage.session.get(key);if(current[key]!==undefined)return current[key];const data=await chrome.storage.local.get('companionOwnedReferences'),record=data.companionOwnedReferences?.[key];if(!record)return undefined;try{const tab=await chrome.tabs.get(record.id);if(tab.pinned&&tab.url===record.url){await chrome.storage.session.set({[key]:tab.id});return tab.id;}}catch{}return undefined;}
async function rememberOwnedTab(key,tab){const data=await chrome.storage.local.get('companionOwnedReferences');await chrome.storage.local.set({companionOwnedReferences:{...(data.companionOwnedReferences||{}),[key]:{id:tab.id,url:tab.url}}});}
function ensureChat(){
 if(chatOperation)return chatOperation;
 chatOperation=(async()=>{
  const {fishState:s}=await chrome.storage.local.get('fishState');if(!s?.enabled)return null;
  const channel=s.boat||'faturetosl';const url='https://www.twitch.tv/popout/'+channel+'/chat?popout=';
  const id=await restoreOwnedTab('companionOwnedChatTab');let tab;
  try{if(id!==undefined)tab=await chrome.tabs.get(id);}catch{}
  if(!tab){tab=await chrome.tabs.create({url,active:false,pinned:true});await chrome.storage.session.set({companionOwnedChatTab:tab.id});}
  else if(!isOwnedChatUrl(tab.url,channel)){await chrome.tabs.update(tab.id,{url});}
  await chrome.tabs.update(tab.id,{muted:true,pinned:true,autoDiscardable:false});
  const result=await chrome.tabs.get(tab.id);await rememberOwnedTab('companionOwnedChatTab',result);return result;
 })().finally(()=>{chatOperation=null;});return chatOperation;
}
async function readyChat(){
 const tab=await ensureChat();if(!tab)throw Error('Ative o monitor para usar o chat.');
 for(let i=0;i<20;i++){
  const current=await chrome.tabs.get(tab.id);if(!isChannel(current.url))throw Error('O chat mudou de barco.');
  if(current.status!=='loading'){try{if((await chrome.tabs.sendMessage(tab.id,{type:'probe'}))?.ready)return current;}catch{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['replies.js','twitch.js']});}}
  await new Promise(r=>setTimeout(r,500));
 }
 throw Error('Chat do barco indisponível. Confira o login na aba própria da Twitch.');
}
function ensureMonitor(refresh=false){
 if(monitorOperation)return monitorOperation;
 monitorOperation=(async()=>{
  const {fishState:s}=await chrome.storage.local.get('fishState');if(!s?.enabled)return;setContext({boat:s.boat||DEFAULT_BOAT,user:s.user||null});if(!user)throw Error('Conta Twish não identificada. Abra uma página da Twish com sua conta para vincular a extensão.');
  const ownedId=await restoreOwnedTab('companionOwnedMonitorTab');
  let created=false;let tab;try{if(ownedId!==undefined)tab=await chrome.tabs.get(ownedId);}catch{}
  if(!tab){tab=await chrome.tabs.create({url:INVENTORY,active:false,pinned:true});created=true;await chrome.storage.session.set({companionOwnedMonitorTab:tab.id});}
  else if(tab.url!==INVENTORY){await chrome.tabs.update(tab.id,{url:INVENTORY});}
  await rememberOwnedTab('companionOwnedMonitorTab',await chrome.tabs.get(tab.id));
  // Mantém a aba carregada; os limites de timers do Chrome continuam valendo.
  try{await chrome.tabs.update(tab.id,{autoDiscardable:false,pinned:true});}catch{}
  const {fishState:latest}=await chrome.storage.local.get('fishState');
  if(latest){latest.monitorTabId=tab.id;latest.monitorError=null;await chrome.storage.local.set({fishState:latest});}
  await ensureChat();
  if(refresh&&!created){await chrome.tabs.reload(tab.id);return;}
  const current=await chrome.tabs.get(tab.id);
  if(current.status==='loading')return;
  if(current.url===INVENTORY){
   let alive=false;try{alive=(await chrome.tabs.sendMessage(tab.id,{type:'readerPing'}))?.alive===true;}catch{}
   if(!alive)await chrome.scripting.executeScript({target:{tabId:tab.id},files:['site-data.js','core.js','reader.js']});
  }

 })().catch(async(error)=>{const {fishState:s}=await chrome.storage.local.get('fishState');if(s){s.monitorError=error?.message||'Não foi possível iniciar o monitor. Abra o inventário fixo e confira o login.';await chrome.storage.local.set({fishState:s});}}).finally(()=>{monitorOperation=null;});return monitorOperation;
}
chrome.tabs.onRemoved.addListener(async id=>{const {fishState:s}=await chrome.storage.local.get('fishState');if(!s?.enabled)return;const owned=await chrome.storage.session.get(['companionOwnedMonitorTab','companionOwnedChatTab']);if(owned.companionOwnedMonitorTab===id)ensureMonitor();if(owned.companionOwnedChatTab===id)ensureChat();});
chrome.tabs.onUpdated.addListener(async(id,change)=>{if(!change.url)return;const {companionOwnedChatTab:chat}=await chrome.storage.session.get('companionOwnedChatTab');const {fishState:s}=await chrome.storage.local.get('fishState');if(s?.enabled&&chat===id&&!isOwnedChatUrl(change.url,s.boat||DEFAULT_BOAT))await ensureChat();const expected=s?.user?'https://twish.com.br/c/'+(s.boat||DEFAULT_BOAT)+'/'+s.user+'/inventory':null;if(!referenceNavigation&&s?.enabled&&s.monitorTabId===id&&isTwish(change.url)&&change.url!==expected)ensureMonitor();});
chrome.runtime.onStartup.addListener(async()=>{await chrome.storage.local.set({companionOwnedReferences:{}});await ensureMonitor(true);});
function handleMessage(m,sender,reply){
if(!sender.tab||!(isTwish(sender.url)||String(sender.url).startsWith('https://www.twitch.tv/')))return;
if(!['toggle','reading','fish','monitorHealth','openMonitor','command','snapshot','inspectFish','siteQuery','openOfficial','setProtection','selectBoat'].includes(m.type))return;
const originalReply=reply;let replied=false;reply=value=>{if(!replied){replied=true;originalReply(value);}};
const job=async()=>{
let {fishState:s={enabled:false,seconds:null,used:false}}=await chrome.storage.local.get('fishState');
await restoreOwnedTab('companionOwnedMonitorTab');await restoreOwnedTab('companionOwnedChatTab');setContext({boat:s.boat||DEFAULT_BOAT,user:s.user||null});s.boat=boat;s.user=user;
const migrationKey='companionBoatMigration';const migration=await chrome.storage.local.get(migrationKey);if(!migration[migrationKey]){const keys=['companionProfile','companionGoal','companionToday','companionSiteProtected','companionShopBalances'];const old=await chrome.storage.local.get(keys);const legacyUser=user||'madtraxbr';const mapped={};for(const key of keys){const target='boat:'+DEFAULT_BOAT+':'+legacyUser+':'+key;const existing=await chrome.storage.local.get(target);if(old[key]!==undefined&&existing[target]===undefined)mapped[target]=old[key];}await chrome.storage.local.set({...mapped,[migrationKey]:true});}
if(m.type==='selectBoat'){
 const tab=await chrome.tabs.get(sender.tab.id);const detected={...(contextFromTwish(tab.url)||{}),...(m.context||{})};const nextBoat=detected.boat||boat;const nextUser=normalizeUser(detected.user)??user;
 const {companionOwnedMonitorTab:owned}=await chrome.storage.session.get('companionOwnedMonitorTab');
 const {companionOwnedChatTab:chat}=await chrome.storage.session.get('companionOwnedChatTab');if(!nextBoat||!tab.active||sender.tab.id===owned||sender.tab.id===chat){reply({ok:false});return;}
 if(s.enabled&&user&&(nextBoat!==boat||nextUser!==user)){reply({ok:false,contextLocked:true,boat,user});return;}
 if(nextBoat!==boat||nextUser!==user){s={...s,enabled:!!s.enabled,boat:nextBoat,user:nextUser,monitorTabId:s.monitorTabId,seconds:null,used:false,at:0};setContext({boat:nextBoat,user:nextUser});await chrome.storage.local.set({fishState:s});if(s.enabled&&user)await ensureMonitor(true);}
 reply({ok:true,boat,user});return;
}
if(m.boat&&m.boat!==boat)throw Error('O barco mudou. Revise a ação no barco atual.');
delete s.logs;
const {companionOwnedMonitorTab:ownedId}=await chrome.storage.session.get('companionOwnedMonitorTab');
if(s.monitorTabId!==ownedId){delete s.monitorTabId;s.at=0;s.seconds=null;}
const save=()=>chrome.storage.local.set({fishState:s});
if(m.type==='openOfficial'){
 const routes={shop:'shop',ranking:'ranking',market:'market',tournament:'tournament',expedicoes:'expedicoes',inventory:user?user+'/inventory':null,manual:null};
 if(!(m.page in routes))throw Error('Página inválida.');
 if(!s.enabled)throw Error('Ative o plugin para abrir a aba de referência.');
 if(m.page==='inventory'&&!user)throw Error('Conta Twish ainda não identificada.');
 referenceNavigation=false;await ensureMonitor();const {fishState:latest}=await chrome.storage.local.get('fishState');
 referenceNavigation=true;await chrome.tabs.update(latest.monitorTabId,{url:m.page==='manual'?'https://twish.com.br/manual':'https://twish.com.br/c/'+boat+'/' +routes[m.page],active:true});return;
}
 if(m.type==='siteQuery'){
 const cacheKey=boatKey('query:'+m.page+':'+(m.category||''));
 if(!m.refresh){
  const cached=await chrome.storage.local.get(cacheKey);
  if(cached[cacheKey]){
   if(m.page!=='expedicoes'&&(m.page!=='shop'||(cached[cacheKey].catalogVersion===2&&cached[cacheKey].discountActive===!!(s.event&&/desconto na loja/i.test(s.event.text||'')&&/20\s*%/.test(s.event.text||'')&&s.event.seconds!==0)&&cached[cacheKey].day===new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'})))){reply(cached[cacheKey]);return;}
   if(m.page==='expedicoes'){const profileCache=await chrome.storage.local.get(boatKey('companionProfile'));
   const liveRod=s.liveRod||profileCache[boatKey('companionProfile')]?.equipment?.find(e=>/^vara\b/i.test(e?.name||''))?.name||null;
   if(cached[cacheKey].day===new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'})&&cached[cacheKey].rod===liveRod){reply(cached[cacheKey]);return;}}
  }
 }
 if(!s.enabled)throw Error('Ative o plugin para consultar a Twish.');referenceNavigation=false;
 if(m.page==='profile'){
  if(!s.enabled)throw Error('Ligue o monitor para consultar o inventário fixo.');await ensureMonitor();
  const {fishState:latest}=await chrome.storage.local.get('fishState');const data=m.refresh?await freshSnapshot(latest.monitorTabId):await readSnapshot(latest.monitorTabId);
   if(!data?.profile)throw Error('Perfil indisponível. Confira o login no inventário fixo.');if(normalizeUser(data.profile.name)!==user)throw Error('A conta da Twish mudou. Reabra sua página para sincronizar a extensão.');await syncProtection(data.fish||[]);await chrome.storage.local.set({[cacheKey]:data,[boatKey('companionProfile')]:data.profile,[boatKey('companionSnapshot')]:data});reply(data);return;
 }
 if(!['shop','ranking','tournament','expedicoes'].includes(m.page))throw Error('Consulta inválida.');
 const url='https://twish.com.br/c/'+boat+'/' +m.page;
 referenceNavigation=false;await ensureMonitor();const {fishState:latest}=await chrome.storage.local.get('fishState');const tab=await chrome.tabs.get(latest.monitorTabId);
 referenceNavigation=true;
 try{
 await chrome.tabs.update(tab.id,{url});
 let data;
 for(let i=0;i<12;i++){
  const current=await chrome.tabs.get(tab.id);if(current.url!==url&&current.status!=='loading')throw Error('A aba de consulta mudou.');
  if(current.status!=='loading'&&current.url===url){try{data=await chrome.tabs.sendMessage(tab.id,{type:'readPage',page:m.page,category:m.category});if(data&&!data.error)break;}catch{await chrome.scripting.executeScript({target:{tabId:tab.id},files:['site-data.js','expeditions.js','page-reader.js']});}}
  await new Promise(r=>setTimeout(r,500));
 }
 if(!data||data.error)throw Error(data?.error||'Página indisponível. Confira o login na Twish.');if(data.account&&normalizeUser(data.account)!==user)throw Error('A conta ativa da Twish não corresponde ao usuário configurado.');if(m.page==='expedicoes'){if(!Array.isArray(data.seas)||!data.day)throw Error('Dados do cais indisponíveis.');const profileCache=await chrome.storage.local.get(boatKey('companionProfile'));const liveRod=s.liveRod||profileCache[boatKey('companionProfile')]?.equipment?.find(e=>/^vara\b/i.test(e?.name||''))?.name||null;if(!liveRod)throw Error('A vara equipada ainda não foi identificada no inventário.');if(s.liveRod!==liveRod){s.liveRod=liveRod;await save();}data.rod=liveRod;}if(m.page==='shop'){data.discountActive=!!(s.event&&/desconto na loja/i.test(s.event.text||'')&&/20\s*%/.test(s.event.text||'')&&s.event.seconds!==0);data.day=new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});}if(data.balances)await chrome.storage.local.set({[boatKey('companionShopBalances')]:{...data.balances,at:data.at}});await chrome.storage.local.set({[cacheKey]:data});reply(data);return;
 }finally{try{await chrome.tabs.update(tab.id,{url:INVENTORY});await chrome.tabs.reload(tab.id);}finally{referenceNavigation=false;}}
}
if(m.type==='inspectFish'&&!m.refresh){const key=boatKey('fish:'+JSON.stringify([m.name,!!m.market]));const cached=await chrome.storage.local.get(key);if(cached[key]){reply(cached[key]);return;}}
if(m.type==='snapshot'&&!m.refresh){const key=boatKey('companionSnapshot');const cached=await chrome.storage.local.get(key);if(cached[key]){reply(cached[key]);return;}}
if(m.type==='snapshot'||m.type==='inspectFish'||m.type==='setProtection'){
 if(!s.enabled)throw Error('Ligue o monitor para carregar o inventário.');
 referenceNavigation=false;await ensureMonitor();const {fishState:latest}=await chrome.storage.local.get('fishState');
 const data=m.type==='snapshot'?(m.refresh?await freshSnapshot(latest.monitorTabId):await readSnapshot(latest.monitorTabId)):await chrome.tabs.sendMessage(latest.monitorTabId,{type:m.type,name:m.name,market:!!m.market,protected:!!m.protected});
 if(m.type==='inspectFish'&&!data?.error)await chrome.storage.local.set({[boatKey('fish:'+JSON.stringify([m.name,!!m.market]))]:data});
 if(m.type==='setProtection'&&typeof data?.protected==='boolean')await syncProtection([{name:m.name,protected:data.protected}]);
 if(m.type==='snapshot'){await syncProtection(data.fish||[]);}
 if(m.type==='snapshot')await saveSnapshot(data);reply(data);return;
}
if(m.type==='command'){
 const text=String(m.command||'');
 if(!validCommand(text))throw Error('Comando ou parâmetros inválidos.');
 if(!s.enabled)throw Error('Ligue o monitor antes de enviar comandos.');
  if(!user)throw Error('Conta Twish ainda não identificada.');
 if(text.startsWith('$vender ')){
  const {[boatKey('companionSiteProtected')]:locked=[]}=await chrome.storage.local.get(boatKey('companionSiteProtected'));
  const id=name=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[\s-]+/g,'_').replace(/[^a-z0-9_]/g,'');
  const args=text.split(' ');
  if(args[1]==='todos'&&locked.length)throw Error('Há espécies protegidas na Twish. Venda por espécie.');
  if(locked.some(name=>id(name)===args[1]))throw Error('Espécie protegida na Twish.');
  if(s.monitorTabId===undefined)throw Error('Inventário fixo indisponível.');
  const live=await chrome.tabs.sendMessage(s.monitorTabId,{type:'snapshot'});
  if(!live?.fish?.length)throw Error('Inventário vazio ou indisponível. Atualize antes de vender.');
  if(args[1]!=='todos'){const fish=live.fish.find(x=>id(x.name)===args[1]);if(!fish||Number(args[2]||1)>fish.count)throw Error('Inventário mudou. Atualize a lista e revise a quantidade.');}
 }
 if(Date.now()-(s.lastCommand||0)<15000)throw Error('Aguarde 15 segundos entre ações.');
 if(text==='$pescar')throw Error('Use o botão Pescar com o cooldown.');
 s.lastCommand=Date.now();s.result='Enviando comando…';await save();
 const tab=await readyChat();
  if(text==='$hoje')await chrome.tabs.sendMessage(tab.id,{type:'armToday',user});
 const result=await sendNative(tab.id,text);let today=null;
 if(text==='$hoje'){if(result.attempted&&!result.retry){for(let i=0;i<24;i++){const data=await chrome.tabs.sendMessage(tab.id,{type:'todayResult'});today=data?.today;if(today)break;await new Promise(r=>setTimeout(r,500));}}await chrome.tabs.sendMessage(tab.id,{type:'cancelToday'});}
 if(today)await chrome.storage.local.set({[boatKey('companionToday')]:today});
 s.result=result.message;await save();reply({ok:true,message:result.message,today,sent:result.sent===true});
 if(result.sent&&/^\$(?:vender|comprar|isca|da|di|desequiparanzol|desequiparisca|wl|wlr|whitelist|whitelistremove|autovenda|titulo)(?: |$)/.test(text)&&s.monitorTabId!==undefined){await new Promise(r=>setTimeout(r,1500));try{await saveSnapshot(await freshSnapshot(s.monitorTabId));}catch{}}return;
}
if(m.type==='monitorHealth'||m.type==='openMonitor'){
 if(s.enabled)await ensureChat();
 if(s.enabled&&(m.type==='openMonitor'||!referenceNavigation)){if(m.type==='openMonitor')referenceNavigation=false;await ensureMonitor();}
 if(m.type==='openMonitor'&&s.enabled){const {fishState:latest}=await chrome.storage.local.get('fishState');if(latest?.monitorTabId!==undefined)await chrome.tabs.update(latest.monitorTabId,{active:true});}return;
}
if(m.type==='toggle'){
 if(monitorOperation)await monitorOperation;if(chatOperation)await chatOperation;const latest=await chrome.storage.local.get('fishState');s=latest.fishState||s;
 s.enabled=!!m.enabled;s.result=null;referenceNavigation=false;
 const {companionOwnedMonitorTab:ownedTab}=await chrome.storage.session.get('companionOwnedMonitorTab');
 const monitorTabId=s.monitorTabId===ownedTab?ownedTab:undefined;
 const {companionOwnedChatTab:chatTabId}=await chrome.storage.session.get('companionOwnedChatTab');
 if(!s.enabled){delete s.monitorTabId;s.seconds=null;s.at=0;s.monitorError=null;}
 // Persiste a pausa antes de fechar, para onRemoved não recriar a aba.
 await save();
 if(s.enabled)await ensureMonitor(true);
 else {await chrome.storage.local.set({companionOwnedReferences:{}});await chrome.storage.session.remove(['companionOwnedMonitorTab','companionOwnedChatTab']);for(const id of [monitorTabId,chatTabId])if(id!==undefined){try{await chrome.tabs.remove(id);}catch{}}}
 return;
}
if(m.type==='reading'){
if(sender.url!==INVENTORY||sender.tab.id!==s.monitorTabId||!s.enabled)return;
if(m.seconds!==null&&(!Number.isFinite(m.seconds)||m.seconds<0))return;
if(m.user&&normalizeUser(m.user)!==user)return;
if(m.wallet&&typeof m.wallet==='object'&&!m.error){const key=boatKey('companionProfile');const cached=await chrome.storage.local.get(key);if(cached[key]){const profile={...cached[key]};let changed=false;for(const currency of ['coins','pearls'])if(Number.isFinite(m.wallet[currency])&&profile[currency]!==m.wallet[currency]){profile[currency]=m.wallet[currency];changed=true;}if(changed){profile.at=Date.now();await chrome.storage.local.set({[key]:profile});const q=boatKey('query:profile:');const query=await chrome.storage.local.get(q);if(query[q])await chrome.storage.local.set({[q]:{...query[q],profile}});}}}
if(Array.isArray(m.equipment)&&m.equipment.length===4&&!m.error&&m.equipment.every(e=>typeof e.name==='string'&&e.name.trim())){const key=boatKey('companionProfile');const cached=await chrome.storage.local.get(key);if(cached[key]&&JSON.stringify(cached[key].equipment)!==JSON.stringify(m.equipment)){const profile={...cached[key],equipment:m.equipment,at:Date.now()},patches={[key]:profile};const keys=[boatKey('query:profile:'),boatKey('companionSnapshot')],data=await chrome.storage.local.get(keys);for(const cacheKey of keys)if(data[cacheKey]?.profile)patches[cacheKey]={...data[cacheKey],profile};await chrome.storage.local.set(patches);}}
if(normalizeUser(m.snapshot?.profile?.name)===user&&Array.isArray(m.snapshot?.fish)&&!m.error)await saveSnapshot(m.snapshot);
if(Array.isArray(m.fishProtection)&&!m.error)await syncProtection(m.fishProtection);
if('liveRod' in m)s.liveRod=typeof m.liveRod==='string'?m.liveRod.slice(0,160):null;
if(normalizeUser(m.profile?.name)===user){const key=boatKey('companionProfile');const cached=await chrome.storage.local.get(key);if(!cached[key])await chrome.storage.local.set({[key]:m.profile});}
if(m.catchImage&&s.catchResult){try{const u=new URL(m.catchImage);if(u.protocol==='https:'&&u.pathname.includes('/fish/'))s.catchResult.image=u.href;}catch{}}
if(m.seconds>0&&s.catchResult&&!s.catchResult.expiresAt)s.catchResult.expiresAt=Date.now()+8000;
if('event' in m)s.event=m.event&&typeof m.event.text==='string'?{text:m.event.text.slice(0,2000),seconds:Number.isFinite(m.event.seconds)&&m.event.seconds>=0?m.event.seconds:null,at:Date.now()}:null;
s.at=Date.now();s.seconds=m.seconds;s.error=m.error||null;s.monitorError=null;
if(m.seconds>0||(m.seconds===0&&Number.isFinite(m.pageStartedAt)&&m.pageStartedAt>(s.lastAttempt||0)&&Date.now()-(s.lastAttempt||0)>=15000)){s.used=false;s.result=null;}if(m.error)s.result=null;
await save();return;}
if(Date.now()-(s.lastAttempt||0)<15000)return;
if(!TEST_SEND&&(!s.enabled||Date.now()-(s.at||0)>5000||s.seconds!==0||s.used||s.error))return;
s.catchResult=null;s.used=true;s.lastAttempt=Date.now();s.result=null;await save();
try{
const tab=await readyChat();
await chrome.tabs.sendMessage(tab.id,{type:'armFish',user});
// Entrega a captura enquanto a confirmação do envio ainda está em andamento.
const response=chrome.tabs.sendMessage(tab.id,{type:'awaitFishResult'}).then(async r=>{
 const fish=r?.fish||null;if(fish){s.catchResult={...fish,at:Date.now(),expiresAt:Date.now()+8000};s.result=null;await save();}return fish;
}).catch(()=>null);
const result=await sendNative(tab.id);
if(!result.attempted||result.retry)await chrome.tabs.sendMessage(tab.id,{type:'cancelFish'});
const catchResult=await response;
await chrome.tabs.sendMessage(tab.id,{type:'cancelFish'});
if(!catchResult)s.catchResult={...(result.sent?{error:true,message:'Não foi possível confirmar o resultado da pesca. Confira o chat; nenhum reenvio foi feito.'}:{error:true,message:result.message}),at:Date.now(),expiresAt:Date.now()+8000};
s.result=null;if(!catchResult&&(result.attempted===false||result.retry===true))s.used=false;
}catch(e){s.result=e.message||'Resultado desconhecido. Confira o chat.';s.catchResult={error:true,message:s.result,at:Date.now(),expiresAt:Date.now()+8000};s.result=null;s.used=false;}
await save();
// Atualiza o inventário uma vez após a tentativa para recuperar o cooldown do site.
if(s.monitorTabId!==undefined)try{await chrome.tabs.reload(s.monitorTabId);}catch{}
};
queue=queue.then(job,job);queue.then(()=>reply({ok:true}),e=>reply({ok:false,error:e.message||'Operação interrompida.'}));return true;
}
chrome.runtime.onMessage.addListener(handleMessage);

chrome.runtime.onInstalled.addListener(async()=>{const {fishState:s}=await chrome.storage.local.get('fishState');if(s){delete s.logs;await chrome.storage.local.set({fishState:s});if(s.enabled)await ensureMonitor(true);}});

if(chrome.alarms){const maintain=()=>{const job=async()=>{const {fishState:s}=await chrome.storage.local.get('fishState');if(!s?.enabled)return;setContext({boat:s.boat||DEFAULT_BOAT,user:s.user||null});await ensureChat();if(!referenceNavigation)await ensureMonitor();};queue=queue.then(job,job);queue=queue.catch(()=>{});};chrome.alarms.onAlarm.addListener(alarm=>{if(alarm.name==='companionOwnedTabs')maintain();});chrome.alarms.create('companionOwnedTabs',{periodInMinutes:0.5});}
