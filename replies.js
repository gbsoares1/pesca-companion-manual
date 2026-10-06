(()=>{const esc=text=>String(text??'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const mentioned=(text,user)=>{const name=String(user??'').trim().toLowerCase().replace(/^@/,'');return !!name&&new RegExp('@'+esc(name)+'\\b','i').test(text);};const today=(text,user)=>{if(!mentioned(text,user))return null;const m=text.match(/hoje você teve:\s*(\d+)\s*lançadas?[^|]*\|\s*(\d+)\s*peixes?[^|]*\|\s*(\d+)\s*vacilos?/i);return m?{casts:Number(m[1]),fish:Number(m[2]),misses:Number(m[3])}:null;};const fish=(text,user)=>{
 text=String(text??'').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').trim();
 if(!mentioned(text,user))return null;
 if(/hoje voc[eê] teve:|evento especial:|o evento .*acabou/i.test(text))return null;
 if(/verifica[çc][aã]o|anti[ -]?(?:rob[oô]|bot)|captcha|bloquead|banid|suspens/i.test(text))return {caught:false,restricted:true,error:true,message:'Verificação ou bloqueio informado no chat. Confira a Twish.'};
 const match=text.match(/pescou\s+(?:um\s+|uma\s+)?(.+?)\s+de\s+\d+(?:[.,]\d+)?\s*(?:kg|t)\b/i);
 if(match)return {name:match[1].trim(),caught:true};
 // Mention-only and partially rendered messages are not a fishing outcome.
 if(/s[oó] a bei[çc]a|ot[aá]rio|sentiu.*pux|escap|esperou.*esperou|vacil|espere.*(?:minuto|segundo)|mochila.*cheia|invent[aá]rio.*cheio|n[aã]o.*(?:fisg|captur|pegou|peixe)/i.test(text))return {caught:false};
 return null;
};globalThis.CompanionReplies={today,fish};if(typeof module!=='undefined')module.exports={today,fish};})();
