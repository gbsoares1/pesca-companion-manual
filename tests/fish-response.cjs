'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),replies=require(path.join(root,'replies.js'));
assert.equal(replies.fish('@madtraxbr','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr pescou um mandi de','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr hoje você teve: 23 lançadas | 11 peixes | 12 vacilos','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr Evento especial: Desconto na Loja','madtraxbr'),null);
assert.equal(replies.fish('@outro pescou um mandi de 0.39kg','madtraxbr'),null);
for(const text of ['Mecenas dos Mares: @madtraxbr pescou um mandi de 0.39kg (+3 pontos/xp) [Comum]','@madtraxbr pescou uma lula de 0.69kg (+17 pontos/xp) [Raro] Boa pesca!'])assert.equal(replies.fish(text,'madtraxbr').caught,true);
for(const text of ['@madtraxbr so a beiça pra voce seu otário','@madtraxbr esperou, esperou, e o batman não deu aquela gozada.'])assert.equal(replies.fish(text,'madtraxbr',true).caught,false);
let handler,observer,timeout;const rows=[];
const input={innerText:'$pescar',getClientRects:()=>[{}]};const button={disabled:false,getClientRects:()=>[{}],getAttribute:()=>null,getBoundingClientRect:()=>({left:0,top:0,width:20,height:20}),click:()=>{},contains:()=>false};
class Observer{constructor(fn){this.fn=fn;observer=this;}observe(target,options){this.options=options;}disconnect(){this.closed=true;}}
vm.runInNewContext(fs.readFileSync(path.join(root,'twitch.js'),'utf8'),{chrome:{runtime:{id:'test',onMessage:{addListener:f=>handler=f}}},location:{pathname:'/popout/faturetosl/chat'},document:{body:{},querySelectorAll:s=>s.includes('chat-input')?[input]:s.includes('chat-send-button')?[button]:rows,querySelector:()=>null,elementFromPoint:()=>button},navigator:{onLine:true},MutationObserver:Observer,WeakSet,Date,CompanionReplies:replies,setTimeout:fn=>{timeout=fn;return 1;},clearTimeout:()=>{}});
const send=(m,reply=()=>{})=>handler(m,{id:'test'},reply);
const row=(author,text)=>({getAttribute:()=>author,querySelector:()=>null,textContent:text});
rows.push(row('TwishGameBot','@madtraxbr pescou um peixe antigo de 1kg'));
send({type:'armFish',user:'madtraxbr'});let result;send({type:'awaitFishResult'},r=>result=r);
rows.push(row('TwishGameBot','@madtraxbr so a beiça pra voce seu otário'));observer.fn();assert.equal(result,undefined,'Resposta atrasada anterior ao comando não encerra a pesca');
rows.push(row('madtraxbr','$pescar'));observer.fn();assert.equal(result,undefined);
const partial=row('TwishGameBot','@madtraxbr');rows.push(partial);observer.fn();assert.equal(result,undefined,'Menção parcial não é falha');
partial.textContent='@madtraxbr pescou um mandi de';observer.fn();assert.equal(result,undefined,'Captura parcial aguarda o restante');
rows.push(row('TwishGameBot','@madtraxbr hoje você teve: 23 lançadas | 11 peixes | 12 vacilos'));observer.fn();assert.equal(result,undefined);
partial.textContent='Mecenas dos Mares: @madtraxbr pescou um mandi de 0.39kg (+3 pontos/xp) [Comum]';observer.fn();assert.equal(result.fish.caught,true);assert.equal(result.fish.name,'mandi');
send({type:'armFish',user:'madtraxbr'});let missing;send({type:'awaitFishResult'},r=>missing=r);timeout();assert.equal(missing.fish,null,'Sem resposta não inventa um resultado negativo');
console.log('Pesca: mandi e lula reconhecidos na mutação; texto parcial, resumo, outra conta e resposta anterior ignorados; timeout sem resultado inventado.');

// Resumo em linha sem o seletor antigo do corpo, com conteúdo em partes.
assert.equal(replies.today('@madtraxbr hoje você teve: 14 lançadas 🎣 | 11 peixes 🐟 | 3 vacilos ❌','madtraxbr').casts,14);
send({type:'armToday',user:'madtraxbr'});let today;send({type:'awaitTodayResult'},r=>today=r);
const todayRow=row('TwishGameBot:','@madtraxbr hoje você teve: 14 lançadas');rows.push(todayRow);observer.fn();assert.equal(today,undefined);
todayRow.textContent='@madtraxbr hoje você teve: 14 lançadas 🎣 | 11 peixes 🐟 | 3 vacilos ❌';observer.fn();assert.equal(today.today.casts,14);assert.equal(today.today.fish,11);assert.equal(today.today.misses,3);
send({type:'armToday',user:'madtraxbr'});let noToday;send({type:'awaitTodayResult'},r=>noToday=r);timeout();assert.equal(noToday.today,null);
// O comando também pode ser renderizado em partes.
send({type:'armFish',user:'madtraxbr'});let caught;send({type:'awaitFishResult'},r=>caught=r);const command=row('madtraxbr','');rows.push(command);observer.fn();command.textContent='$pescar';observer.fn();rows.push(row('TwishGameBot','@madtraxbr pescou um xaréu de 1.2kg'));observer.fn();assert.equal(caught.fish.caught,true);
console.log('Hoje: corpo alternativo, texto parcial, totais novos e timeout; pesca com comando renderizado em partes.');

