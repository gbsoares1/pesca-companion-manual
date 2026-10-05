const projectRoot=require('path').resolve(__dirname,'..')+'/';
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const slot=(name,path,tier,count)=>({title:name,classList:['inv-slot','clickable','tier-'+tier],querySelector:s=>s==='img'?{src:'https://nfjgovaqncbfsrwieynh.supabase.co/storage/v1/object/public/twish-sprites/'+path}:s==='.inv-count'?{textContent:String(count)}:null});
const slots=[slot('Vara de Carbono','rods/carbono.png','rare',1),slot('tainha','fish/tainha.png','uncommon',2)];let handlers=[];
const chrome={runtime:{id:'test',onMessage:{addListener:f=>handlers.push(f)}},storage:{local:{get:async()=>({fishState:{enabled:false}})}}};
vm.runInNewContext(fs.readFileSync(projectRoot+'reader.js','utf8'),{CompanionSiteData:{profile:()=>null,number:v=>v==null?null:Number(v)},chrome,document:{querySelector:s=>s==='.inv-sell-actions .coin-value'?{textContent:'85'}:null,querySelectorAll:s=>s==='.inv-slot.clickable[title]'?slots:[]},location:{origin:'https://twish.com.br',pathname:'/c/faturetosl/madtraxbr/inventory'},URL,performance:{timeOrigin:1234},setInterval:()=>{},Date,Number});
let result;for(const h of handlers)h({type:'snapshot'},{id:'test'},x=>result=x);
assert.equal(result.directSaleTotal,85);assert.equal(result.fish.length,1);assert.equal(result.fish[0].name,'tainha');assert.equal(result.fish[0].count,2);assert.match(result.fish[0].image,/\/fish\/tainha.png$/);console.log('Inventário: vara excluída, peixe e imagem preservados.');
