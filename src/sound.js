// Small, locally synthesized sounds. The AudioContext is created only after a tap.
let audio;

export function unlockSound(){
  try{
    if(!audio){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(!AudioContext)return null;
      audio=new AudioContext();
    }
    if(audio.state==='suspended')audio.resume().catch(()=>{});
    return audio;
  }catch{return null}
}

function tone(ctx,at,start,end,duration,volume,type='sine'){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=type;
  osc.frequency.setValueAtTime(start,at);
  osc.frequency.exponentialRampToValueAtTime(end,at+duration);
  gain.gain.setValueAtTime(volume,at);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(at);osc.stop(at+duration);
}

function tick(ctx,at,volume,cutoff){
  const length=Math.ceil(ctx.sampleRate*.055);
  const buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(1-i/length);
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=buffer;filter.type='highpass';filter.frequency.value=cutoff;
  gain.gain.setValueAtTime(volume,at);
  gain.gain.exponentialRampToValueAtTime(.0001,at+.055);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(at);source.stop(at+.055);
}

export function playIngredient(emotion){
  const ctx=unlockSound();if(!ctx)return;
  try{
    const at=ctx.currentTime+.01;
    if(emotion==='tired'){
      // Two light ice-on-glass clicks, with a short, clear glass resonance.
      tick(ctx,at,.045,1400);tone(ctx,at,1250,920,.17,.023);
      tick(ctx,at+.09,.026,1700);tone(ctx,at+.09,1540,1100,.13,.014);
    }else if(emotion==='calm'){
      tone(ctx,at,410,245,.22,.018);tick(ctx,at+.05,.012,850);
    }else{
      tick(ctx,at,.022,1100);tone(ctx,at,720,490,.15,.014);
    }
  }catch{}
}

export function playBell(){
  const ctx=unlockSound();if(!ctx)return;
  try{
    const at=ctx.currentTime+.01;
    tone(ctx,at,880,878,.46,.032);
    tone(ctx,at,1320,1316,.35,.014);
  }catch{}
}
