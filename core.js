/* Leitura conservadora: nunca transforma texto desconhecido em zero. */
(function(root) {
  function seconds(text) {
    const s = text.trim().toLowerCase();
    if (/^\d{1,3}:\d{2}(?::\d{2})?$/.test(s)) {
      const a = s.split(':').map(Number);
      if (a.at(-1) > 59 || (a.length === 3 && a[1] > 59)) return null;
      return a.length === 3 ? a[0]*3600+a[1]*60+a[2] : a[0]*60+a[1];
    }
    if (/^\d+\s*(s|seg|segundos?)$/.test(s)) return parseInt(s,10);
    const m = s.match(/^(\d+)\s*(?:m|min|minutos?)\s*(?:(\d+)\s*(?:s|seg|segundos?))?$/);
    if (m && (!m[2] || Number(m[2]) < 60)) return Number(m[1])*60+Number(m[2]||0);
    if (['0','pronto','disponível','pode pescar','pesca disponível','pesca disponível!'].includes(s)) return 0;
    return null;
  }
  // O DOM pode ficar parado ou diminuir lentamente em uma aba em segundo plano.
  function cooldownClock() {
    let previous=null,until=null;
    return (value,now=Date.now())=>{
      if(!Number.isFinite(value)){previous=null;until=null;return null;}
      if(value===0)until=now;
      else if(previous===null||value>previous+2)until=now+value*1000;
      else until=Math.min(until,now+value*1000);
      previous=value;
      return until;
    };
  }
  root.TwishReminderCore = {seconds,cooldownClock};
})(globalThis);
