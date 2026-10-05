/* Apenas campos visíveis; ausência não é zero. */
(()=>{'use strict';
const account=(doc=document)=>doc.querySelector('.shell-user-trigger')?.getAttribute('title')?.trim().toLowerCase()||doc.querySelector('.player-card-name')?.textContent?.trim().toLowerCase()||null;
const number=value=>{const text=String(value??'').trim();const match=text.match(/^(\d+(?:[.,]\d{3})*)\s*(?:twishcoins|pérolas)?$/i);if(!match)return null;const n=Number(match[1].replace(/[.,]/g,''));return Number.isSafeInteger(n)?n:null;};
function event(doc=document){
 const banner=doc.querySelector('.event-banner');if(!banner)return null;
 const raw=banner.textContent.trim();const timer=raw.match(/(\d{1,3}:\d{2}(?::\d{2})?)\s*$/);
 const parts=timer?.[1].split(':').map(Number);const seconds=parts&&parts.slice(1).every(n=>n<60)?parts.reduce((n,v)=>n*60+v,0):null;
 const text=(banner.querySelector('.event-banner-text')?.textContent||raw.replace(/\d{1,3}:\d{2}(?::\d{2})?\s*$/,'')).trim();
 return {text,seconds,at:Date.now()};
}
function profile(doc=document){
 const name=doc.querySelector('.player-card-name')?.textContent?.trim().toLowerCase();if(!name)return null;
 const chips=[...doc.querySelectorAll('.player-card-header .coin-value')].map(e=>e.textContent.trim());
 const xp=[...doc.querySelectorAll('.xp-bar-label span')].map(e=>e.textContent).join(' ');const level=xp.match(/nível\s*(\d+)/i);const exp=xp.match(/(\d+)\s*\/\s*(\d+)\s*xp/i);
 const stats=[...doc.querySelectorAll('.player-stat-grid .stat-card')].map(e=>({label:e.querySelector('.label')?.textContent?.trim(),value:e.querySelector('.value')?.textContent?.trim()}));
 return {name,coins:number(chips.find(x=>/twishcoins/i.test(x))),pearls:number(chips.find(x=>/pérolas/i.test(x))),level:level?Number(level[1]):null,xp:exp?Number(exp[1]):null,xpTarget:exp?Number(exp[2]):null,points:number(stats.find(x=>x.label==='pontos')?.value),best:stats.find(x=>x.label==='melhor captura')?.value||null,equipment:[...doc.querySelectorAll('.inv-equip-slot')].map(e=>({name:e.querySelector('.inv-equip-name')?.textContent?.trim()||null,image:e.querySelector('img')?.src||null,icon:e.querySelector('img')?null:e.querySelector('.inv-slot')?.textContent?.trim()||null})),ranks:[...doc.querySelectorAll('.rank-summary-item')].map(e=>({label:e.querySelector('.rank-summary-label')?.textContent,value:e.querySelector('.rank-summary-value')?.textContent})),event:doc.querySelector('.event-banner')?.textContent?.trim()||null,at:Date.now()};
}
const api={account,number,profile,event};globalThis.CompanionSiteData=api;
if(typeof module!=='undefined')module.exports=api;
})();
