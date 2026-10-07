(()=>{const esc=text=>String(text??'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const mentioned=(text,user)=>{const name=String(user??'').trim().toLowerCase().replace(/^@/,'');return !!name&&new RegExp('@'+esc(name)+'\\b','i').test(text);};const today=(text,user)=>{text=String(text??'').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim();if(!mentioned(text,user))return null;const m=text.match(/hoje voc[eê] teve:\s*(\d+)\s*lançadas?[^|]*\|\s*(\d+)\s*peixes?[^|]*\|\s*(\d+)\s*vacilos?/i);return m?{casts:Number(m[1]),fish:Number(m[2]),misses:Number(m[3])}:null;};const fish=(text,user,complete=false)=>{
 text=String(text??'').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim();
 if(!mentioned(text,user))return null;
 if(/hoje voc[eê] teve:|evento especial:|o evento .*acabou/i.test(text))return null;
 if(/verifica[çc][aã]o|anti[ -]?(?:rob[oô]|bot)|captcha|bloquead|banid|suspens/i.test(text))return {caught:false,restricted:true,error:true,message:'Verificação ou bloqueio informado no chat. Confira a Twish.'};
 const match=text.match(/pescou\s+(?:um\s+|uma\s+)?(.+?)\s+de\s+\d+(?:[.,]\d+)?\s*(?:kg|t)\b/i);
 if(match){
  const featured=/peixe em destaque/i.test(text);
  const bonus=text.match(/\+\s*([\d.,]+)\s*twishcoins?\s+de\s+b[oô]nus/i);
  return {name:match[1].trim(),caught:true,...(featured?{featured:true}:{}),...(bonus?{bonus:bonus[1]}:{})};
 }
 // Uma captura incompleta ainda não pode ser classificada como falha.
 if(/pescou\b/i.test(text))return null;
 const name=String(user??'').trim().replace(/^@/,'');
 const end=text.search(new RegExp('@'+esc(name)+'(?![a-z0-9_])','i'))+name.length+1;
 const body=text.slice(end).replace(/^\s*\]?\s*/,'').trim();
 // Frase concluída ou corpo estável recebido do observador: qualquer resposta sem peixe é falha.
 if(/[a-zá-ú]/i.test(body)&&(complete||/[.!?](?:\s|[^a-z0-9])*$/i.test(body)||/🎣\s*$/u.test(body)))return {caught:false};
 return null;
};globalThis.CompanionReplies={today,fish};if(typeof module!=='undefined')module.exports={today,fish};})();
