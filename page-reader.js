(()=>{'use strict';if(globalThis.companionPageReader)return;globalThis.companionPageReader=true;
const getRoutes=()=>{const channel=location.pathname.match(/^\/c\/([a-z0-9_]+)\//i)?.[1];const routes={shop:'/c/'+channel+'/shop',ranking:'/c/'+channel+'/ranking',tournament:'/c/'+channel+'/tournament',expedicoes:'/c/'+channel+'/expedicoes'};return routes;};
chrome.runtime.onMessage.addListener((m,sender,reply)=>{
 if(sender.id!==chrome.runtime.id||m.type!=='readPage'||location.origin!=='https://twish.com.br'||location.pathname!==getRoutes()[m.page])return;
 (async()=>{
 if(document.querySelector('iframe[src*="captcha"]')||/verificação rápida/i.test(document.body.innerText))throw Error('Resolva a verificação manualmente.');
 const account=CompanionSiteData.account();
 if(!account)throw Error('Entre na Twish para consultar esta página.');
 if(m.page==='expedicoes'){reply(CompanionExpeditions.read());return;}
 if(m.page==='ranking'&&m.category){const allowed=['Melhor captura','Peixes ascendidos','Pontos','Nível','Mais rico','Duelos vencidos','Torneios vencidos'];if(!allowed.includes(m.category))throw Error('Categoria inválida.');const b=[...document.querySelectorAll('.tab-btn')].find(e=>e.textContent.trim().toLowerCase()===m.category.toLowerCase());if(!b)throw Error('Filtro de ranking indisponível.');if(!b.classList.contains('active')){b.click();await new Promise(r=>setTimeout(r,1000));}}
 if(m.page==='shop'){
 const items=[],seen=new Set();const tabs=[...document.querySelectorAll('.shop-menu-wing[role="tab"]')];
 for(const tab of tabs.length?tabs:[null]){if(tab&&tab.getAttribute('aria-selected')!=='true'){tab.click();await new Promise(r=>setTimeout(r,600));}
 for(const e of document.querySelectorAll('.shop-item, .shop-hanger')){
 const name=e.querySelector('.shop-plate')?.textContent?.trim();
 const image=e.querySelector('.shop-frame-art')?.src;
 for(const tag of e.querySelectorAll('.shop-tag:not(.is-info)')){
 const icon=tag.querySelector('img')?.getAttribute('src')||'';
 const currency=/escama/i.test(icon)?'scales':/perola|pearl/i.test(icon)?'pearls':/coin/i.test(icon)?'coins':null;
 const old=tag.querySelector('del,s');
 // The sale percentage is a separate badge, never part of the numeric price.
 const amount=tag.querySelector('span');
 const price=CompanionSiteData.number(amount?.textContent??tag.textContent);
 const normalPrice=CompanionSiteData.number(old?.textContent)??price;
 const key=name+'|'+currency;
 if(!name||!currency||price===null||seen.has(key))continue;
 seen.add(key);items.push({name,image,price,normalPrice,currency,status:e.querySelector('.shop-price')?.textContent,requirement:e.querySelector('.shop-lock')?.getAttribute('data-tip')||null});
 }
 }}
 if(!items.length)throw Error('A loja ainda não carregou.');const balances={};for(const e of document.querySelectorAll('.shop-balance-coin')){const icon=e.querySelector('img')?.getAttribute('src')||'';const key=/escama/i.test(icon)?'scales':/perola/i.test(icon)?'pearls':/coin/i.test(icon)?'coins':null;if(key)balances[key]=CompanionSiteData.number(e.querySelector('b')?.textContent);}reply({account,items,balances,catalogVersion:2,at:Date.now()});return;}
 if(m.page==='ranking'){const rows=[...document.querySelectorAll('.rank-row')].slice(0,10).map(e=>({position:e.querySelector('.rank-position')?.textContent,name:e.querySelector('.rank-username')?.textContent,value:e.querySelector('.rank-value-col')?.textContent?.trim()}));if(!rows.length)throw Error('Ranking ainda indisponível.');reply({account,rows,category:m.category||'Melhor captura',at:Date.now()});return;}
 const panel=document.querySelector('.tournament-panel');if(!panel||/soando o sino/i.test(panel.innerText))throw Error('Torneio ainda não carregou.');reply({account,text:panel.innerText.slice(0,6000),at:Date.now()});
 })().catch(e=>reply({error:e.message}));return true;
});})();
