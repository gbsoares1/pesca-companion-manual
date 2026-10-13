const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../panel.js'),'utf8');const render=source.slice(source.indexOf('function render(){'),source.indexOf("extensionCall(()=>chrome.storage.local.get('fishState'))"));
const nodes=new Map(),get=s=>{if(!nodes.has(s))nodes.set(s,{hidden:false,textContent:'',innerHTML:'',setAttribute:()=>{},classList:{toggle:()=>{}}});return nodes.get(s);};
const now=1000000,ctx={state:{enabled:true,user:'madtraxbr',boat:'faturetosl',seconds:270,at:now,catchResult:{caught:true,name:'aracu',at:now-30000,expiresAt:now-18000}},Date:{now:()=>now},esc:s=>String(s??'').replace(/[&<>]/g,''),sending:false,TEST_SEND:false,workspace:null,$:get,host:{classList:{contains:()=>false}}};
for(const name of ['renderTodayOverview','renderHomeOverview','renderStatusGoal','updateGoalNotice','updateExpeditions','renderEvent'])ctx[name]=()=>{};
vm.createContext(ctx);vm.runInContext(render,ctx);ctx.render();assert.equal(get('.catch-notice').hidden,false,'Captura não desaparece após 12 segundos');assert.match(get('.catch-notice').innerHTML,/aracu pescado/);
ctx.state.catchResult={caught:true,name:'aracu',featured:true,bonus:'50'};ctx.render();assert.match(get('.catch-notice').innerHTML,/Peixe em destaque!/);assert.match(get('.catch-notice').innerHTML,/50 twishcoins de bônus/);
ctx.state.catchResult={caught:false,at:now-60000};ctx.render();assert.equal(get('.catch-notice').hidden,false);assert.equal(get('.catch-notice').innerHTML,'Não foi desta vez pescador.');
ctx.state.catchResult=null;ctx.sending=true;ctx.render();assert.equal(get('.catch-notice').hidden,true,'Próxima pesca limpa resultado anterior');assert.equal(get('.fish-label').textContent,'Aguardando resposta');
console.log('Exibição real do painel: aracu e falha persistem; próxima pesca limpa resultado.');

ctx.sending=false;ctx.state.seconds=120;ctx.state.cooldownUntil=now+16000;ctx.render();assert.equal(get('.time').textContent,'0:16','Tempo mostrado usa prazo absoluto, não DOM atrasado');
ctx.state.cooldownUntil=now-1000;ctx.render();assert.equal(get('.time').textContent,'Confirmando…');assert.equal(get('.fish').disabled,true,'Estimativa vencida aguarda confirmação do site');
ctx.state.seconds=0;ctx.state.used=false;ctx.render();assert.equal(get('.time').textContent,'Disponível');assert.equal(get('.fish').disabled,false,'Zero confirmado libera botão');
