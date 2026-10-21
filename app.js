(function(){
'use strict';

var state = {
  currentView: 'login',
  role: null,
  health: 'relax',
  diff: 'easy',
  gameMode: 'tap',
  gameRunning: false,
  gameScore: 0,
  gameCombo: 0,
  gameTimer: null,
  gameSequence: [],
  gameStep: 0,
  playing: false,
  playTimer: null,
  progressInterval: null,
  audioCtx: null,
  largeFont: true
};

var musicData = {
  relax: {
    easy: [
      {title:'茉莉花 · 舒缓版',artist:'演示乐团',dur:'3:20',tag:'舒缓',emoji:'🌸'},
      {title:'月亮代表我的心',artist:'经典演绎',dur:'4:05',tag:'轻柔',emoji:'🌙'},
      {title:'小星星 · 律动版',artist:'康养乐队',dur:'2:50',tag:'轻快',emoji:'⭐'}
    ],
    medium: [
      {title:'甜蜜蜜 · 慢板',artist:'演示乐团',dur:'3:45',tag:'舒缓',emoji:'🎵'},
      {title:'送别 · 轻音乐',artist:'康养乐队',dur:'3:30',tag:'怀旧',emoji:'🎶'}
    ],
    hard: [
      {title:'春江花月夜 · 完整版',artist:'古典乐团',dur:'6:10',tag:'古典',emoji:'🏮'},
      {title:'高山流水 · 律动版',artist:'演示乐团',dur:'5:30',tag:'古典',emoji:'🎻'}
    ]
  },
  energy: {
    easy: [
      {title:'阳光彩虹小白马',artist:'活力乐团',dur:'3:00',tag:'活力',emoji:'☀️'},
      {title:'小苹果 · 律动版',artist:'演示乐团',dur:'3:15',tag:'欢快',emoji:'🍎'},
      {title:'最炫民族风',artist:'康养乐队',dur:'3:30',tag:'动感',emoji:'💃'}
    ],
    medium: [
      {title:'青春舞曲',artist:'活力乐团',dur:'2:50',tag:'欢快',emoji:'🎉'},
      {title:'欢乐颂 · 节拍版',artist:'演示乐团',dur:'3:10',tag:'经典',emoji:'🎊'}
    ],
    hard: [
      {title:'黄河大合唱 · 节选',artist:'交响乐团',dur:'4:40',tag:'激昂',emoji:'🌊'},
      {title:'春节序曲 · 律动版',artist:'演示乐团',dur:'4:20',tag:'喜庆',emoji:'🧨'}
    ]
  },
  sleep: {
    easy: [
      {title:'摇篮曲 · 轻柔版',artist:'安睡乐团',dur:'4:00',tag:'助眠',emoji:'🌜'},
      {title:'梦幻曲',artist:'演示乐团',dur:'5:00',tag:'舒缓',emoji:'💤'},
      {title:'月光曲 · 轻音乐',artist:'康养乐队',dur:'4:30',tag:'宁静',emoji:'🌕'}
    ],
    medium: [
      {title:'夜曲 · 舒缓版',artist:'安睡乐团',dur:'5:20',tag:'宁静',emoji:'🎵'},
      {title:'安眠曲 · 自然声',artist:'演示乐团',dur:'6:00',tag:'自然',emoji:'🍃'}
    ],
    hard: [
      {title:'睡眠协奏曲 · 完整',artist:'古典乐团',dur:'8:00',tag:'古典',emoji:'🎼'},
      {title:'深海摇篮 · 冥想',artist:'安睡乐团',dur:'7:30',tag:'冥想',emoji:'🐋'}
    ]
  },
  memory: {
    easy: [
      {title:'两只老虎 · 节拍版',artist:'童趣乐团',dur:'2:00',tag:'记忆',emoji:'🐯'},
      {title:'数鸭子 · 律动版',artist:'演示乐团',dur:'2:30',tag:'记忆',emoji:'🦆'},
      {title:'找朋友 · 互动版',artist:'康养乐队',dur:'2:15',tag:'互动',emoji:'🤝'}
    ],
    medium: [
      {title:'世上只有妈妈好',artist:'经典演绎',dur:'3:00',tag:'怀旧',emoji:'❤️'},
      {title:'童年 · 回忆版',artist:'演示乐团',dur:'3:20',tag:'怀旧',emoji:'📻'}
    ],
    hard: [
      {title:'长征组歌 · 节选',artist:'交响乐团',dur:'5:00',tag:'经典',emoji:'🎺'},
      {title:'东方红 · 交响版',artist:'演示乐团',dur:'4:30',tag:'经典',emoji:'🌅'}
    ]
  }
};

function $(sel){return document.querySelector(sel)}
function $$(sel){return document.querySelectorAll(sel)}

function navigate(viewId){
  var target = $('#view-'+viewId);
  if(!target) return;
  $$('.view').forEach(function(v){v.classList.remove('active')});
  target.classList.add('active');
  state.currentView = viewId;
  window.scrollTo(0,0);
  if(viewId==='elder-music') renderMusicList();
  if(viewId==='elder-home'||viewId==='child-home') updateDate();
}

function updateDate(){
  var d = new Date();
  var days = ['日','一','二','三','四','五','六'];
  var str = d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 星期'+days[d.getDay()];
  var el = $('#elder-date');
  if(el) el.textContent = str;
}

function showToast(msg){
  var t = $('#toast');
  var txt = $('#toast-text');
  txt.textContent = msg;
  t.hidden = false;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function(){
    t.classList.remove('show');
    setTimeout(function(){t.hidden=true},300);
  },2500);
}

function showModal(title,body){
  var overlay = $('#modal-overlay');
  $('#modal-title').textContent = title;
  $('#modal-body').textContent = body;
  overlay.hidden = false;
  overlay.querySelector('.btn').focus();
}

window.closeModal = function(){
  $('#modal-overlay').hidden = true;
};

window.showInviteDemo = function(name){
  showModal('邀请已发送（演示）','已向爸爸发送「'+name+'」的互动邀请。\n\n这是演示功能，不会发送真实邀请。');
};

window.showPushDemo = function(type){
  showModal('推送成功（演示）','已成功'+type+'推送给爸爸。\n\n这是演示功能，不会发送真实消息。');
};

function renderMusicList(){
  var list = musicData[state.health][state.diff];
  var container = $('#music-list');
  if(!container) return;
  container.innerHTML = '';
  list.forEach(function(m,i){
    var div = document.createElement('div');
    div.className = 'music-item';
    div.innerHTML =
      '<div class="music-thumb">'+m.emoji+'</div>'+
      '<div class="music-info">'+
        '<h4>'+m.title+'</h4>'+
        '<p>'+m.artist+' · '+m.dur+'</p>'+
        '<div class="music-tags"><span class="music-tag">'+m.tag+'</span><span class="music-tag">'+
          (state.diff==='easy'?'简单':state.diff==='medium'?'适中':'挑战')+'</span></div>'+
      '</div>'+
      '<button class="music-play-btn" aria-label="播放'+m.title+'" data-idx="'+i+'">▶</button>';
    container.appendChild(div);
  });
  container.querySelectorAll('.music-play-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      var idx = parseInt(this.getAttribute('data-idx'));
      playMusic(list[idx]);
    });
  });
}

