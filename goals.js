(()=>{'use strict';
function discount(event){return !!event&&/desconto na loja/i.test(event.text||'')&&/20\s*%/.test(event.text||'')&&event.seconds!==0;}
function price(goal,event){const base=Number(goal?.baseTarget??goal?.target);if(!Number.isFinite(base)||base<=0)return null;return discount(event)&&(goal.currency||'coins')==='coins'?Math.round(base*0.8):base;}
function reached(goal,balance,event){const target=price(goal,event);return target!==null&&Number.isFinite(balance)&&balance>=target;}
// Referência do Manual Twish: revenda de varas a 30%, arredondada para baixo.
// Estimativa após a compra: a vara anterior pode ser requisito da próxima.
function rodTrade(goal,rod,event){const prices={'Vara de Bambu':0,'Vara de Madeira Reforçada':300,'Vara de Fibra de Vidro':800,'Vara de Aço':1600,'Vara de Carbono':3000,'Vara Encantada':6000,'Vara Abissal':7000,'Vara Lendária':16000,'Vara Njord':32000};if((goal?.currency||'coins')!=='coins'||!Object.hasOwn(prices,goal?.name)||!Object.hasOwn(prices,rod)||prices[rod]<=0||prices[goal.name]<=prices[rod])return null;const target=price(goal,event);if(target===null)return null;const resale=Math.floor(prices[rod]*0.3);return {rod,resale,netCost:Math.max(0,target-resale)};}
const api={discount,price,reached,rodTrade};globalThis.CompanionGoals=api;if(typeof module!=='undefined')module.exports=api;
})();
