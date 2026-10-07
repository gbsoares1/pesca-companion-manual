'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),replies=require(path.join(root,'replies.js'));
assert.equal(replies.fish('@madtraxbr','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr pescou um mandi de','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr hoje você teve: 23 lançadas | 11 peixes | 12 vacilos','madtraxbr'),null);
assert.equal(replies.fish('@madtraxbr Evento especial: Desconto na Loja','madtraxbr'),null);
assert.equal(replies.fish('@outro pescou um mandi de 0.39kg','madtraxbr'),null);
for(const text of ['Mecenas dos Mares: @madtraxbr pescou um mandi de 0.39kg (+3 pontos/xp) [Comum]','@madtraxbr pescou uma lula de 0.69kg (+17 pontos/xp) [Raro] Boa pesca!'])assert.equal(replies.fish(text,'madtraxbr').caught,true);
for(const text of ['@madtraxbr so a beiça pra voce seu otário','@madtraxbr esperou, esperou, e o batman não deu aquela gozada.'])assert.equal(replies.fish(text,'madtraxbr').caught,false);
let handler,observer,timeout;const rows=[];
class Observer{constructor(fn){this.fn=fn;observer=this;}observe(target,options){this.options=options;}disconnect(){this.closed=true;}}
vm.runInNewContext(fs.readFileSync(path.join(root,'twitch.js'),'utf8'),{chrome:{runtime:{id:'test',onMessage:{addListener:f=>handler=f}}},location:{pathname:'/popout/faturetosl/chat'},document:{body:{},querySelectorAll:()=>rows},MutationObserver:Observer,WeakSet,Date,CompanionReplies:replies,setTimeout:fn=>{timeout=fn;return 1;},clearTimeout:()=>{}});
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