function playMusic(track){
  $$('.music-item').forEach(function(el){el.classList.remove('playing')});
  var items = $$('.music-item');
  var idx = Array.from(items).findIndex(function(el){
    return el.querySelector('h4') && el.querySelector('h4').textContent === track.title;
  });
  if(idx>=0 && items[idx]) items[idx].classList.add('playing');

  var bar = $('#music-player');
  bar.hidden = false;
  $('#player-title').textContent = track.title;
  $('#player-artist').textContent = track.artist;
  state.playing = true;
  $('#player-play-btn').textContent = '⏸';

  // Play demo melody
  playMelody(track);

  clearInterval(state.progressInterval);
  var progress = 0;
  var parts = track.dur.split(':');
  var totalSec = parseInt(parts[0])*60+parseInt(parts[1]);
  $('#progress-fill').style.width = '0%';
  $('#progress-text').textContent = '0:00 / '+track.dur;

  state.progressInterval = setInterval(function(){
    if(!state.playing) return;
    progress++;
    if(progress>=totalSec){
      clearInterval(state.progressInterval);
      state.playing = false;
      $('#player-play-btn').textContent = '▶';
      showToast('演示曲目播放完毕');
      return;
    }
    var pct = (progress/totalSec*100).toFixed(1);
    $('#progress-fill').style.width = pct+'%';
    var m = Math.floor(progress/60);
    var s = progress%60;
    $('#progress-text').textContent = m+':'+(s<10?'0':'')+s+' / '+track.dur;
    // Play melody every 5 seconds
    if(progress%5===0) playMelody(track);
  },1000);
}