send({type:'armFish',user:'madtraxbr'});assert.equal(observer.options.attributes,true);assert.ok(observer.options.attributeFilter.includes('data-a-user'));let delayed;send({type:'awaitFishResult'},r=>delayed=r);let author='';const delayedCommand={getAttribute:()=>author,querySelector:()=>null,textContent:'$pescar'};rows.push(delayedCommand);observer.fn();assert.equal(delayed,undefined);author='madtraxbr';observer.fn();let botAuthor='';const delayedBot={getAttribute:()=>botAuthor,querySelector:()=>null,textContent:'🐟 [🌟 Mecenas dos Mares: @madtraxbr] pescou um acará de 0.35kg (+2 pontos/xp) [Comum]'};rows.push(delayedBot);observer.fn();assert.equal(delayed,undefined);botAuthor='twishgamebot';observer.fn();assert.equal(delayed.fish.name,'acará');assert.equal(delayed.fish.caught,true);
console.log('Chat: autor atribuído depois do texto, comando e captura real de acará reconhecidos.');

// A Twitch pode não exibir o eco do comando; o clique oficial inicia a correlação.
send({type:'armFish',user:'madtraxbr'});let noEcho;send({type:'awaitFishResult'},r=>noEcho=r);send({type:'submitNative',command:'$pescar'});rows.push(row('twishgamebot','🐟 [🌟 Mecenas dos Mares: @madtraxbr] pescou um acará de 0.10kg (+2 pontos/xp) [Comum] (usando Isca Turbinada)'));observer.fn();assert.equal(noEcho.fish.name,'acará');assert.equal(noEcho.fish.caught,true);console.log('Captura reconhecida após clique oficial sem eco do comando.');

// Texto exato da falha reportada: menção destacada e frase de fisgada.
const failedText='@madtraxbr sentiu um penis enorme, mas engoliu antes da fisgada! 🎣';
assert.equal(replies.fish(failedText,'madtraxbr').caught,false);
send({type:'armFish',user:'madtraxbr'});let failedResult;send({type:'awaitFishResult'},r=>failedResult=r);send({type:'submitNative',command:'$pescar'});
const failure=row('twishgamebot','');let failureBody='@madtraxbr';failure.querySelector=selector=>selector.includes('body')?{textContent:failureBody}:null;rows.push(failure);observer.fn();assert.equal(failedResult,undefined,'Menção isolada não encerra a espera');failureBody=failedText;observer.fn();assert.equal(failedResult.fish.caught,false,'Texto completo encerra imediatamente, sem aguardar timer de aba inativa');assert.equal(observer.closed,true);
console.log('Falha exata da fisgada: corpo em partes, menção destacada e conclusão imediata sem timer.');

const unknownFailure='@madtraxbr fisgou só um centaralho e uma alga.';
assert.equal(replies.fish(unknownFailure,'madtraxbr').caught,false);
assert.equal(replies.fish('@madtraxbr frase inteiramente nova do servidor','madtraxbr',true).caught,false);
send({type:'armFish',user:'madtraxbr'});let genericFailure;send({type:'awaitFishResult'},r=>genericFailure=r);send({type:'submitNative',command:'$pescar'});rows.push(row('twishgamebot',unknownFailure));observer.fn();assert.equal(genericFailure.fish.caught,false);
console.log('Falhas genéricas: frase exata da alga e frase inédita sem catálogo.');

// Sem disparar o MutationObserver: a consulta direta deve ler a mensagem real.
send({type:'armToday',user:'madtraxbr'});rows.push(row('twishgamebot','[🌟 Mecenas dos Mares: @madtraxbr] hoje você teve: 42 lançadas 🎣 | 28 peixes 🐟 | 14 vacilos ❌'));let directDay;send({type:'todayResult'},r=>directDay=r);assert.equal(directDay.today.casts,42);assert.equal(directDay.today.fish,28);assert.equal(directDay.today.misses,14);
send({type:'armFish',user:'madtraxbr'});send({type:'submitNative',command:'$pescar'});rows.push(row('twishgamebot','@madtraxbr pescou um surubim de 37.51kg (+42 pontos/xp) [Lendário]'));let directFish;send({type:'fishResult'},r=>directFish=r);assert.equal(directFish.fish.name,'surubim');
console.log('Leitura direta: Hoje 42/28/14 e surubim reconhecidos sem callback do observador.');

const featured='🐠 [🌟 Mecenas dos Mares: @madtraxbr] pescou um aracu de 0.35kg (+8 pontos/xp) [Incomum] 🎯 Peixe em destaque! +50 twishcoins de bônus';
assert.equal(replies.fish(featured,'madtraxbr').name,'aracu');assert.equal(replies.fish(featured,'madtraxbr').caught,true);assert.equal(replies.fish(featured,'outro'),null);
send({type:'armFish',user:'madtraxbr'});send({type:'submitNative',command:'$pescar'});rows.push(row('twishgamebot',featured));let featuredResult;send({type:'fishResult'},r=>featuredResult=r);assert.equal(featuredResult.fish.name,'aracu');
console.log('Aracu em destaque: bônus preserva reconhecimento de sucesso da conta correta.');

assert.equal(replies.fish(featured,'madtraxbr').featured,true);assert.equal(replies.fish(featured,'madtraxbr').bonus,'50');assert.equal(replies.fish('@madtraxbr pescou um piau de 1kg','madtraxbr').featured,undefined);
