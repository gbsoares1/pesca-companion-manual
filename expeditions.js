/* Marés e acesso vêm dos controles visíveis do cais; notas são critérios do usuário. */
(()=>{'use strict';
const day=at=>new Date(at).toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});
function read(doc=document){
 const account=CompanionSiteData.account(doc);
 if(!account)throw Error('Entre na Twish para consultar o cais.');
 const cards=[...doc.querySelectorAll('button.xp-portal[data-sea]')].filter(e=>!e.getClientRects||e.getClientRects().length);
 if(!cards.length)throw Error('O cais ainda não carregou ou as expedições estão indisponíveis neste barco.');
 const seas=cards.map(e=>({id:e.getAttribute('data-sea'),name:e.querySelector('.xp-portal-name')?.textContent?.trim(),accessible:!e.classList.contains('is-locked')&&!e.disabled&&e.getAttribute('aria-disabled')!=='true',requiredRod:e.querySelector('.xp-portal-lock')?.textContent?.trim()||null,tide:e.querySelector('.xp-tide-badge-name')?.textContent?.trim()||null,effect:e.querySelector('.xp-tide-badge')?.getAttribute('title')||null,peril:e.querySelector('.xp-peril')?.textContent?.trim()||null}));
 return {account,seas,at:Date.now(),day:day(Date.now())};
}
function advice(sea){const tide=sea.tide;const dangerous=['sereias','abismo'].includes(sea.id);
 if(tide==='Cardume')return{stars:5,title:'Ótimo para expedição',text:'Mais exclusivas: ótimo para Mercado, Encomendas e Bestiário.'};
 if(tide==='Maré Cheia')return{stars:4,title:'Bom para expedição',text:'Mais fisgadas: bom para XP, pontos e volume de peixes.'};
 if(tide==='Calmaria')return{stars:dangerous?4:3,title:dangerous?'Boa oportunidade com menos perigo':'Mar tranquilo',text:dangerous?'Menos perigo neste mar. Boa opção para Sereias e Abismo.':'Menos perigo; neste mar calmo, o benefício é menor.'};
 if(tide==='Nevoeiro')return{stars:4,title:'Boa oportunidade, com risco',text:dangerous?'Mais exclusivas, mas mais perigo. Com seguro de viagem pode ser excelente; confira o seguro antes de embarcar.':'Mais exclusivas, com o risco indicado no cais. Confira as condições antes de embarcar.'};
 if(tide==='Águas Turvas')return{stars:2,title:'Melhor aguardar para buscar exclusivas',text:'Menos exclusivas. Se puder esperar, prefira uma maré melhor antes de gastar ticket.'};
 if(tide==='Maré Baixa')return{stars:1,title:'Dia pouco favorável para farm',text:'Menos fisgadas. Para volume de peixes, vale aguardar uma maré melhor.'};
 return null;
}
const api={read,advice,day};globalThis.CompanionExpeditions=api;if(typeof module!=='undefined')module.exports=api;
})();