window.togglePlay = function(){
  state.playing = !state.playing;
  $('#player-play-btn').textContent = state.playing ? '⏸' : '▶';
  if(state.playing){
    showToast('继续播放（演示）');
  } else {
    showToast('已暂停（演示）');
  }
};

function simulateVoice(text){
  showToast('语音播报：'+text);
}

// ===== Audio Functions =====
function initAudio(){
  if(!state.audioCtx){
    state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration, type){
  initAudio();
  var ctx = state.audioCtx;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playMelody(track){
  // Generate a simple melody based on track title hash
  var hash = 0;
  for(var i=0;i<track.title.length;i++){
    hash = ((hash<<5)-hash)+track.title.charCodeAt(i);
    hash = hash & hash;
  }
  var baseFreq = 261.63 + (Math.abs(hash)%200); // C4 range
  var notes = [baseFreq, baseFreq*1.25, baseFreq*1.5, baseFreq*1.25, baseFreq*2];
  var noteDuration = 0.3;
  var delay = 0;
  notes.forEach(function(freq,idx){
    setTimeout(function(){
      if(state.playing) playTone(freq, noteDuration, 'sine');
    }, delay*1000);
    delay += noteDuration;
  });
}

// ===== Large Font Mode =====
function updateFontSize(){
  if(state.largeFont){
    document.documentElement.style.setProperty('--font-base','18px');
    document.documentElement.style.setProperty('--font-sm','15px');
    document.documentElement.style.setProperty('--font-lg','22px');
    document.documentElement.style.setProperty('--font-xl','28px');
  } else {
    document.documentElement.style.setProperty('--font-base','16px');
    document.documentElement.style.setProperty('--font-sm','14px');
    document.documentElement.style.setProperty('--font-lg','20px');
    document.documentElement.style.setProperty('--font-xl','24px');
  }
}

// ===== Game Logic =====
window.startGame = function(){
  if(state.gameRunning) return;
  state.gameRunning = true;
  state.gameScore = 0;
  state.gameCombo = 0;
  state.gameStep = 0;
  updateGameScore();
  $('#game-start-btn').disabled = true;
  $('#game-stop-btn').disabled = false;
  $('#game-hint').textContent = '准备...';

  simulateVoice('游戏开始，请准备');

  setTimeout(function(){
    nextGameRound();
  },1000);
};

window.stopGame = function(){
  state.gameRunning = false;
  clearTimeout(state.gameTimer);
  $('#game-start-btn').disabled = false;
  $('#game-stop-btn').disabled = true;
  $('#game-hint').textContent = '游戏结束！得分: '+state.gameScore;
  $('#game-circle').className = 'game-circle';
  showToast('游戏结束！最终得分: '+state.gameScore+'（演示）');
  simulateVoice('游戏结束，得分'+state.gameScore+'分，表现很棒');
};

function nextGameRound(){
  if(!state.gameRunning) return;
  var circle = $('#game-circle');
  var hint = $('#game-hint');
  var mode = state.gameMode;

  if(mode==='tap'){
    var pad = Math.floor(Math.random()*4)+1;
    hint.textContent = '点击节拍 '+pad;
    circle.className = 'game-circle active';
    highlightPad(pad);

    state.gameTimer = setTimeout(function(){
      circle.className = 'game-circle miss';
      hint.textContent = '未击中！';
      state.gameCombo = 0;
      updateGameScore();
      setTimeout(function(){
        if(state.gameRunning) nextGameRound();
      },800);
    },2000);
  } else if(mode==='seq'){
    state.gameSequence = [];
    var len = Math.min(3+Math.floor(state.gameScore/30),6);
    for(var i=0;i<len;i++){
      state.gameSequence.push(Math.floor(Math.random()*4)+1);
    }
    hint.textContent = '记住顺序...';
    circle.className = 'game-circle';
    showSequence(0);
  } else {
    var pad1 = Math.floor(Math.random()*4)+1;
    var pad2 = Math.floor(Math.random()*4)+1;
    hint.textContent = '点击 '+pad1+' 然后 '+pad2;
    circle.className = 'game-circle active';
    highlightPad(pad1);
    state.gameStep = 0;
    state.gameSequence = [pad1,pad2];

    state.gameTimer = setTimeout(function(){
      if(state.gameStep<2){
        circle.className = 'game-circle miss';
        hint.textContent = '超时！';
        state.gameCombo = 0;
        updateGameScore();
        setTimeout(function(){
          if(state.gameRunning) nextGameRound();
        },800);
      }
    },3500);
  }
}

function showSequence(idx){
  if(!state.gameRunning) return;
  if(idx>=state.gameSequence.length){
    $('#game-hint').textContent = '请按顺序点击 ('+state.gameSequence.length+'个)';
    $('#game-circle').className = 'game-circle active';
    state.gameStep = 0;
    return;
  }
  highlightPad(state.gameSequence[idx]);
  setTimeout(function(){
    clearPadHighlights();
    setTimeout(function(){showSequence(idx+1)},200);
  },600);
}

function highlightPad(n){
  clearPadHighlights();
  var pad = document.querySelector('.game-pad[data-pad="'+n+'"]');
  if(pad) pad.classList.add('highlight');
}

function clearPadHighlights(){
  $$('.game-pad').forEach(function(p){p.classList.remove('highlight','pressed')});
}

function updateGameScore(){
  $('#game-score-val').textContent = state.gameScore;
  $('#game-combo').textContent = state.gameCombo;
}

function handlePadPress(padNum){
  if(!state.gameRunning) return;
  var circle = $('#game-circle');
  var hint = $('#game-hint');
  var pad = document.querySelector('.game-pad[data-pad="'+padNum+'"]');
  if(pad) pad.classList.add('pressed');
  setTimeout(function(){if(pad) pad.classList.remove('pressed')},150);

  clearTimeout(state.gameTimer);

  if(state.gameMode==='tap'){
    var expected = parseInt(hint.textContent.replace('点击节拍 ',''));
    if(padNum===expected){
      circle.className = 'game-circle hit';
      state.gameScore += 10 + state.gameCombo*2;
      state.gameCombo++;
      hint.textContent = '很好！+'+( 10+(state.gameCombo-1)*2);
      simulateVoice('很好');
    } else {
      circle.className = 'game-circle miss';
      hint.textContent = '不对哦';
      state.gameCombo = 0;
    }
    updateGameScore();
    setTimeout(function(){
      circle.className = 'game-circle';
      if(state.gameRunning) nextGameRound();
    },800);
  } else if(state.gameMode==='seq'){
    if(padNum===state.gameSequence[state.gameStep]){
      state.gameStep++;
      if(state.gameStep>=state.gameSequence.length){
        circle.className = 'game-circle hit';
        var pts = state.gameSequence.length*10;
        state.gameScore += pts;
        state.gameCombo++;
        hint.textContent = '完美！+'+pts;
        simulateVoice('完美');
        updateGameScore();
        setTimeout(function(){
          circle.className = 'game-circle';
          if(state.gameRunning) nextGameRound();
        },1000);
      } else {
        circle.className = 'game-circle hit';
        hint.textContent = '继续... ('+state.gameStep+'/'+state.gameSequence.length+')';
      }
    } else {
      circle.className = 'game-circle miss';
      hint.textContent = '顺序错误';
      state.gameCombo = 0;
      updateGameScore();
      setTimeout(function(){
        circle.className = 'game-circle';
        if(state.gameRunning) nextGameRound();
      },800);
    }
  } else if(state.gameMode==='match'){
    if(padNum===state.gameSequence[state.gameStep]){
      state.gameStep++;
      if(state.gameStep>=state.gameSequence.length){
        circle.className = 'game-circle hit';
        state.gameScore += 20;
        state.gameCombo++;
        hint.textContent = '配对成功！+20';
        simulateVoice('配对成功');
        updateGameScore();
        setTimeout(function(){
          circle.className = 'game-circle';
          if(state.gameRunning) nextGameRound();
        },800);
      } else {
        hint.textContent = '继续点击第 '+(state.gameStep+1)+' 个';
      }
    } else {
      circle.className = 'game-circle miss';
      hint.textContent = '顺序不对';
      state.gameCombo = 0;
      updateGameScore();
      setTimeout(function(){
        circle.className = 'game-circle';
        if(state.gameRunning) nextGameRound();
      },800);
    }
  }
}

// ===== Event Bindings =====
function init(){
  // Navigation
  document.addEventListener('click',function(e){
    var nav = e.target.closest('[data-nav]');
    if(nav){
      e.preventDefault();
      navigate(nav.getAttribute('data-nav'));
    }
  });

  // Login form
  $('#login-form').addEventListener('submit',function(e){
    e.preventDefault();
    var phone = $('#login-phone').value.trim();
    var pwd = $('#login-password').value;
    if(!phone||!pwd){
      showToast('请填写手机号和密码');
      return;
    }
    navigate('role');
  });

  // Register form
  $('#register-form').addEventListener('submit',function(e){
    e.preventDefault();
    var name = $('#reg-name').value.trim();
    var phone = $('#reg-phone').value.trim();
    var pwd = $('#reg-password').value;
    var confirm = $('#reg-confirm').value;
    if(!name||!phone||!pwd){
      showToast('请填写完整信息');
      return;
    }
    if(pwd!==confirm){
      showToast('两次密码输入不一致');
      return;
    }
    showToast('注册成功（演示）');
    navigate('login');
  });

  // Role selection
  $$('.role-card').forEach(function(card){
    card.addEventListener('click',function(){
      var role = this.getAttribute('data-role');
      state.role = role;
      if(role==='elder'){
        navigate('elder-home');
      } else {
        navigate('child-home');
      }
    });
  });

  // Health spec
  $$('#health-spec .spec-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      $$('#health-spec .spec-btn').forEach(function(b){
        b.classList.remove('active');
        b.setAttribute('aria-checked','false');
      });
      this.classList.add('active');
      this.setAttribute('aria-checked','true');
      state.health = this.getAttribute('data-health');
      renderMusicList();
      var labels = {relax:'放松舒缓',energy:'活力提神',sleep:'助眠安睡',memory:'记忆训练'};
      simulateVoice('已切换为'+labels[state.health]+'模式');
    });
  });

  // Difficulty spec
  $$('#difficulty-spec .spec-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      $$('#difficulty-spec .spec-btn').forEach(function(b){
        b.classList.remove('active');
        b.setAttribute('aria-checked','false');
      });
      this.classList.add('active');
      this.setAttribute('aria-checked','true');
      state.diff = this.getAttribute('data-diff');
      renderMusicList();
      var labels = {easy:'简单',medium:'适中',hard:'挑战'};
      simulateVoice('难度已切换为'+labels[state.diff]);
    });
  });

  // Game mode spec
  $$('#game-mode-spec .spec-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      if(state.gameRunning) {showToast('请先结束当前游戏');return;}
      $$('#game-mode-spec .spec-btn').forEach(function(b){b.classList.remove('active')});
      this.classList.add('active');
      state.gameMode = this.getAttribute('data-mode');
      var labels = {tap:'点击跟拍',seq:'顺序记忆',match:'节奏配对'};
      $('#game-hint').textContent = '当前模式: '+labels[state.gameMode]+'，点击开始';
    });
  });

  // Game pads
  $$('.game-pad').forEach(function(pad){
    pad.addEventListener('click',function(){
      handlePadPress(parseInt(this.getAttribute('data-pad')));
    });
  });

  // Emergency call
  $('#emergency-call-btn').addEventListener('click',function(){
    showModal('紧急呼叫（演示）','已向您预设的紧急联系人发送求助信息。\n\n这是演示功能，不会发起真实呼叫。\n\n请保持冷静，等待帮助到达。');
  });

  // Voice buttons
  $('#btn-voice-music').addEventListener('click',function(){
    simulateVoice('当前为您推荐'+musicData[state.health][state.diff].length+'首'+
      ({relax:'放松舒缓',energy:'活力提神',sleep:'助眠安睡',memory:'记忆训练'}[state.health])+'音乐');
  });

  $('#btn-voice-game').addEventListener('click',function(){
    var labels = {tap:'点击跟拍',seq:'顺序记忆',match:'节奏配对'};
    simulateVoice('当前游戏模式为'+labels[state.gameMode]+'，点击开始按钮即可开始游戏');
  });

  // Modal overlay click to close
  $('#modal-overlay').addEventListener('click',function(e){
    if(e.target===this) closeModal();
  });

  // Keyboard: Escape to close modal
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      if(!$('#modal-overlay').hidden) closeModal();
    }
  });

  // Large font toggle
  $('#setting-font').addEventListener('change',function(){
    state.largeFont = this.checked;
    updateFontSize();
    showToast(state.largeFont?'已开启大字体模式':'已关闭大字体模式');
  });

  // Init
  updateDate();
  updateFontSize();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init);
} else {
  init();
}

})();
