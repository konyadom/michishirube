import {jstDay} from './anniversaries.js';
export const WEATHER_URL='https://api.open-meteo.com/v1/forecast?latitude=35.07&longitude=135.78&current=temperature_2m,apparent_temperature,is_day,precipitation,weather_code&timezone=Asia%2FTokyo&forecast_days=1';
export const WEATHER_TTL=15*60*1000;
export function japanClock(now=Date.now()){
 const d=new Date(now+9*3600000),hour=d.getUTCHours(),minute=d.getUTCMinutes();
 return {day:jstDay(now),hour,time:String(hour).padStart(2,'0')+':'+String(minute).padStart(2,'0'),date:(d.getUTCMonth()+1)+'月'+d.getUTCDate()+'日（'+'日月火水木金土'[d.getUTCDay()]+'）'};
}
export function mealPrompt(entries=[],now=Date.now()){
 const clock=japanClock(now),meal=clock.hour>=5&&clock.hour<11?'breakfast':clock.hour>=11&&clock.hour<16?'lunch':clock.hour>=16?'dinner':'snack';
 const label={breakfast:'朝ごはん',lunch:'昼ごはん',dinner:'晩ごはん',snack:'夜の食事'}[meal];
 const rows=entries.filter(e=>e.day===clock.day&&e.status==='ate'&&e.meal===meal);
 return {...clock,meal,key:clock.day+'-'+meal,recorded:rows.length>0,title:rows.length?label+'は記録済み':meal==='snack'?'夜に食べたものはある？':label+'は何を食べた？',body:rows.length?rows.map(e=>e.name).join('・'):'いつものものなら下から選べます。'};
}
export function weatherLabel(code,isDay=true){
 if(code===0)return {symbol:isDay?'☀️':'🌙',label:'快晴'};
 if([1,2].includes(code))return {symbol:isDay?'🌤️':'🌙',label:'晴れ時々くもり'};
 if(code===3)return {symbol:'☁️',label:'くもり'};
 if([45,48].includes(code))return {symbol:'🌫️',label:'霧'};
 if([51,53,55,56,57].includes(code))return {symbol:'🌧️',label:'霧雨'};
 if([61,63,65,66,67,80,81,82].includes(code))return {symbol:'🌧️',label:'雨'};
 if([71,73,75,77,85,86].includes(code))return {symbol:'🌨️',label:'雪'};
 if([95,96,99].includes(code))return {symbol:'⛈️',label:'雷雨'};
 return {symbol:'',label:'天気不明'};
}
export function parseWeather(payload,now=Date.now()){
 const c=payload?.current,stamp=typeof c?.time==='string'?Date.parse(c.time+'+09:00'):NaN;
 if(!c||!Number.isFinite(c.temperature_2m)||c.temperature_2m< -60||c.temperature_2m>60||!Number.isFinite(c.weather_code)||!Number.isFinite(stamp)||Math.abs(now-stamp)>2*3600000)throw Error('現在の天気を確認できません');
 return {temperature:c.temperature_2m,feels:Number.isFinite(c.apparent_temperature)?c.apparent_temperature:null,code:c.weather_code,isDay:c.is_day===1,forecastAt:stamp,fetchedAt:now};
}
export function weatherHint(weather,now=Date.now()){
 if(!weather||now-weather.fetchedAt>WEATHER_TTL)return '';
 if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(weather.code))return '岩倉は雨の予報。出かけるなら傘を。';
 if(weather.temperature>=28)return '暑い時間帯。水分も忘れずに。';
 if(weather.temperature<=12)return '外は冷えています。温かい飲みものもどうぞ。';
 return '';
}
export function installDayContext({getNutrition,esc}){
 let weather=null,busy=false,lastAttempt=0,dismissed='';
 try{dismissed=sessionStorage.getItem('michishirube-meal-later')||'';}catch{}
 function weatherMarkup(){const w=weather&&Date.now()-weather.fetchedAt<=WEATHER_TTL?weather:null;const summary=w?weatherLabel(w.code,w.isDay):null;
  return '<div class="today-weather"><span class="weather-symbol" aria-hidden="true">'+(summary?.symbol||'◌')+'</span><div><strong>'+(w?esc(w.temperature)+'° <small>'+summary.label+'</small>':busy?'天気を確認中…':'天気を取得できません')+'</strong><small>岩倉'+(w?' · '+japanClock(w.forecastAt).time+'の予報値':'')+'</small></div><button data-weather-refresh aria-label="天気を更新" '+(busy?'disabled':'')+'>↻</button></div>';
 }
 function markup(){const p=mealPrompt(getNutrition().entries),skip=dismissed===p.key,hint=weatherHint(weather);return '<section class="today-card" aria-label="時刻と天気と食事"><div class="today-top"><div class="today-clock"><time>'+p.time+'</time><span>'+p.date+' · 日本時間</span></div>'+weatherMarkup()+'</div><div class="today-food">'+(skip?'<button class="text-btn" data-meal-open="'+p.meal+'">食べたものを記録する →</button>':'<div class="today-question"><strong>'+esc(p.title)+'</strong><button data-meal-later aria-label="食事の声かけをあとでにする">あとで</button></div><p class="today-food-note">'+esc(p.body)+'</p><div class="usual-foods"><button data-meal-food="mcd-double-thick-beef">🍔 ダブル肉厚ビーフ</button><button data-meal-food="croquant-banana">🥐 クロッカン</button><button data-meal-open="'+p.meal+'">ほかのもの</button></div>')+(hint?'<p class="weather-hint">'+esc(hint)+'</p>':'')+'</div><small class="weather-credit">天気：<a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> · 岩倉の地域予報</small></section>';}
 function paint(){const header=document.querySelector('[data-header-clock]'),c=japanClock();if(header){header.textContent=c.time;header.title=c.date+' 日本時間';}const host=document.querySelector('[data-day-context]');if(host)host.innerHTML=markup();const dock=document.querySelector('#mobile-sidebar');if(dock){const p=mealPrompt(getNutrition().entries),w=weather&&Date.now()-weather.fetchedAt<=WEATHER_TTL?weather:null;dock.querySelector('strong').textContent=dismissed===p.key?'睦荘のホーム':p.title;dock.querySelector('small').textContent=w?'岩倉 '+w.temperature+'° · '+weatherLabel(w.code,w.isDay).label+' · ホームへ':'食事と今日の天気 · ホームへ';}}
 async function refresh(force=false){if(busy||!force&&Date.now()-lastAttempt<WEATHER_TTL)return;lastAttempt=Date.now();busy=true;paint();const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);try{const response=await fetch(WEATHER_URL,{signal:controller.signal,credentials:'omit'});if(!response.ok)throw Error();weather=parseWeather(await response.json());}catch{}finally{busy=false;clearTimeout(timer);paint();}}
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-weather-refresh'))refresh(true);if(b.hasAttribute('data-meal-later')){dismissed=mealPrompt(getNutrition().entries).key;try{sessionStorage.setItem('michishirube-meal-later',dismissed);}catch{}paint();}});
 setInterval(()=>{if(document.hidden)return;paint();if(Date.now()-lastAttempt>=WEATHER_TTL)refresh();},30000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){paint();refresh();}});
 paint();refresh();return {markup,paint};
}
