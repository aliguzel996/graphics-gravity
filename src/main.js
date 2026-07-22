import './style.css';

const { Engine, Render, Runner, Bodies, Body, Composite, Events, Mouse, MouseConstraint, Vector } = Matter;

document.querySelector('#app').innerHTML = `
<div class="app">
  <header>
    <div class="brand">GRAPHICS GRAVITY <small>YCSWU / 0.2</small></div>
    <div class="head-actions"><button id="openProjectBtn">open</button><button id="saveProjectBtn">save</button><button id="pauseBtn">pause</button><button id="clearBtn">clear</button><input id="projectFileInput" type="file" accept=".graphicsGravity,.graphicsgravity,application/json" hidden></div>
  </header>
  <main>
    <aside>
      <details class="sidebar-panel" id="inputsPanel">
        <summary><span>01 / inputs</span><span id="itemCount">0 items</span></summary>
        <div class="sidebar-panel-body">
        <details class="font-panel" id="fontPanel">
          <summary><span>text font</span><span id="fontCurrent">SPACE MONO</span></summary>
          <div class="font-options" id="fontOptions"></div>
          <label class="font-upload">+ CUSTOM FONT<input id="fontFileInput" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"></label>
        </details>
        <div class="input-row"><input id="textInput" type="text" value="GRAVITY" aria-label="Text"><button class="add" id="addText">+</button></div>
        <div class="shape-grid" style="margin-top:7px"><button data-add-shape="circle">○</button><button data-add-shape="square">□</button><button data-add-shape="triangle">△</button><button data-add-shape="star">☆</button></div>
        <label class="upload" style="margin-top:7px">+ PNG / SVG<input id="fileInput" type="file" accept="image/png,image/svg+xml"></label>
        <div class="library" id="library" aria-label="Input queue"></div>
        <details class="appearance-panel sidebar-panel">
          <summary>appearance / colors</summary>
          <div class="appearance-grid">
            <label><span>preview background</span><input id="outsideColor" type="color" value="#d4d4d0"></label>
            <label><span>container background</span><input id="containerColor" type="color" value="#ffffff"></label>
            <label><span>text color</span><input id="textColor" type="color" value="#111111"></label>
            <label><span>text background</span><input id="textBackgroundColor" type="color" value="#ffffff"></label>
            <label><span>text border color</span><input id="textBorderColor" type="color" value="#111111"></label>
            <label><span>all vector inputs</span><input id="vectorColor" type="color" value="#111111"></label>
            <label id="vectorStrokeColorControl"><span>vector outline color</span><input id="vectorStrokeColor" type="color" value="#111111"></label>
            <label id="textVectorStrokeColorControl"><span>vector text outline color</span><input id="textVectorStrokeColor" type="color" value="#111111"></label>
          </div>
          <label class="check"><input id="vectorStrokeEnabled" type="checkbox"> vector input outline</label>
          <div class="control" id="vectorStrokeThicknessControl"><div class="control-head"><span>vector outline thickness</span><output id="vectorStrokeOut">2 px</output></div><input id="vectorStrokeThickness" type="range" min="0.5" max="16" step="0.5" value="2"></div>
          <label class="check"><input id="textVectorStrokeEnabled" type="checkbox"> vector text outline</label>
          <div class="control" id="textVectorStrokeThicknessControl"><div class="control-head"><span>vector text outline thickness</span><output id="textVectorStrokeOut">2 px</output></div><input id="textVectorStrokeThickness" type="range" min="0.5" max="16" step="0.5" value="2"></div>
          <label class="check"><input id="previewGrid" type="checkbox"> show preview grid</label>
          <div class="control"><div class="control-head"><span>text border thickness</span><output id="textBorderOut">1 px</output></div><input id="textBorderThickness" type="range" min="0" max="12" value="1"></div>
          <div class="control corner-control"><div class="control-head"><span>text corner radius</span><output id="textRadiusOut">8%</output></div><input id="textRadius" type="range" min="0" max="100" value="8"></div>
          <div class="control-note">90% keeps the soft rounded-square taste; 100% makes a single character a true circle</div>
        </details>
        <div class="control" style="margin-top:13px"><div class="control-head"><span>hold drop rate</span><output id="holdDropOut">7 / sec</output></div><input id="holdDropRate" type="range" min="1" max="30" value="7"></div>
        <div class="control-note">controls repeat speed while the mouse is held; a click always drops one piece</div>
        </div>
      </details>
      <details class="sidebar-panel">
        <summary><span>02 / piece size</span><span>live</span></summary>
        <div class="sidebar-panel-body">
        <div class="control"><div class="control-head"><span>all pieces</span><output id="globalSizeOut">100%</output></div><input id="globalPieceSize" type="range" min="25" max="250" value="100"></div>
        <div class="control"><div class="control-head"><span id="selectedSizeName">selected input size</span><output id="selectedSizeOut">100%</output></div><input id="selectedPieceSize" type="range" min="25" max="300" value="100"></div>
        <div class="control-note">selected input size affects future drops; enable the option below to resize matching placed copies too</div>
        <button class="reset-random" id="resetSelectedSize">RESET SELECTED / 100%</button>
        <label class="selected-color-control" id="selectedColorControl"><span>selected input color</span><input id="selectedInputColor" type="color" value="#111111"></label>
        <label class="check"><input id="applySelectedToPlaced" type="checkbox"> apply to placed copies</label>
        <label class="check"><input id="randomSize" type="checkbox"> random size per drop</label>
        <div class="range-pair">
          <div class="control"><div class="control-head"><span>random min</span><output id="randomMinOut">60%</output></div><input id="randomMin" type="range" min="20" max="200" value="60"></div>
          <div class="control"><div class="control-head"><span>random max</span><output id="randomMaxOut">140%</output></div><input id="randomMax" type="range" min="20" max="300" value="140"></div>
        </div>
        <button class="reset-random" id="resetRandomSize">RESET RANDOM / 100%</button>
        </div>
      </details>
      <details class="sidebar-panel">
        <summary><span>03 / container</span><span id="containerLabel">circle</span></summary>
        <div class="sidebar-panel-body">
        <div class="container-grid"><button class="active" data-container="circle">circle</button><button data-container="square">square</button><button data-container="triangle">triangle</button><button data-container="custom">custom</button></div>
        <div class="draw-actions" id="drawActions"><button id="finishDraw">close shape</button><button id="cancelDraw">cancel</button></div>
        <div class="control" style="margin-top:13px"><div class="control-head"><span>size</span><output id="sizeOut">72%</output></div><input id="containerSize" type="range" min="38" max="92" value="72"></div>
        <div class="control"><div class="control-head"><span>sides</span><output id="sidesOut">24</output></div><input id="containerSides" type="range" min="3" max="64" value="24"></div>
        <div class="rectangle-controls" id="rectangleControls">
          <div class="control"><div class="control-head"><span>long side</span><output id="rectLongOut">100%</output></div><input id="rectLongSide" type="range" min="40" max="130" value="100"></div>
          <div class="control"><div class="control-head"><span>short side</span><output id="rectShortOut">100%</output></div><input id="rectShortSide" type="range" min="30" max="100" value="100"></div>
        </div>
        <div class="control"><div class="control-head"><span>outline thickness</span><output id="thicknessOut">6 px</output></div><input id="outlineThickness" type="range" min="1" max="30" value="6"></div>
        <label class="check"><input id="showBoundary" type="checkbox" checked> show container in output</label>
        <label class="check"><input id="autoRotate" type="checkbox"> auto rotate</label>
        <div class="control"><div class="control-head"><span>rotation speed</span><output id="rotationOut">8 deg/s</output></div><input id="rotationSpeed" type="range" min="-360" max="360" value="8"></div>
        </div>
      </details>
      <details class="sidebar-panel">
        <summary><span>04 / physics</span><span>live</span></summary>
        <div class="sidebar-panel-body">
        <div class="control"><div class="control-head"><span>gravity</span><output id="gravityOut">1.00</output></div><input id="gravity" type="range" min="0" max="250" value="100"></div>
        <div class="control"><div class="control-head"><span>bounciness</span><output id="bounceOut">0.55</output></div><input id="bounce" type="range" min="0" max="100" value="55"></div>
        <div class="control"><div class="control-head"><span>friction</span><output id="frictionOut">0.12</output></div><input id="friction" type="range" min="0" max="100" value="12"><div class="control-note">surface grip — low slides, high settles</div></div>
        <div class="control"><div class="control-head"><span>mutual attraction</span><output id="attractOut">0.00</output></div><input id="attraction" type="range" min="0" max="100" value="0"><div class="control-note">pieces pull toward each other like magnets</div></div>
        <label class="check"><input id="overflowBehind" type="checkbox" checked> layer overflow behind</label>
        <div class="control-note">the front layer fills first; the back layer has its own physics, and excess pieces are discarded</div>
        </div>
      </details>
      <div class="sidebar-note quiet">INPUTS DROP LEFT TO RIGHT. DRAG INPUT CARDS TO REORDER THE QUEUE. CLICK A CARD TO MAKE IT NEXT.</div>
    </aside>
    <div class="stage-wrap"><div class="stage frame-free" id="stage"><div class="stage-tools stage-tools-left"><button id="recBtn">REC</button><span id="recTime">00:00</span></div><div class="stage-tools stage-tools-center"><button class="active" data-frame="free">FREE</button><button data-frame="square">1:1</button><button data-frame="vertical">9:16</button></div><div class="stage-tools stage-tools-right"><button id="svgBtn">EXPORT SVG</button><button id="jpgBtn">EXPORT JPG</button><button id="pngBtn">EXPORT PNG</button></div><div class="frame-resolution" id="frameResolution"></div><div class="empty-hint" id="emptyHint">tap or hold click</div><div class="draw-note">click points around the desired boundary, then close shape</div><div class="status"><span id="bodyStatus">0 bodies</span><span id="fpsStatus">60 fps</span></div><div class="zoom-level" id="zoomLevel">ZOOM 100%</div></div></div>
  </main>
  <dialog id="recordSaveDialog" class="record-dialog">
    <form method="dialog">
      <div class="dialog-kicker">recording complete</div>
      <div class="dialog-title">how do you want to save it?</div>
      <div class="dialog-actions"><button type="button" id="saveWebm">WEBM VIDEO</button><button type="button" id="savePngSequence">PNG SEQUENCE ZIP</button></div>
      <div class="dialog-note" id="recordDialogNote">PNG sequence exports at 30 FPS.</div>
      <button class="dialog-cancel" value="cancel">cancel</button>
    </form>
  </dialog>
  <dialog id="clearDialog" class="record-dialog">
    <form method="dialog">
      <div class="dialog-kicker">clear scene</div>
      <div class="dialog-title">reset left-side settings too?</div>
      <div class="dialog-actions"><button type="button" id="clearAllBtn">YES — RESET ALL</button><button type="button" id="clearPreviewBtn">NO — PREVIEW ONLY</button></div>
      <div class="dialog-note">Preview only keeps the input queue, sizes, colors, container and physics settings exactly as they are.</div>
      <button class="dialog-cancel" value="cancel">cancel</button>
    </form>
  </dialog>
</div>`;

document.querySelector('#inputsPanel').after(document.querySelector('.appearance-panel'));
document.querySelectorAll('aside > .sidebar-panel').forEach(panel=>panel.addEventListener('toggle',()=>{if(panel.open)document.querySelectorAll('aside > .sidebar-panel').forEach(other=>{if(other!==panel)other.open=false;});}));

const hexColorFields=new Map(),opacityFields=new Map();
function normalizedHexColor(value){const raw=String(value||'').trim().replace(/^#/,'');if(/^[0-9a-f]{3}$/i.test(raw))return`#${raw.split('').map(char=>char+char).join('').toUpperCase()}`;if(/^[0-9a-f]{6}$/i.test(raw))return`#${raw.toUpperCase()}`;return null;}
function setColorFieldValue(input,value){const normalized=normalizedHexColor(value)||'#111111';input.value=normalized;const hex=hexColorFields.get(input);if(hex)hex.value=normalized;}
function setOpacityFieldValue(input,value){const field=opacityFields.get(input),next=Math.max(0,Math.min(100,Number.isFinite(+value)?+value:100));if(field){field.range.value=next;field.output.textContent=`${Math.round(next)}%`;}}
function syncHexColorFields(){hexColorFields.forEach((hex,input)=>hex.value=input.value.toUpperCase());opacityFields.forEach(field=>field.output.textContent=`${Math.round(+field.range.value)}%`);}
function installHexColorFields(){document.querySelectorAll('input[type="color"]:not(.tile-color-input)').forEach(input=>{const wrapper=document.createElement('span'),hex=document.createElement('input'),alpha=document.createElement('span'),alphaLabel=document.createElement('span'),range=document.createElement('input'),output=document.createElement('output'),opacityId=`${input.id.replace(/Color$/,'')}Opacity`;wrapper.className='color-field';hex.type='text';hex.className='hex-input';hex.maxLength=7;hex.spellcheck=false;hex.setAttribute('aria-label',`${input.id} hex color`);alpha.className='alpha-field';alphaLabel.textContent='A';range.type='range';range.className='alpha-range';range.id=opacityId;range.min='0';range.max='100';range.value='100';range.defaultValue='100';range.setAttribute('aria-label',`${input.id} opacity`);output.textContent='100%';input.before(wrapper);alpha.append(alphaLabel,range,output);wrapper.append(input,hex,alpha);hexColorFields.set(input,hex);opacityFields.set(input,{range,output});setColorFieldValue(input,input.value);input.addEventListener('input',()=>hex.value=input.value.toUpperCase());hex.addEventListener('input',()=>{const normalized=normalizedHexColor(hex.value);if(normalized){input.value=normalized;input.dispatchEvent(new Event('input',{bubbles:true}));}});hex.addEventListener('blur',()=>hex.value=input.value.toUpperCase());range.addEventListener('input',()=>output.textContent=`${Math.round(+range.value)}%`);});}
installHexColorFields();

const BUILTIN_FONTS=[
  {id:'italic-script',label:'Italic Script',family:'"Brush Script MT", "Segoe Script", cursive',style:'italic'},
  {id:'helvetica-arial',label:'Helvetica / Arial',family:'Helvetica, Arial, sans-serif',style:'normal'},
  {id:'space-mono',label:'Space Mono',family:'"Space Mono", monospace',style:'normal'},
];
const customFonts=[];
let selectedFontId='space-mono';
const textMeasureCanvas=document.createElement('canvas'),textMeasureContext=textMeasureCanvas.getContext('2d');
function fontRecord(id){return customFonts.find(font=>font.id===id)||BUILTIN_FONTS.find(font=>font.id===id)||BUILTIN_FONTS[2];}
function fontCss(size,id){const font=fontRecord(id);return`${font.style||'normal'} 400 ${size}px ${font.family}`;}
function textOpticalOffset(fontSize){return fontSize*.045;}
function textGeometry(text,size,fontId){const fontSize=size*.75;textMeasureContext.font=fontCss(fontSize,fontId);const measured=textMeasureContext.measureText(text).width,h=size*1.25,w=text.length===1?h:Math.max(size,measured+size*.65);return{fontSize,w,h};}
function renderFontOptions(){
  const root=document.querySelector('#fontOptions');root.innerHTML='';
  [...BUILTIN_FONTS,...customFonts].forEach(font=>{const button=document.createElement('button');button.type='button';button.className=`font-option ${font.id===selectedFontId?'active':''}`;button.dataset.fontId=font.id;button.style.fontFamily=font.family;button.style.fontStyle=font.style||'normal';const label=document.createElement('span'),status=document.createElement('small');label.textContent=font.label;status.textContent=font.id===selectedFontId?'selected':font.custom?'custom':'preset';button.append(label,status);button.onclick=()=>selectTextFont(font.id);root.append(button);});
  const current=fontRecord(selectedFontId);document.querySelector('#fontCurrent').textContent=current.label.toUpperCase();const input=document.querySelector('#textInput');input.style.fontFamily=current.family;input.style.fontStyle=current.style||'normal';
}
function selectTextFont(id){selectedFontId=fontRecord(id).id;renderFontOptions();}
async function installCustomFont(record){const font=new FontFace(record.family,`url("${record.dataUrl}")`,{style:record.style||'normal',weight:'400'});await font.load();document.fonts.add(font);return font;}
async function addCustomFontRecord(record){const copy={...record,custom:true};await installCustomFont(copy);const existing=customFonts.findIndex(font=>font.id===copy.id);if(existing>=0)customFonts.splice(existing,1,copy);else customFonts.push(copy);return copy;}
document.querySelector('#fontFileInput').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);}),id=`custom-${Date.now().toString(36)}`,label=file.name.replace(/\.[^.]+$/,'')||'Custom Font',record=await addCustomFontRecord({id,label,family:`GraphicsGravity_${id.replace(/[^a-z0-9_-]/gi,'_')}`,style:'normal',dataUrl,fileName:file.name});selectTextFont(record.id);}catch(error){console.warn('Custom font could not be loaded',error);}finally{event.target.value='';}};
renderFontOptions();

const stage = document.querySelector('#stage');
const stageWrap = document.querySelector('.stage-wrap');
function syncPreviewGrid(){const visible=!!document.querySelector('#previewGrid')?.checked;stage.classList.toggle('grid-visible',visible);stageWrap.classList.toggle('grid-visible',visible);}
const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 }, positionIterations: 12, velocityIterations: 10, constraintIterations: 4 });
const render = Render.create({ element: stage, engine, options: { wireframes: false, background: 'transparent', pixelRatio: 1 } });
const runner = Runner.create();
const framePresets = { square:{width:1920,height:1920,label:'1920 × 1920'}, vertical:{width:1080,height:1920,label:'1080 × 1920'} };
const CAT_CONTAINER=0x0001,CAT_PIECE=0x0002,CAT_OVERFLOW=0x0004,FRONT_LAYER_FILL_RATIO=.88;
let frameMode = 'free', W = 900, H = 700, containerBodies = [], containerPolygon = [], containerAngle = 0, containerType = 'circle', customPoints = [], drawing = false, previewZoom = 1, previewPixelRatio = 1, previewDisplayW = 900, previewDisplayH = 700;
let queueIndex = 0, selectedInputId = null, itemId = 0, dropping = null, dropPosition = null, dropPointerId = null, paused = false, lastTime = performance.now(), frames = 0, lastGlobalSize = 1, lastContainerSize = 72;
let mediaRecorder = null, recordStream = null, recordCanvas = null, recordContext = null, recordedChunks = [], recordTimer = null, recordStartedAt = 0, pendingRecordingBlob = null;
const library = [];
const colorValue=(id,fallback)=>document.querySelector(id)?.value||fallback;
const clampOpacity=value=>Math.max(0,Math.min(100,Number.isFinite(+value)?+value:100));
function opacityValue(colorSelector,fallback=100){const input=document.querySelector(colorSelector),field=opacityFields.get(input);return clampOpacity(field?.range.value??fallback);}
function rgbaColor(color,opacity=100){const hex=normalizedHexColor(color)||'#111111',alpha=clampOpacity(opacity)/100,r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${Number(alpha.toFixed(3))})`;}
const paintValue=(colorSelector,fallback)=>rgbaColor(colorValue(colorSelector,fallback),opacityValue(colorSelector));
function flattenedColor(color,opacity=100){const hex=normalizedHexColor(color)||'#ffffff',alpha=clampOpacity(opacity)/100,channel=start=>Math.round(parseInt(hex.slice(start,start+2),16)*alpha+255*(1-alpha));return`rgb(${channel(1)},${channel(3)},${channel(5)})`;}

function resize() {
  const r=stageWrap.getBoundingClientRect(),availableW=Math.max(200,r.width-28),availableH=Math.max(200,r.height-28),frame=framePresets[frameMode];let displayW,displayH;if(frame){const fit=Math.min(availableW/frame.width,availableH/frame.height);displayW=Math.floor(frame.width*fit);displayH=Math.floor(frame.height*fit);W=frame.width;H=frame.height;}else{displayW=Math.floor(availableW);displayH=Math.floor(availableH);W=displayW;H=displayH;}
  previewDisplayW=displayW;previewDisplayH=displayH;
  stage.style.width=`${displayW}px`;stage.style.height=`${displayH}px`;
  render.canvas.width = W; render.canvas.height = H;
  render.canvas.style.width = `${displayW}px`; render.canvas.style.height = `${displayH}px`;
  render.options.width = W; render.options.height = H; render.bounds.max.x = W; render.bounds.max.y = H;
  updatePreviewResolution();
  rebuildContainer();
}
new ResizeObserver(resize).observe(stageWrap);

function setFrame(mode){if(!['free','square','vertical'].includes(mode))return;if(mode===frameMode&&mode!=='free')mode='free';if(mode===frameMode)return;const oldW=W,oldH=H,r=stageWrap.getBoundingClientRect(),availableW=Math.max(200,r.width-28),availableH=Math.max(200,r.height-28),preset=framePresets[mode],nextW=preset?.width||Math.floor(availableW),nextH=preset?.height||Math.floor(availableH),sx=nextW/oldW,sy=nextH/oldH,uniform=Math.min(sx,sy);Composite.allBodies(engine.world).filter(b=>b.label==='piece').forEach(body=>{Body.setPosition(body,{x:body.position.x*sx,y:body.position.y*sy});scaleBody(body,uniform);});customPoints=customPoints.map(p=>[p[0]*sx,p[1]*sy]);frameMode=mode;stage.classList.toggle('frame-free',mode==='free');stage.classList.toggle('frame-square',mode==='square');stage.classList.toggle('frame-vertical',mode==='vertical');document.querySelectorAll('[data-frame]').forEach(button=>button.classList.toggle('active',button.dataset.frame===mode));document.querySelector('#frameResolution').textContent=preset?.label||'';resize();containPieces();}

function polygonPoints(type, radius) {
  const cx = W / 2, cy = H / 2;
  if (type === 'square') {const halfW=Math.min(W*.46,radius*(+document.querySelector('#rectLongSide').value/100)),halfH=Math.min(H*.46,radius*(+document.querySelector('#rectShortSide').value/100));return [[cx-halfW,cy-halfH],[cx+halfW,cy-halfH],[cx+halfW,cy+halfH],[cx-halfW,cy+halfH]];}
  if (type === 'triangle') return Array.from({length:3},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/3;return[cx+Math.cos(a)*radius,cy+Math.sin(a)*radius]});
  if (type === 'custom' && customPoints.length > 2) return customPoints;
  const sides = +document.querySelector('#containerSides').value;
  return Array.from({length:sides},(_,i)=>{const a=-Math.PI/2+i*Math.PI*2/sides;return[cx+Math.cos(a)*radius,cy+Math.sin(a)*radius]});
}

function rebuildContainer() {
  Composite.remove(engine.world, containerBodies); containerBodies = [];
  if (drawing) return;
  const radius = Math.min(W,H) * (+document.querySelector('#containerSize').value / 200);
  const basePoints = polygonPoints(containerType, radius),center={x:W/2,y:H/2};
  const pts = containerAngle?basePoints.map(p=>{const rotated=Vector.rotate({x:p[0]-center.x,y:p[1]-center.y},containerAngle);return[center.x+rotated.x,center.y+rotated.y]}):basePoints;
  containerPolygon = pts.map(p => [...p]);
  const visualThickness = +document.querySelector('#outlineThickness').value;
  const physicsThickness = Math.max(24, visualThickness + 16);
  pts.forEach((p,i) => {
    const q = pts[(i+1)%pts.length], dx=q[0]-p[0], dy=q[1]-p[1], len=Math.hypot(dx,dy);
    if(len<1)return;
    const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,n1={x:-dy/len,y:dx/len},inward=pointInContainer(mx+n1.x*2,my+n1.y*2)?n1:{x:-n1.x,y:-n1.y},offset=(physicsThickness-visualThickness)/2;
    const wall = Bodies.rectangle(mx-inward.x*offset,my-inward.y*offset,len+4,physicsThickness,{isStatic:true,angle:Math.atan2(dy,dx),label:'container',collisionFilter:{category:CAT_CONTAINER,mask:CAT_PIECE|CAT_OVERFLOW},render:{fillStyle:'transparent',strokeStyle:'transparent'}});
    containerBodies.push(wall);
  });
  pts.forEach(p=>containerBodies.push(Bodies.circle(p[0],p[1],physicsThickness/2,{isStatic:true,label:'container',collisionFilter:{category:CAT_CONTAINER,mask:CAT_PIECE|CAT_OVERFLOW},render:{fillStyle:'transparent',strokeStyle:'transparent'}})));
  Composite.add(engine.world, containerBodies);
  refreshOverflowLayers();containPieces();
}

function itemIsVector(item){return !!item&&(item.kind==='text'||item.kind==='shape'||!!item.svgSource);}
function itemIsShapeVector(item){return !!item&&(item.kind==='shape'||!!item.svgSource);}
function itemEffectiveColor(item){return normalizedHexColor(item?.color)||(item?.kind==='text'?colorValue('#textColor','#111111'):colorValue('#vectorColor','#111111'));}
function itemEffectiveOpacity(item,settings=null){if(Number.isFinite(+item?.opacity))return clampOpacity(item.opacity);if(settings){const key=item?.kind==='text'?'textOpacity':'vectorOpacity';return clampOpacity(settings[key]??100);}return item?.kind==='text'?opacityValue('#textColor'):opacityValue('#vectorColor');}
function itemEffectivePaint(item){return rgbaColor(itemEffectiveColor(item),itemEffectiveOpacity(item));}
function vectorStrokeAppearance(settings=null){const enabled=settings?settings.vectorStrokeEnabled===true||settings.vectorStrokeEnabled==='true':!!document.querySelector('#vectorStrokeEnabled')?.checked,color=normalizedHexColor(settings?.vectorStrokeColor)||(settings? '#111111':colorValue('#vectorStrokeColor','#111111')),opacity=clampOpacity(settings?.vectorStrokeOpacity??(settings?100:opacityValue('#vectorStrokeColor'))),thickness=Math.max(.5,+(settings?.vectorStrokeThickness??document.querySelector('#vectorStrokeThickness')?.value??2));return{enabled,color,opacity,thickness,paint:rgbaColor(color,opacity)};}
function textVectorStrokeAppearance(settings=null){const enabled=settings?settings.textVectorStrokeEnabled===true||settings.textVectorStrokeEnabled==='true':!!document.querySelector('#textVectorStrokeEnabled')?.checked,color=normalizedHexColor(settings?.textVectorStrokeColor)||(settings?'#111111':colorValue('#textVectorStrokeColor','#111111')),opacity=clampOpacity(settings?.textVectorStrokeOpacity??(settings?100:opacityValue('#textVectorStrokeColor'))),thickness=Math.max(.5,+(settings?.textVectorStrokeThickness??document.querySelector('#textVectorStrokeThickness')?.value??2));return{enabled,color,opacity,thickness,paint:rgbaColor(color,opacity)};}
function svgDataUrl(source){return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;}
function colorizedSvgSource(source,color,opacity=100,strokeSettings=vectorStrokeAppearance()){
  if(!source||!color)return source;
  const alpha=clampOpacity(opacity)/100,strokeAlpha=strokeSettings.opacity/100,filled='path:not([fill="none"]),rect:not([fill="none"]),circle:not([fill="none"]),ellipse:not([fill="none"]),polygon:not([fill="none"]),text:not([fill="none"]),use:not([fill="none"])',lines='line,polyline,[fill="none"]',fillStroke=strokeSettings.enabled?`${strokeSettings.color}!important;stroke-opacity:${strokeAlpha}!important;stroke-width:${strokeSettings.thickness}px!important;stroke-linejoin:round!important;stroke-linecap:round!important`:'none!important',lineStroke=strokeSettings.enabled?strokeSettings.color:color,lineOpacity=strokeSettings.enabled?strokeAlpha:alpha,lineWidth=strokeSettings.enabled?strokeSettings.thickness:Math.max(1,strokeSettings.thickness);
  const style=`<style id="graphics-gravity-color">${filled}{fill:${color}!important;fill-opacity:${alpha}!important;stroke:${fillStroke}}${lines}{fill:none!important;stroke:${lineStroke}!important;stroke-opacity:${lineOpacity}!important;stroke-width:${lineWidth}px!important;stroke-linejoin:round!important;stroke-linecap:round!important}</style>`;
  return source.replace(/<svg\b[^>]*>/i,match=>`${match}${style}`);
}
function setBodyVectorAppearance(body,item){const stroke=vectorStrokeAppearance(),parts=[body,...(body.parts||[])];parts.forEach(part=>{part.render=part.render||{};part.render.fillStyle=itemEffectivePaint(item);part.render.strokeStyle=stroke.enabled?stroke.paint:'transparent';part.render.lineWidth=stroke.enabled?stroke.thickness:0;});}
function updatePlacedVectorColor(item){
  Composite.allBodies(engine.world).filter(body=>body.label==='piece'&&body.plugin?.inputId===item.id).forEach(body=>{
    if(item.kind==='shape')setBodyVectorAppearance(body,item);
  });
}
async function refreshSvgVectorImage(item){
  const version=(item._colorVersion||0)+1;item._colorVersion=version;
  const src=svgDataUrl(colorizedSvgSource(item.svgSource,itemEffectiveColor(item),itemEffectiveOpacity(item)));
  try{
    const image=await loadProjectImage(src);
    if(item._colorVersion!==version||!library.includes(item))return;
    item.src=src;item.image=image;item.width=image.naturalWidth;item.height=image.naturalHeight;item.alphaRects=item.alphaRects?.length?item.alphaRects:extractAlphaRects(image);
    Composite.allBodies(engine.world).filter(body=>body.label==='piece'&&body.plugin?.inputId===item.id&&body.plugin?.drawImage).forEach(body=>{body.plugin.drawImage=image;body.plugin.drawImageSrc=src;});
    drawLibrary();
  }catch(error){console.warn('SVG color update failed',error);}
}
function setItemVectorColor(item,value){
  if(!itemIsVector(item))return;
  const color=normalizedHexColor(value);if(!color)return;
  item.color=color;updatePlacedVectorColor(item);
  if(item.svgSource)refreshSvgVectorImage(item);
  else drawLibrary();
}
function setItemVectorOpacity(item,value){if(!itemIsVector(item))return;item.opacity=clampOpacity(value);updatePlacedVectorColor(item);if(item.svgSource)refreshSvgVectorImage(item);else drawLibrary();}
function refreshAllVectorAppearance(){library.filter(item=>item.kind==='shape').forEach(updatePlacedVectorColor);library.filter(item=>item.svgSource).forEach(refreshSvgVectorImage);drawLibrary();}
function addLibrary(item) {
  item.id = ++itemId; item.size = 100;if(item.kind==='text'&&!item.fontId)item.fontId=selectedFontId;if(itemIsVector(item)){if(!item.color)item.color=item.kind==='text'?colorValue('#textColor','#111111'):colorValue('#vectorColor','#111111');if(!Number.isFinite(+item.opacity))item.opacity=item.kind==='text'?opacityValue('#textColor'):opacityValue('#vectorColor');}library.push(item); if(selectedInputId===null)selectedInputId=item.id; drawLibrary();
}
function selectedItem(){return library.find(item=>item.id===selectedInputId) || library[0];}
function syncSelectedColorEditor(){const item=selectedItem(),editable=itemIsVector(item),control=document.querySelector('#selectedColorControl'),input=document.querySelector('#selectedInputColor'),hex=hexColorFields.get(input),opacity=opacityFields.get(input);control.classList.toggle('disabled',!editable);input.disabled=!editable;if(hex)hex.disabled=!editable;if(opacity)opacity.range.disabled=!editable;setColorFieldValue(input,editable?itemEffectiveColor(item):colorValue('#vectorColor','#111111'));setOpacityFieldValue(input,editable?itemEffectiveOpacity(item):100);}
function syncSelectedSizeEditor(){const item=selectedItem(),slider=document.querySelector('#selectedPieceSize'),resetButton=document.querySelector('#resetSelectedSize');document.querySelector('#selectedSizeName').textContent='selected input size';resetButton.disabled=!item;if(!item){slider.disabled=true;document.querySelector('#selectedSizeOut').textContent='—';syncSelectedColorEditor();return;}slider.disabled=false;slider.value=item.size;document.querySelector('#selectedSizeOut').textContent=`${item.size}%`;syncSelectedColorEditor();}
function drawLibrary() {
  const el = document.querySelector('#library'); el.innerHTML = '';
  library.forEach((item,index) => {
    const tile = document.createElement('div'),vector=itemIsVector(item); tile.className = `tile ${vector?'vector':''} ${index===queueIndex?'active':''} ${item.id===selectedInputId?'selected':''}`;
    tile.draggable = true; tile.dataset.index = index; tile.dataset.order = index + 1;tile.dataset.itemId=item.id;if(vector){const stroke=item.kind==='text'?textVectorStrokeAppearance():vectorStrokeAppearance();tile.style.setProperty('--input-color',itemEffectiveColor(item));tile.style.setProperty('--input-opacity',itemEffectiveOpacity(item)/100);tile.style.setProperty('--input-paint',itemEffectivePaint(item));tile.style.setProperty('--input-stroke-color',stroke.enabled?stroke.paint:'transparent');tile.style.setProperty('--input-stroke-width',stroke.enabled?`${Math.min(3,stroke.thickness)}px`:'0');if(item.kind==='text'){const font=fontRecord(item.fontId);tile.style.setProperty('--input-font-family',font.family);tile.style.setProperty('--input-font-style',font.style||'normal');}}
    if (item.kind === 'image') { const img=document.createElement('img'); img.src=item.src; img.alt='uploaded'; tile.append(img); }
    else { const preview=document.createElement('span'); preview.className='tile-preview'; preview.textContent=item.preview; tile.append(preview); }
    if(vector){const color=document.createElement('input');color.type='color';color.className='tile-color-input';color.value=itemEffectiveColor(item);color.setAttribute('aria-label',`Input ${index+1} color`);color.onpointerdown=e=>e.stopPropagation();color.onclick=e=>e.stopPropagation();color.oninput=e=>{e.stopPropagation();setItemVectorColor(item,e.target.value);};tile.append(color);}
    const remove=document.createElement('span'); remove.className='remove'; remove.textContent='×'; tile.append(remove);
    tile.title = item.kind === 'text' ? item.value : `Input ${index+1}`;
    tile.onclick = e => { if (e.target.classList.contains('remove')) { const i=library.indexOf(item); library.splice(i,1); queueIndex=Math.min(queueIndex,Math.max(0,library.length-1)); if(selectedInputId===item.id)selectedInputId=library[0]?.id??null; } else {queueIndex=index;selectedInputId=item.id;} drawLibrary(); };
    tile.ondragstart = e => { e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',String(index)); tile.classList.add('dragging'); };
    tile.ondragend = () => tile.classList.remove('dragging');
    tile.ondragover = e => { e.preventDefault(); e.dataTransfer.dropEffect='move'; };
    tile.ondrop = e => { e.preventDefault(); const from=+e.dataTransfer.getData('text/plain'); if(Number.isNaN(from)||from===index)return; const [moved]=library.splice(from,1); library.splice(index,0,moved); queueIndex=0; drawLibrary(); };
    el.append(tile);
  });
  document.querySelector('#itemCount').textContent = `${library.length} item${library.length===1?'':'s'}`;
  syncSelectedSizeEditor();
}

function bodyStyle() { return { restitution:+document.querySelector('#bounce').value/100, friction:+document.querySelector('#friction').value/100, frictionAir:.006, collisionFilter:{category:CAT_PIECE,mask:CAT_CONTAINER|CAT_PIECE}, render:{fillStyle:'#111'} }; }
function starVertices(x,y,r) { return Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r:r*.43;return{x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr}}); }
const FULL_TEXT_RADIUS_START=90;
function textCornerRadius(w,h,value){return Math.min(w,h)*.5*Math.min(1,Math.max(0,value)/FULL_TEXT_RADIUS_START);}
function createTextBody(x,y,w,h,text,radiusValue,opts){
  if(text.length===1&&radiusValue>=100)return Bodies.circle(x,y,Math.min(w,h)/2,{...opts,render:{visible:false}});
  return Bodies.rectangle(x,y,w,h,{...opts,chamfer:{radius:textCornerRadius(w,h,radiusValue)},render:{visible:false}});
}
function spawn(x,y) {
  if (drawing) { customPoints.push([x,y]); drawCustomGuide(); return; }
  const item = library[queueIndex]; if (!item) return;
  const globalScale=+document.querySelector('#globalPieceSize').value/100,itemScale=item.size/100,randomScale=document.querySelector('#randomSize').checked?(+document.querySelector('#randomMin').value+(Math.random()*(+document.querySelector('#randomMax').value-+document.querySelector('#randomMin').value)))/100:1;
  const size = Math.max(7, Math.min(W,H)*.045*globalScale*itemScale*randomScale), opts=bodyStyle(); let body;
  if(item.kind==='text') {
    const {fontSize,w,h}=textGeometry(item.value,size,item.fontId),radiusValue=+document.querySelector('#textRadius').value;
    body=createTextBody(x,y,w,h,item.value,radiusValue,opts);
    body.plugin={drawText:item.value,fontSize,textWidth:w,textHeight:h,fontId:item.fontId,textPhysicsCircle:item.value.length===1&&radiusValue>=100,textPhysicsRadius:radiusValue};
  } else if(item.kind==='image') {
    const aspect=item.width/item.height,maxSide=size*1.8,drawW=aspect>=1?maxSide:maxSide*aspect,drawH=aspect>=1?maxSide/aspect:maxSide,rects=item.alphaRects?.length?item.alphaRects:[{x:0,y:0,w:1,h:1}],parts=rects.map(rect=>Bodies.rectangle(x+(rect.x+rect.w/2-.5)*drawW,y+(rect.y+rect.h/2-.5)*drawH,Math.max(2,rect.w*drawW+1),Math.max(2,rect.h*drawH+1),{...opts,render:{visible:false}}));
    body=Body.create({...opts,parts,render:{visible:false}});body.plugin={drawImage:item.image,drawImageSrc:item.src,drawImageWidth:drawW,drawImageHeight:drawH,drawImageOffset:{x:x-body.position.x,y:y-body.position.y}};
  } else if(item.shape==='circle') body=Bodies.circle(x,y,size*.65,opts);
  else if(item.shape==='triangle') body=Bodies.polygon(x,y,3,size*.82,opts);
  else if(item.shape==='star') body=Bodies.fromVertices(x,y,[starVertices(x,y,size*.85)],opts,true);
  else body=Bodies.rectangle(x,y,size*1.25,size*1.25,opts);
  if(item.kind==='shape')setBodyVectorAppearance(body,item);
  body.plugin={...(body.plugin||{}),inputId:item.id};body.label='piece';fitBodyToContainer(body);
  Composite.add(engine.world,body);refreshOverflowLayers();
  queueIndex = (queueIndex + 1) % library.length;
  document.querySelectorAll('.tile').forEach((tile,index)=>tile.classList.toggle('active',index===queueIndex));
}

function pointInContainer(x,y) {
  const pts=containerPolygon; if(pts.length<3)return false; let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++) { const [xi,yi]=pts[i],[xj,yj]=pts[j]; if(((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) inside=!inside; }
  return inside;
}
function polygonArea(points){let area=0;for(let i=0,j=points.length-1;i<points.length;j=i++)area+=points[j][0]*points[i][1]-points[i][0]*points[j][1];return Math.abs(area)/2;}
function polygonIsConvex(points){if(points.length<4)return true;let sign=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],c=points[(i+2)%points.length],cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cross)<.001)continue;const next=Math.sign(cross);if(sign&&next!==sign)return false;sign=next;}return true;}
function setOverflowState(body,overflow){body.plugin=body.plugin||{};body.plugin.overflow=overflow;body.collisionFilter.category=overflow?CAT_OVERFLOW:CAT_PIECE;body.collisionFilter.mask=CAT_CONTAINER|(overflow?CAT_OVERFLOW:CAT_PIECE);body.render.opacity=1;}
function refreshOverflowLayers(){const bodies=engine.world.bodies.filter(b=>b.label==='piece');if(!bodies.length)return;const enabled=document.querySelector('#overflowBehind')?.checked!==false,limit=Math.max(1,polygonArea(containerPolygon)*FRONT_LAYER_FILL_RATIO),discard=[];let frontUsed=0,backUsed=0;for(const body of bodies){if(!enabled){setOverflowState(body,false);continue;}if(body.plugin?.overflow){if(backUsed+body.area<=limit){backUsed+=body.area;setOverflowState(body,true);}else discard.push(body);continue;}if(frontUsed+body.area<=limit){frontUsed+=body.area;setOverflowState(body,false);}else if(backUsed+body.area<=limit){backUsed+=body.area;setOverflowState(body,true);}else discard.push(body);}discard.forEach(body=>Composite.remove(engine.world,body));const live=bodies.filter(body=>!discard.includes(body)),others=engine.world.bodies.filter(b=>b.label!=='piece'),behind=live.filter(b=>b.plugin?.overflow),front=live.filter(b=>!b.plugin?.overflow);engine.world.bodies.splice(0,engine.world.bodies.length,...others,...behind,...front);}
function resizeContainerPieces(value){if(containerType==='custom'){lastContainerSize=value;rebuildContainer();return;}const ratio=value/lastContainerSize,center={x:W/2,y:H/2};Composite.allBodies(engine.world).filter(b=>b.label==='piece').forEach(body=>{const relative=Vector.sub(body.position,center);Body.setPosition(body,Vector.add(center,Vector.mult(relative,ratio)));Body.setVelocity(body,Vector.mult(body.velocity,Math.min(1,ratio)));});lastContainerSize=value;rebuildContainer();refreshOverflowLayers();containPieces();}

function nearestBoundary(point){let best=null;for(let i=0;i<containerPolygon.length;i++){const a=containerPolygon[i],b=containerPolygon[(i+1)%containerPolygon.length],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/len2)),x=a[0]+t*dx,y=a[1]+t*dy,dist=Math.hypot(point.x-x,point.y-y);if(!best||dist<best.dist){const len=Math.sqrt(len2),n1={x:-dy/len,y:dx/len},inward=pointInContainer(x+n1.x*2,y+n1.y*2)?n1:{x:-n1.x,y:-n1.y};best={x,y,dist,inward};}}return best;}
function bodyRadius(body){return Math.max(4,...body.vertices.map(v=>Math.hypot(v.x-body.position.x,v.y-body.position.y)));}
function fitBodyToContainer(body){if(containerPolygon.length<3)return;const center={x:W/2,y:H/2},nearest=nearestBoundary(center),safeRadius=nearest?.dist||Math.min(W,H)*.25,radius=bodyRadius(body),ratio=Math.min(1,(safeRadius*.78)/radius);if(ratio<1)scaleBody(body,ratio);}
function containPieces(){if(containerPolygon.length<3||drawing)return;const convex=polygonIsConvex(containerPolygon),safeRadius=Math.max(8,(nearestBoundary({x:W/2,y:H/2})?.dist||Math.min(W,H)*.2)*.82);Composite.allBodies(engine.world).filter(b=>b.label==='piece').forEach(body=>{const actualRadius=bodyRadius(body)+3,radius=Math.min(actualRadius,safeRadius);if(convex){let next={x:body.position.x,y:body.position.y},velocity={x:body.velocity.x,y:body.velocity.y},moved=false;for(let pass=0;pass<3;pass++)for(let i=0;i<containerPolygon.length;i++){const a=containerPolygon[i],b=containerPolygon[(i+1)%containerPolygon.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<.001)continue;const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,n1={x:-dy/len,y:dx/len},inward=pointInContainer(mx+n1.x*2,my+n1.y*2)?n1:{x:-n1.x,y:-n1.y},distance=(next.x-mx)*inward.x+(next.y-my)*inward.y;if(distance<radius){const correction=radius-distance;next.x+=inward.x*correction;next.y+=inward.y*correction;moved=true;const vn=velocity.x*inward.x+velocity.y*inward.y;if(vn<0){const bounce=Math.min(.75,body.restitution||0);velocity.x-=inward.x*(1+bounce)*vn;velocity.y-=inward.y*(1+bounce)*vn;}}}if(moved){Body.setPosition(body,next);Body.setVelocity(body,velocity);}}else{const nearest=nearestBoundary(body.position);if(!nearest)return;const inside=pointInContainer(body.position.x,body.position.y);if(!inside||nearest.dist<radius){Body.setPosition(body,{x:nearest.x+nearest.inward.x*radius,y:nearest.y+nearest.inward.y*radius});const vn=Vector.dot(body.velocity,nearest.inward);if(vn<0)Body.setVelocity(body,Vector.sub(body.velocity,Vector.mult(nearest.inward,(1+Math.min(.75,body.restitution||0))*vn)));}}});}

function pos(e) { const r=render.canvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}; }
function stopDropping(){clearTimeout(dropping);dropping=null;dropPosition=null;dropPointerId=null;}
function scheduleHeldDrop(){const rate=Math.max(1,+document.querySelector('#holdDropRate').value);dropping=setTimeout(()=>{if(!dropping)return;if(dropPosition&&(drawing||pointInContainer(dropPosition.x,dropPosition.y)))spawn(dropPosition.x,dropPosition.y);scheduleHeldDrop();},1000/rate);}
render.canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0)return;
  document.querySelector('#emptyHint').classList.add('hidden');
  const p=pos(e);
  if(drawing){spawn(p.x,p.y);return;}
  if(pointInContainer(p.x,p.y)){
    dropPosition=p;dropPointerId=e.pointerId;render.canvas.setPointerCapture?.(e.pointerId);spawn(p.x,p.y);
    scheduleHeldDrop();
  }
});
render.canvas.addEventListener('pointermove',e=>{if(dropping&&e.pointerId===dropPointerId)dropPosition=pos(e);});
window.addEventListener('pointerup',stopDropping);window.addEventListener('pointercancel',stopDropping);

function drawCustomGuide(){ const c=render.context;c.save();c.setTransform(render.options.pixelRatio,0,0,render.options.pixelRatio,0,0);c.strokeStyle='#00b7ff';c.fillStyle='#00b7ff';c.lineWidth=2;c.setLineDash([6,4]);c.beginPath();customPoints.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();customPoints.forEach(p=>{c.beginPath();c.arc(p[0],p[1],4,0,Math.PI*2);c.fill();});c.restore(); }
function traceContainerPath(c){c.beginPath();containerPolygon.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();}
function drawPreviewMatte(c){const step=Math.max(7,Math.round(Math.min(W,H)/72));c.save();c.globalCompositeOperation='destination-over';if(!drawing&&containerPolygon.length>2){c.beginPath();c.rect(0,0,W,H);containerPolygon.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.clip('evenodd');}if(document.querySelector('#previewGrid')?.checked){c.strokeStyle='rgba(17,17,17,.10)';c.lineWidth=.45;c.beginPath();for(let x=0;x<=W;x+=step){c.moveTo(x,0);c.lineTo(x,H);}for(let y=0;y<=H;y+=step){c.moveTo(0,y);c.lineTo(W,y);}c.stroke();}c.fillStyle=paintValue('#outsideColor','#d4d4d0');c.fillRect(0,0,W,H);c.restore();}
function traceRoundedRect(c,x,y,w,h,r){const radius=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+radius,y);c.lineTo(x+w-radius,y);c.quadraticCurveTo(x+w,y,x+w,y+radius);c.lineTo(x+w,y+h-radius);c.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);c.lineTo(x+radius,y+h);c.quadraticCurveTo(x,y+h,x,y+h-radius);c.lineTo(x,y+radius);c.quadraticCurveTo(x,y,x+radius,y);c.closePath();}
function traceTextBackground(c,w,h,text,radiusValue){
  const value=Math.max(0,Math.min(100,radiusValue));
  if(text.length===1&&value>=FULL_TEXT_RADIUS_START){
    const r=Math.min(w,h)/2;
    if(value>=100){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.closePath();return;}
    const t=(value-FULL_TEXT_RADIUS_START)/(100-FULL_TEXT_RADIUS_START),circleK=.5522847498307936,k=(2/3)+(circleK-(2/3))*t;
    c.beginPath();c.moveTo(0,-r);c.bezierCurveTo(k*r,-r,r,-k*r,r,0);c.bezierCurveTo(r,k*r,k*r,r,0,r);c.bezierCurveTo(-k*r,r,-r,k*r,-r,0);c.bezierCurveTo(-r,-k*r,-k*r,-r,0,-r);c.closePath();return;
  }
  traceRoundedRect(c,-w/2,-h/2,w,h,textCornerRadius(w,h,value));
}
let renderClipActive=false;
Events.on(render,'beforeRender',()=>{const c=render.context;c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.clearRect(0,0,render.canvas.width,render.canvas.height);c.restore();if(!drawing&&containerPolygon.length>2){c.save();c.setTransform(render.options.pixelRatio,0,0,render.options.pixelRatio,0,0);traceContainerPath(c);c.clip();renderClipActive=true;}});
Events.on(render,'afterRender',()=>{
  const c=render.context, pr=render.options.pixelRatio;c.save();c.setTransform(pr,0,0,pr,0,0);
  Composite.allBodies(engine.world).forEach(b=>{if(b.plugin?.drawImage){c.save();c.globalAlpha=1;c.translate(b.position.x,b.position.y);c.rotate(b.angle);c.drawImage(b.plugin.drawImage,b.plugin.drawImageOffset.x-b.plugin.drawImageWidth/2,b.plugin.drawImageOffset.y-b.plugin.drawImageHeight/2,b.plugin.drawImageWidth,b.plugin.drawImageHeight);c.restore();}if(b.plugin?.drawText){const w=b.plugin.textWidth,h=b.plugin.textHeight,radiusValue=+document.querySelector('#textRadius').value,sourceItem=library.find(item=>item.id===b.plugin.inputId),textPaint=itemEffectivePaint(sourceItem),borderWidth=+document.querySelector('#textBorderThickness').value,textStroke=textVectorStrokeAppearance(),textY=textOpticalOffset(b.plugin.fontSize);c.save();c.globalAlpha=1;c.translate(b.position.x,b.position.y);c.rotate(b.angle);traceTextBackground(c,w,h,b.plugin.drawText,radiusValue);c.fillStyle=paintValue('#textBackgroundColor','#ffffff');c.fill();if(borderWidth>0){c.strokeStyle=paintValue('#textBorderColor','#111111');c.lineWidth=borderWidth;c.stroke();}c.fillStyle=textPaint;c.textAlign='center';c.textBaseline='middle';c.font=fontCss(b.plugin.fontSize,b.plugin.fontId);if(textStroke.enabled){c.strokeStyle=textStroke.paint;c.lineWidth=textStroke.thickness;c.lineJoin='round';c.miterLimit=2;c.strokeText(b.plugin.drawText,0,textY);}c.fillText(b.plugin.drawText,0,textY);c.restore();}});
  c.restore();if(renderClipActive){c.save();c.setTransform(pr,0,0,pr,0,0);c.globalCompositeOperation='destination-over';traceContainerPath(c);c.fillStyle=paintValue('#containerColor','#ffffff');c.fill();c.restore();c.restore();renderClipActive=false;}c.save();c.setTransform(pr,0,0,pr,0,0);drawPreviewMatte(c);c.restore();c.save();c.setTransform(pr,0,0,pr,0,0);if(!drawing&&document.querySelector('#showBoundary').checked&&containerPolygon.length>2){traceContainerPath(c);c.strokeStyle='#111';c.lineWidth=+document.querySelector('#outlineThickness').value;c.lineJoin='round';c.stroke();}c.restore();if(drawing)drawCustomGuide();
  if(recordCanvas&&recordContext)drawVisibleRenderToCanvas(recordContext,recordCanvas);
});

Events.on(engine,'beforeUpdate',ev=>{
  const dt=ev.delta/1000;
  if(document.querySelector('#autoRotate').checked && containerBodies.length){
    const speed=+document.querySelector('#rotationSpeed').value*Math.PI/180; containerAngle+=speed*dt;
    const center={x:W/2,y:H/2}; containerBodies.forEach(w=>{const rel=Vector.sub(w.position,center), next=Vector.rotate(rel,speed*dt);Body.setPosition(w,Vector.add(center,next));Body.setAngle(w,w.angle+speed*dt);});
    containerPolygon = containerPolygon.map(p=>{const next=Vector.rotate({x:p[0]-center.x,y:p[1]-center.y},speed*dt);return[center.x+next.x,center.y+next.y]});
  }
  const pull=+document.querySelector('#attraction').value/100;
  if(pull){const bodies=Composite.allBodies(engine.world).filter(b=>b.label==='piece');for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){const d=Vector.sub(bodies[j].position,bodies[i].position),distance=Math.max(20,Vector.magnitude(d)),falloff=Math.min(1,160/distance),magnitude=pull*0.00006*Math.min(bodies[i].mass,bodies[j].mass)*falloff,f=Vector.mult(Vector.normalise(d),magnitude);Body.applyForce(bodies[i],bodies[i].position,f);Body.applyForce(bodies[j],bodies[j].position,Vector.neg(f));}}
});
Events.on(engine,'afterUpdate',containPieces);

const mouse=Mouse.create(render.canvas), mouseConstraint=MouseConstraint.create(engine,{mouse,constraint:{stiffness:.18,render:{visible:false}}});
Composite.add(engine.world,mouseConstraint); render.mouse=mouse;
function setPreviewPixelRatio(value){const next=Math.max(1,Math.min(3,value)),targetW=Math.round(W*next),targetH=Math.round(H*next);if(Math.abs(previewPixelRatio-next)<.001&&render.canvas.width===targetW&&render.canvas.height===targetH)return;Render.setPixelRatio(render,next);render.canvas.style.width=`${previewDisplayW}px`;render.canvas.style.height=`${previewDisplayH}px`;previewPixelRatio=next;}
function updatePreviewResolution(){const required=Math.max(1,previewZoom*previewDisplayW/W,previewZoom*previewDisplayH/H);setPreviewPixelRatio(required);}
function setPreviewZoom(value){previewZoom=Math.max(.5,Math.min(3,value));render.canvas.style.transform=`scale(${previewZoom})`;Mouse.setScale(mouse,{x:1/previewZoom,y:1/previewZoom});document.querySelector('#zoomLevel').textContent=`ZOOM ${Math.round(previewZoom*100)}%`;updatePreviewResolution();}
function visiblePreviewRect(){const zoom=Math.max(1,previewZoom),width=W/zoom,height=H/zoom;return{x:(W-width)/2,y:(H-height)/2,width,height,zoom};}
function drawVisibleRenderToCanvas(context,canvas){const view=visiblePreviewRect(),scaleX=render.canvas.width/W,scaleY=render.canvas.height/H;context.clearRect(0,0,canvas.width,canvas.height);context.drawImage(render.canvas,view.x*scaleX,view.y*scaleY,view.width*scaleX,view.height*scaleY,0,0,canvas.width,canvas.height);}
stage.addEventListener('wheel',event=>{if(event.target.closest('.stage-tools'))return;event.preventDefault();setPreviewZoom(previewZoom*Math.exp(-event.deltaY*.0012));},{passive:false});

document.querySelector('#addText').onclick=()=>{const v=document.querySelector('#textInput').value.trim();if(v)addLibrary({kind:'text',value:v,preview:v,fontId:selectedFontId,color:colorValue('#textColor','#111111')});};
document.querySelectorAll('[data-add-shape]').forEach(b=>b.onclick=()=>addLibrary({kind:'shape',shape:b.dataset.addShape,preview:b.textContent,color:colorValue('#vectorColor','#111111')}));
function extractAlphaRects(img){const maxGrid=36,aspect=img.naturalWidth/img.naturalHeight,gridW=Math.max(4,Math.round(aspect>=1?maxGrid:maxGrid*aspect)),gridH=Math.max(4,Math.round(aspect>=1?maxGrid/aspect:maxGrid)),canvas=document.createElement('canvas');canvas.width=gridW;canvas.height=gridH;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,gridW,gridH);ctx.drawImage(img,0,0,gridW,gridH);const alpha=ctx.getImageData(0,0,gridW,gridH).data,finished=[],active=new Map();for(let y=0;y<gridH;y++){const runs=[];let start=-1;for(let x=0;x<=gridW;x++){const opaque=x<gridW&&alpha[(y*gridW+x)*4+3]>24;if(opaque&&start<0)start=x;if((!opaque||x===gridW)&&start>=0){runs.push([start,x]);start=-1;}}const keys=new Set(runs.map(run=>`${run[0]}-${run[1]}`));for(const [key,rect] of active)if(!keys.has(key)){finished.push(rect);active.delete(key);}for(const [x0,x1] of runs){const key=`${x0}-${x1}`;if(active.has(key))active.get(key).y1=y+1;else active.set(key,{x0,x1,y0:y,y1:y+1});}}finished.push(...active.values());return finished.map(rect=>({x:rect.x0/gridW,y:rect.y0/gridH,w:(rect.x1-rect.x0)/gridW,h:(rect.y1-rect.y0)/gridH}));}
document.querySelector('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.type==='image/svg+xml'||f.name.toLowerCase().endsWith('.svg')){const svgSource=await f.text(),color=colorValue('#vectorColor','#111111'),opacity=opacityValue('#vectorColor'),stroke=vectorStrokeAppearance(),src=svgDataUrl(colorizedSvgSource(svgSource,color,opacity,stroke)),physicsSrc=svgDataUrl(colorizedSvgSource(svgSource,color,100,{...stroke,opacity:100})),[image,physicsImage]=await Promise.all([loadProjectImage(src),loadProjectImage(physicsSrc)]);addLibrary({kind:'image',svgSource,color,opacity,src,image,width:image.naturalWidth,height:image.naturalHeight,alphaRects:extractAlphaRects(physicsImage),preview:''});}else{const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(f);}),image=await loadProjectImage(src);addLibrary({kind:'image',src,image,width:image.naturalWidth,height:image.naturalHeight,alphaRects:extractAlphaRects(image),preview:''});}}catch(error){console.warn('Input image could not be loaded',error);}finally{e.target.value='';}};
const PROJECT_FORMAT='graphicsGravity',PROJECT_VERSION=1;
const projectSettingIds=['outsideColor','outsideOpacity','previewGrid','containerColor','containerOpacity','textColor','textOpacity','textBackgroundColor','textBackgroundOpacity','textBorderColor','textBorderOpacity','vectorColor','vectorOpacity','vectorStrokeEnabled','vectorStrokeColor','vectorStrokeOpacity','vectorStrokeThickness','textVectorStrokeEnabled','textVectorStrokeColor','textVectorStrokeOpacity','textVectorStrokeThickness','textBorderThickness','textRadius','holdDropRate','globalPieceSize','applySelectedToPlaced','randomSize','randomMin','randomMax','containerSize','containerSides','rectLongSide','rectShortSide','outlineThickness','showBoundary','autoRotate','rotationSpeed','gravity','bounce','friction','attraction','overflowBehind'];
let webProjectHandle=null;
function savedSettings(){return Object.fromEntries(projectSettingIds.map(id=>{const el=document.querySelector(`#${id}`);return[id,el.type==='checkbox'?el.checked:el.value]}));}
function savedLibrary(){return library.map(item=>{const {image,_colorVersion,...data}=item;return data;});}
function savedFonts(){return{selectedId:selectedFontId,custom:customFonts.map(({id,label,family,style,dataUrl,fileName})=>({id,label,family,style,dataUrl,fileName}))};}
function savedBody(body){
  const base={inputId:body.plugin?.inputId,overflow:!!body.plugin?.overflow,position:{x:body.position.x,y:body.position.y},angle:body.angle,velocity:{x:body.velocity.x,y:body.velocity.y},angularVelocity:body.angularVelocity,restitution:body.restitution,friction:body.friction,frictionStatic:body.frictionStatic,frictionAir:body.frictionAir,density:body.density,slop:body.slop,fillStyle:body.render?.fillStyle};
  if(body.plugin?.drawText)return{...base,kind:'text',text:body.plugin.drawText,fontSize:body.plugin.fontSize,textWidth:body.plugin.textWidth,textHeight:body.plugin.textHeight,fontId:body.plugin.fontId,textPhysicsRadius:body.plugin.textPhysicsRadius};
  if(body.plugin?.drawImage)return{...base,kind:'image',drawImageSrc:body.plugin.drawImageSrc||body.plugin.drawImage?.src,drawImageWidth:body.plugin.drawImageWidth,drawImageHeight:body.plugin.drawImageHeight,drawImageOffset:{...body.plugin.drawImageOffset}};
  const parts=(body.parts?.length>1?body.parts.slice(1):[body]).map(part=>part.vertices.map(vertex=>{const local=Vector.rotate(Vector.sub(vertex,body.position),-body.angle);return{x:local.x,y:local.y}}));
  return{...base,kind:'shape',circleRadius:body.circleRadius||0,parts};
}
function projectSnapshot(){return{format:PROJECT_FORMAT,version:PROJECT_VERSION,savedAt:new Date().toISOString(),canvas:{width:W,height:H},frameMode,paused,textInput:document.querySelector('#textInput').value,fonts:savedFonts(),settings:savedSettings(),container:{type:containerType,angle:containerAngle,customPoints:customPoints.map(point=>[...point]),drawing},library:savedLibrary(),queueIndex,selectedInputId,itemId,bodies:engine.world.bodies.filter(body=>body.label==='piece').map(savedBody)};}
function loadProjectImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('project image could not be loaded'));image.src=src;});}
async function hydratedLibrary(items,settings={}){return Promise.all((items||[]).map(async item=>{const vector=itemIsVector(item),copy={...item};if(copy.kind==='text'&&!copy.fontId)copy.fontId='space-mono';if(vector){copy.color=normalizedHexColor(copy.color)||normalizedHexColor(copy.kind==='text'?settings.textColor:settings.vectorColor)||'#111111';copy.opacity=Number.isFinite(+copy.opacity)?clampOpacity(copy.opacity):clampOpacity(copy.kind==='text'?settings.textOpacity:settings.vectorOpacity);}if(copy.kind!=='image')return copy;const stroke=vectorStrokeAppearance(settings),src=copy.svgSource?svgDataUrl(colorizedSvgSource(copy.svgSource,copy.color,copy.opacity,stroke)):copy.src,image=await loadProjectImage(src);let alphaRects=copy.alphaRects;if(copy.svgSource&&!alphaRects?.length){const physicsSrc=svgDataUrl(colorizedSvgSource(copy.svgSource,copy.color,100,{...stroke,opacity:100})),physicsImage=await loadProjectImage(physicsSrc);alphaRects=extractAlphaRects(physicsImage);}return{...copy,src,image,width:copy.width||image.naturalWidth,height:copy.height||image.naturalHeight,alphaRects:alphaRects?.length?alphaRects:extractAlphaRects(image)};}));}
async function restoreFontState(state={}){customFonts.splice(0,customFonts.length);for(const record of state.custom||[]){try{await addCustomFontRecord(record);}catch(error){console.warn('Saved custom font could not be restored',error);}}selectedFontId=[...BUILTIN_FONTS,...customFonts].some(font=>font.id===state.selectedId)?state.selectedId:'space-mono';renderFontOptions();}
function restoreControlOutputs(){
  const value=id=>+document.querySelector(`#${id}`).value,text=(id,content)=>document.querySelector(`#${id}`).textContent=content;
  text('globalSizeOut',`${value('globalPieceSize')}%`);text('randomMinOut',`${value('randomMin')}%`);text('randomMaxOut',`${value('randomMax')}%`);text('sizeOut',`${value('containerSize')}%`);text('sidesOut',String(value('containerSides')));text('rectLongOut',`${value('rectLongSide')}%`);text('rectShortOut',`${value('rectShortSide')}%`);text('thicknessOut',`${value('outlineThickness')} px`);text('vectorStrokeOut',`${value('vectorStrokeThickness')} px`);text('textVectorStrokeOut',`${value('textVectorStrokeThickness')} px`);text('textBorderOut',`${value('textBorderThickness')} px`);text('textRadiusOut',`${value('textRadius')}%`);text('holdDropOut',`${value('holdDropRate')} / sec`);text('rotationOut',`${value('rotationSpeed')} deg/s`);text('gravityOut',(value('gravity')/100).toFixed(2));text('bounceOut',(value('bounce')/100).toFixed(2));text('frictionOut',(value('friction')/100).toFixed(2));text('attractOut',(value('attraction')/100).toFixed(2));
  lastGlobalSize=value('globalPieceSize')/100;lastContainerSize=value('containerSize');engine.gravity.scale=.001*value('gravity')/100;render.options.background='transparent';syncHexColorFields();syncVectorStrokeControls();syncTextVectorStrokeControls();syncPreviewGrid();
}
function restoreFrame(mode){frameMode=['free','square','vertical'].includes(mode)?mode:'free';stage.classList.toggle('frame-free',frameMode==='free');stage.classList.toggle('frame-square',frameMode==='square');stage.classList.toggle('frame-vertical',frameMode==='vertical');document.querySelectorAll('[data-frame]').forEach(button=>button.classList.toggle('active',button.dataset.frame===frameMode));document.querySelector('#frameResolution').textContent=framePresets[frameMode]?.label||'';resize();}
function restoredBody(snapshot,sx,sy,uniform){
  const position={x:snapshot.position.x*sx,y:snapshot.position.y*sy},opts={...bodyStyle(),restitution:snapshot.restitution,friction:snapshot.friction,frictionStatic:snapshot.frictionStatic,frictionAir:snapshot.frictionAir,density:snapshot.density,slop:snapshot.slop,render:{fillStyle:snapshot.fillStyle||'#111111'}},item=library.find(entry=>entry.id===snapshot.inputId);let body;
  if(snapshot.kind==='text'){const w=snapshot.textWidth*uniform,h=snapshot.textHeight*uniform,fontId=snapshot.fontId||item?.fontId||'space-mono';body=createTextBody(position.x,position.y,w,h,snapshot.text,snapshot.textPhysicsRadius,opts);body.plugin={drawText:snapshot.text,fontSize:snapshot.fontSize*uniform,textWidth:w,textHeight:h,fontId,textPhysicsCircle:snapshot.text.length===1&&snapshot.textPhysicsRadius>=100,textPhysicsRadius:snapshot.textPhysicsRadius};}
  else if(snapshot.kind==='image'&&item?.image){const drawW=snapshot.drawImageWidth*uniform,drawH=snapshot.drawImageHeight*uniform,offset={x:snapshot.drawImageOffset.x*uniform,y:snapshot.drawImageOffset.y*uniform},center={x:position.x+offset.x,y:position.y+offset.y},rects=item.alphaRects?.length?item.alphaRects:[{x:0,y:0,w:1,h:1}],parts=rects.map(rect=>Bodies.rectangle(center.x+(rect.x+rect.w/2-.5)*drawW,center.y+(rect.y+rect.h/2-.5)*drawH,Math.max(2,rect.w*drawW+1),Math.max(2,rect.h*drawH+1),{...opts,render:{visible:false}}));body=Body.create({...opts,parts,render:{visible:false}});Body.setPosition(body,position);body.plugin={drawImage:item.image,drawImageSrc:item.src,drawImageWidth:drawW,drawImageHeight:drawH,drawImageOffset:offset};}
  else if(snapshot.circleRadius)body=Bodies.circle(position.x,position.y,snapshot.circleRadius*uniform,opts);
  else {const sets=(snapshot.parts||[]).map(part=>part.map(vertex=>({x:vertex.x*uniform,y:vertex.y*uniform})));if(!sets.length)return null;body=Bodies.fromVertices(position.x,position.y,sets,opts,true);}
  body.label='piece';body.plugin={...(body.plugin||{}),inputId:snapshot.inputId,overflow:snapshot.overflow};if(item?.kind==='shape')setBodyVectorAppearance(body,item);Body.setAngle(body,snapshot.angle);Body.setVelocity(body,{x:snapshot.velocity.x*uniform,y:snapshot.velocity.y*uniform});Body.setAngularVelocity(body,snapshot.angularVelocity);setOverflowState(body,snapshot.overflow);return body;
}
async function restoreProject(project){
  if(project?.format!==PROJECT_FORMAT||project.version>PROJECT_VERSION)throw new Error('unsupported Graphics Gravity project');
  document.querySelector('#emptyHint').classList.add('hidden');
  await restoreFontState(project.fonts||{});const items=await hydratedLibrary(project.library,project.settings||{});stopDropping();if(mediaRecorder?.state==='recording')stopRecording();engine.world.bodies.filter(body=>body.label==='piece').forEach(body=>Composite.remove(engine.world,body));
  library.splice(0,library.length,...items);itemId=project.itemId??Math.max(0,...items.map(item=>item.id||0));queueIndex=Math.min(Math.max(0,project.queueIndex||0),Math.max(0,items.length-1));selectedInputId=items.some(item=>item.id===project.selectedInputId)?project.selectedInputId:items[0]?.id??null;document.querySelector('#textInput').value=project.textInput||'';
  const incomingSettings={...(project.settings||{})};if(!Object.hasOwn(incomingSettings,'previewGrid')){incomingSettings.previewGrid=false;if(String(incomingSettings.outsideColor).toLowerCase()==='#000000')incomingSettings.outsideColor='#d4d4d0';}if(!Object.hasOwn(incomingSettings,'vectorColor'))incomingSettings.vectorColor='#111111';['outsideOpacity','containerOpacity','textOpacity','textBackgroundOpacity','textBorderOpacity','vectorOpacity','vectorStrokeOpacity','textVectorStrokeOpacity'].forEach(id=>{if(!Object.hasOwn(incomingSettings,id))incomingSettings[id]=100;});if(!Object.hasOwn(incomingSettings,'vectorStrokeEnabled'))incomingSettings.vectorStrokeEnabled=false;if(!Object.hasOwn(incomingSettings,'vectorStrokeColor'))incomingSettings.vectorStrokeColor='#111111';if(!Object.hasOwn(incomingSettings,'vectorStrokeThickness'))incomingSettings.vectorStrokeThickness=2;if(!Object.hasOwn(incomingSettings,'textVectorStrokeEnabled'))incomingSettings.textVectorStrokeEnabled=false;if(!Object.hasOwn(incomingSettings,'textVectorStrokeColor'))incomingSettings.textVectorStrokeColor='#111111';if(!Object.hasOwn(incomingSettings,'textVectorStrokeThickness'))incomingSettings.textVectorStrokeThickness=2;Object.entries(incomingSettings).forEach(([id,saved])=>{const el=document.querySelector(`#${id}`);if(!el)return;if(el.type==='checkbox')el.checked=!!saved;else el.value=saved;});restoreControlOutputs();
  containerType=['circle','square','triangle','custom'].includes(project.container?.type)?project.container.type:'circle';containerAngle=0;customPoints=[];drawing=false;selectContainerButton(containerType);syncRectangleControls();restoreFrame(project.frameMode);
  const savedW=project.canvas?.width||W,savedH=project.canvas?.height||H,sx=W/savedW,sy=H/savedH,uniform=Math.min(sx,sy);customPoints=(project.container?.customPoints||[]).map(point=>[point[0]*sx,point[1]*sy]);containerAngle=+project.container?.angle||0;drawing=!!project.container?.drawing;stage.classList.toggle('drawing',drawing);document.querySelector('#drawActions').classList.toggle('visible',drawing);document.querySelector('#containerLabel').textContent=containerType==='circle'&&+document.querySelector('#containerSides').value!==24?`${document.querySelector('#containerSides').value} sides`:containerType;if(drawing){Composite.remove(engine.world,containerBodies);containerBodies=[];containerPolygon=[];freezePiecesForCustomDraw(true);}else rebuildContainer();
  drawLibrary();for(const snapshot of project.bodies||[]){const body=restoredBody(snapshot,sx,sy,uniform);if(body)Composite.add(engine.world,body);}if(drawing)freezePiecesForCustomDraw(true);refreshOverflowLayers();containPieces();const wasPaused=paused,shouldPause=!!project.paused;if(shouldPause&&!wasPaused)Runner.stop(runner);else if(!shouldPause&&wasPaused)Runner.run(runner,engine);paused=shouldPause;document.querySelector('#pauseBtn').textContent=paused?'play':'pause';
}
function projectButtonFeedback(id,label){const button=document.querySelector(id),original=button.dataset.defaultLabel||button.textContent;button.dataset.defaultLabel=original;button.textContent=label;setTimeout(()=>button.textContent=button.dataset.defaultLabel,1200);}
async function saveProjectFile(){
  const content=JSON.stringify(projectSnapshot(),null,2);try{if(window.graphicsGravityFile){const result=await window.graphicsGravityFile.save(content);if(!result?.canceled)projectButtonFeedback('#saveProjectBtn','saved');return;}if(window.showSaveFilePicker){webProjectHandle=webProjectHandle||await window.showSaveFilePicker({suggestedName:'graphics-gravity-project.graphicsGravity',types:[{description:'Graphics Gravity Project',accept:{'application/json':['.graphicsgravity']}}]});const writable=await webProjectHandle.createWritable();await writable.write(content);await writable.close();projectButtonFeedback('#saveProjectBtn','saved');return;}downloadBlob(new Blob([content],{type:'application/json;charset=utf-8'}),'graphics-gravity-project.graphicsGravity');projectButtonFeedback('#saveProjectBtn','saved');}catch(error){if(error?.name!=='AbortError')projectButtonFeedback('#saveProjectBtn','error');}
}
async function openProjectFile(){try{if(window.graphicsGravityFile){const result=await window.graphicsGravityFile.open();if(!result?.canceled){await restoreProject(JSON.parse(result.content));projectButtonFeedback('#openProjectBtn','opened');}return;}if(window.showOpenFilePicker){const [handle]=await window.showOpenFilePicker({multiple:false,types:[{description:'Graphics Gravity Project',accept:{'application/json':['.graphicsgravity']}}]});webProjectHandle=handle;const file=await handle.getFile();await restoreProject(JSON.parse(await file.text()));projectButtonFeedback('#openProjectBtn','opened');return;}document.querySelector('#projectFileInput').click();}catch(error){if(error?.name!=='AbortError')projectButtonFeedback('#openProjectBtn','invalid');}}
document.querySelector('#saveProjectBtn').onclick=saveProjectFile;document.querySelector('#openProjectBtn').onclick=openProjectFile;
document.querySelector('#projectFileInput').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{await restoreProject(JSON.parse(await file.text()));projectButtonFeedback('#openProjectBtn','opened');}catch{projectButtonFeedback('#openProjectBtn','invalid');}event.target.value='';};
window.graphicsGravityFile?.onLoad?.(async payload=>{try{await restoreProject(JSON.parse(payload.content));projectButtonFeedback('#openProjectBtn','opened');}catch{projectButtonFeedback('#openProjectBtn','invalid');}});
window.addEventListener('dragover',event=>{if([...event.dataTransfer.items].some(item=>item.kind==='file'))event.preventDefault();});
window.addEventListener('drop',async event=>{const file=[...event.dataTransfer.files].find(entry=>entry.name.toLowerCase().endsWith('.graphicsgravity'));if(!file)return;event.preventDefault();try{await restoreProject(JSON.parse(await file.text()));projectButtonFeedback('#openProjectBtn','opened');}catch{projectButtonFeedback('#openProjectBtn','invalid');}});
window.addEventListener('keydown',event=>{if(!(event.ctrlKey||event.metaKey))return;if(event.key.toLowerCase()==='s'){event.preventDefault();saveProjectFile();}if(event.key.toLowerCase()==='o'){event.preventDefault();openProjectFile();}});
function selectContainerButton(type){document.querySelectorAll('[data-container]').forEach(x=>x.classList.toggle('active',x.dataset.container===type));}
function syncRectangleControls(){document.querySelector('#rectangleControls').classList.toggle('visible',containerType==='square');}
function freezePiecesForCustomDraw(frozen){Composite.allBodies(engine.world).filter(body=>body.label==='piece').forEach(body=>{if(body.isStatic!==frozen)Body.setStatic(body,frozen);});}
function cleanCustomPoints(points){const minDistance=Math.max(5,Math.min(W,H)*.006),clean=[];for(const point of points){const previous=clean.at(-1);if(!previous||Math.hypot(point[0]-previous[0],point[1]-previous[1])>=minDistance)clean.push(point);}if(clean.length>2&&Math.hypot(clean[0][0]-clean.at(-1)[0],clean[0][1]-clean.at(-1)[1])<minDistance)clean.pop();return clean;}
function setContainer(type){containerType=type;containerAngle=0;selectContainerButton(type);syncRectangleControls();document.querySelector('#containerLabel').textContent=type;if(type==='triangle')document.querySelector('#containerSides').value=3;if(type==='square')document.querySelector('#containerSides').value=4;if(type==='circle'&&+document.querySelector('#containerSides').value<5)document.querySelector('#containerSides').value=24;document.querySelector('#sidesOut').textContent=document.querySelector('#containerSides').value;if(type==='custom'){drawing=true;customPoints=[];freezePiecesForCustomDraw(true);stage.classList.add('drawing');document.querySelector('#drawActions').classList.add('visible');Composite.remove(engine.world,containerBodies);containerBodies=[];containerPolygon=[];}else{drawing=false;freezePiecesForCustomDraw(false);stage.classList.remove('drawing');document.querySelector('#drawActions').classList.remove('visible');rebuildContainer();}}
document.querySelectorAll('[data-container]').forEach(b=>b.onclick=()=>setContainer(b.dataset.container));
document.querySelector('#finishDraw').onclick=()=>{const cleaned=cleanCustomPoints(customPoints);if(cleaned.length<3||polygonArea(cleaned)<Math.min(W,H)*Math.min(W,H)*.01)return;customPoints=cleaned;drawing=false;freezePiecesForCustomDraw(false);stage.classList.remove('drawing');document.querySelector('#drawActions').classList.remove('visible');rebuildContainer();};
document.querySelector('#cancelDraw').onclick=()=>document.querySelector('[data-container="circle"]').click();
function bindRange(id,out,format,fn){const el=document.querySelector(id);el.oninput=()=>{document.querySelector(out).textContent=format(+el.value);fn?.(+el.value);};}
bindRange('#containerSize','#sizeOut',v=>`${v}%`,resizeContainerPieces);
bindRange('#containerSides','#sidesOut',v=>String(v),v=>{if(v===3){containerType='triangle';selectContainerButton('triangle');document.querySelector('#containerLabel').textContent='triangle';}else if(v===4){containerType='square';selectContainerButton('square');document.querySelector('#containerLabel').textContent='square';}else{containerType='circle';selectContainerButton('circle');document.querySelector('#containerLabel').textContent=`${v} sides`;}syncRectangleControls();rebuildContainer();});
bindRange('#rectLongSide','#rectLongOut',v=>`${v}%`,v=>{const short=document.querySelector('#rectShortSide');if(v<+short.value){short.value=v;document.querySelector('#rectShortOut').textContent=`${v}%`;}rebuildContainer();});
bindRange('#rectShortSide','#rectShortOut',v=>`${v}%`,v=>{const long=document.querySelector('#rectLongSide');if(v>+long.value){long.value=v;document.querySelector('#rectLongOut').textContent=`${v}%`;}rebuildContainer();});
bindRange('#outlineThickness','#thicknessOut',v=>`${v} px`,rebuildContainer);
function updatePieces(values){Composite.allBodies(engine.world).filter(b=>b.label==='piece').forEach(b=>Body.set(b,values));}
function scaleBody(body,ratio){if(!Number.isFinite(ratio)||ratio<=0||Math.abs(ratio-1)<.0001)return;Body.scale(body,ratio,ratio);if(body.plugin?.drawText){body.plugin.fontSize*=ratio;body.plugin.textWidth*=ratio;body.plugin.textHeight*=ratio;}if(body.plugin?.drawImage){body.plugin.drawImageWidth*=ratio;body.plugin.drawImageHeight*=ratio;body.plugin.drawImageOffset.x*=ratio;body.plugin.drawImageOffset.y*=ratio;}if(body.render?.sprite?.texture){body.render.sprite.xScale*=ratio;body.render.sprite.yScale*=ratio;}}
function scalePieces(filter,ratio){Composite.allBodies(engine.world).filter(b=>b.label==='piece'&&(!filter||filter(b))).forEach(b=>scaleBody(b,ratio));}
function syncTextPhysicsGeometry(radiusValue){
  Composite.allBodies(engine.world).filter(body=>body.label==='piece'&&body.plugin?.drawText).forEach(body=>{
    if(body.plugin.textPhysicsRadius===radiusValue)return;
    const opts={angle:body.angle,restitution:body.restitution,friction:body.friction,frictionStatic:body.frictionStatic,frictionAir:body.frictionAir,density:body.density,slop:body.slop,collisionFilter:{...body.collisionFilter},render:{visible:false}},plugin={...body.plugin,textPhysicsCircle:body.plugin.drawText.length===1&&radiusValue>=100,textPhysicsRadius:radiusValue};
    const replacement=createTextBody(body.position.x,body.position.y,plugin.textWidth,plugin.textHeight,plugin.drawText,radiusValue,opts);
    replacement.plugin=plugin;replacement.label='piece';Body.setVelocity(replacement,{x:body.velocity.x,y:body.velocity.y});Body.setAngularVelocity(replacement,body.angularVelocity);fitBodyToContainer(replacement);Composite.remove(engine.world,body);Composite.add(engine.world,replacement);
  });
}
bindRange('#globalPieceSize','#globalSizeOut',v=>`${v}%`,v=>{const next=v/100;scalePieces(null,next/lastGlobalSize);lastGlobalSize=next;});
bindRange('#selectedPieceSize','#selectedSizeOut',v=>`${v}%`,v=>{const item=selectedItem();if(!item)return;const ratio=v/item.size;item.size=v;if(document.querySelector('#applySelectedToPlaced').checked)scalePieces(b=>b.plugin?.inputId===item.id,ratio);});
document.querySelector('#resetSelectedSize').onclick=()=>{const item=selectedItem();if(!item)return;const ratio=100/item.size;item.size=100;if(document.querySelector('#applySelectedToPlaced').checked)scalePieces(b=>b.plugin?.inputId===item.id,ratio);syncSelectedSizeEditor();};
bindRange('#randomMin','#randomMinOut',v=>`${v}%`,v=>{const max=document.querySelector('#randomMax');if(v>+max.value){max.value=v;document.querySelector('#randomMaxOut').textContent=`${v}%`;}});
bindRange('#randomMax','#randomMaxOut',v=>`${v}%`,v=>{const min=document.querySelector('#randomMin');if(v<+min.value){min.value=v;document.querySelector('#randomMinOut').textContent=`${v}%`;}});
document.querySelector('#resetRandomSize').onclick=()=>{document.querySelector('#randomMin').value=100;document.querySelector('#randomMax').value=100;document.querySelector('#randomMinOut').textContent='100%';document.querySelector('#randomMaxOut').textContent='100%';};
function syncVectorStrokeControls(){const enabled=document.querySelector('#vectorStrokeEnabled').checked,colorControl=document.querySelector('#vectorStrokeColorControl'),colorInput=document.querySelector('#vectorStrokeColor'),hex=hexColorFields.get(colorInput),opacity=opacityFields.get(colorInput),thicknessControl=document.querySelector('#vectorStrokeThicknessControl'),thickness=document.querySelector('#vectorStrokeThickness');colorControl.classList.toggle('disabled',!enabled);thicknessControl.classList.toggle('disabled',!enabled);colorInput.disabled=!enabled;if(hex)hex.disabled=!enabled;if(opacity)opacity.range.disabled=!enabled;thickness.disabled=!enabled;}
function syncTextVectorStrokeControls(){const enabled=document.querySelector('#textVectorStrokeEnabled').checked,colorControl=document.querySelector('#textVectorStrokeColorControl'),colorInput=document.querySelector('#textVectorStrokeColor'),hex=hexColorFields.get(colorInput),opacity=opacityFields.get(colorInput),thicknessControl=document.querySelector('#textVectorStrokeThicknessControl'),thickness=document.querySelector('#textVectorStrokeThickness');colorControl.classList.toggle('disabled',!enabled);thicknessControl.classList.toggle('disabled',!enabled);colorInput.disabled=!enabled;if(hex)hex.disabled=!enabled;if(opacity)opacity.range.disabled=!enabled;thickness.disabled=!enabled;}
function bindOpacity(colorId,handler){const input=document.querySelector(colorId),field=opacityFields.get(input);if(field)field.range.oninput=()=>handler?.(+field.range.value);}
bindRange('#textBorderThickness','#textBorderOut',v=>`${v} px`);
bindRange('#vectorStrokeThickness','#vectorStrokeOut',v=>`${v} px`,refreshAllVectorAppearance);
bindRange('#textVectorStrokeThickness','#textVectorStrokeOut',v=>`${v} px`,drawLibrary);
bindRange('#textRadius','#textRadiusOut',v=>`${v}%`);document.querySelector('#textRadius').onchange=e=>syncTextPhysicsGeometry(+e.target.value);
bindRange('#holdDropRate','#holdDropOut',v=>`${v} / sec`);
bindRange('#rotationSpeed','#rotationOut',v=>`${v} deg/s`);bindRange('#gravity','#gravityOut',v=>(v/100).toFixed(2),v=>engine.gravity.scale=.001*v/100);bindRange('#bounce','#bounceOut',v=>(v/100).toFixed(2),v=>updatePieces({restitution:v/100}));bindRange('#friction','#frictionOut',v=>(v/100).toFixed(2),v=>updatePieces({friction:v/100,frictionStatic:v/20}));bindRange('#attraction','#attractOut',v=>(v/100).toFixed(2));
document.querySelector('#textColor').oninput=e=>{library.filter(item=>item.kind==='text').forEach(item=>setItemVectorColor(item,e.target.value));};
document.querySelector('#vectorColor').oninput=e=>{library.filter(itemIsShapeVector).forEach(item=>setItemVectorColor(item,e.target.value));};
document.querySelector('#selectedInputColor').oninput=e=>setItemVectorColor(selectedItem(),e.target.value);
bindOpacity('#textColor',value=>library.filter(item=>item.kind==='text').forEach(item=>setItemVectorOpacity(item,value)));
bindOpacity('#vectorColor',value=>{library.filter(itemIsShapeVector).forEach(item=>setItemVectorOpacity(item,value));});
bindOpacity('#selectedInputColor',value=>setItemVectorOpacity(selectedItem(),value));
document.querySelector('#vectorStrokeEnabled').onchange=()=>{syncVectorStrokeControls();refreshAllVectorAppearance();};
document.querySelector('#vectorStrokeColor').oninput=refreshAllVectorAppearance;
bindOpacity('#vectorStrokeColor',refreshAllVectorAppearance);
document.querySelector('#textVectorStrokeEnabled').onchange=()=>{syncTextVectorStrokeControls();drawLibrary();};
document.querySelector('#textVectorStrokeColor').oninput=drawLibrary;
bindOpacity('#textVectorStrokeColor',drawLibrary);
document.querySelector('#previewGrid').onchange=syncPreviewGrid;
document.querySelector('#showBoundary').onchange=rebuildContainer;
document.querySelector('#overflowBehind').onchange=()=>{refreshOverflowLayers();containPieces();};
function clearPreview(){stopDropping();Composite.allBodies(engine.world).filter(b=>b.label==='piece').forEach(b=>Composite.remove(engine.world,b));}
function seedDefaultLibrary(){library.splice(0,library.length);itemId=0;queueIndex=0;selectedInputId=null;addLibrary({kind:'text',value:'G',preview:'G'});addLibrary({kind:'shape',shape:'circle',preview:'○'});addLibrary({kind:'shape',shape:'square',preview:'□'});}
function resetAllSettings(){
  clearPreview();projectSettingIds.forEach(id=>{const el=document.querySelector(`#${id}`);if(el.type==='checkbox')el.checked=el.defaultChecked;else el.value=el.defaultValue;});document.querySelector('#textInput').value=document.querySelector('#textInput').defaultValue;document.querySelector('#fileInput').value='';document.querySelector('.appearance-panel').open=false;
  customFonts.splice(0,customFonts.length);selectedFontId='space-mono';renderFontOptions();document.querySelector('#fontPanel').open=false;document.querySelectorAll('aside > .sidebar-panel').forEach(panel=>panel.open=false);drawing=false;customPoints=[];containerType='circle';containerAngle=0;stage.classList.remove('drawing');document.querySelector('#drawActions').classList.remove('visible');selectContainerButton('circle');syncRectangleControls();document.querySelector('#containerLabel').textContent='circle';restoreControlOutputs();restoreFrame('free');setPreviewZoom(1);seedDefaultLibrary();webProjectHandle=null;
  if(paused){paused=false;Runner.run(runner,engine);}document.querySelector('#pauseBtn').textContent='pause';
}
const clearDialog=document.querySelector('#clearDialog');
document.querySelector('#clearBtn').onclick=()=>clearDialog.showModal();
document.querySelector('#clearPreviewBtn').onclick=()=>{clearPreview();clearDialog.close();};
document.querySelector('#clearAllBtn').onclick=()=>{resetAllSettings();clearDialog.close();};
document.querySelector('#pauseBtn').onclick=e=>{paused=!paused;e.target.textContent=paused?'play':'pause';paused?Runner.stop(runner):Runner.run(runner,engine);};
function downloadBlob(blob,name){const a=document.createElement('a'),url=URL.createObjectURL(blob);a.download=name;a.href=url;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);}
function renderSceneExportCanvas(){Render.world(render);const output=document.createElement('canvas'),view=visiblePreviewRect();output.width=W;output.height=H;const context=output.getContext('2d');context.clearRect(0,0,W,H);if(!drawing&&containerPolygon.length>2){context.save();context.setTransform(view.zoom,0,0,view.zoom,-view.x*view.zoom,-view.y*view.zoom);traceContainerPath(context);context.clip();context.drawImage(render.canvas,0,0,W,H);context.restore();if(document.querySelector('#showBoundary').checked){context.save();context.setTransform(view.zoom,0,0,view.zoom,-view.x*view.zoom,-view.y*view.zoom);traceContainerPath(context);context.strokeStyle='#111111';context.lineWidth=+document.querySelector('#outlineThickness').value;context.lineJoin='round';context.stroke();context.restore();}}return output;}
function exportPng(){renderSceneExportCanvas().toBlob(blob=>blob&&downloadBlob(blob,'graphics-gravity.png'),'image/png');}
function exportJpg(){const scene=renderSceneExportCanvas(),output=document.createElement('canvas');output.width=W;output.height=H;const context=output.getContext('2d');context.fillStyle=flattenedColor(colorValue('#outsideColor','#d4d4d0'),opacityValue('#outsideColor'));context.fillRect(0,0,W,H);context.drawImage(scene,0,0);output.toBlob(blob=>blob&&downloadBlob(blob,'graphics-gravity.jpg'),'image/jpeg',.94);}
document.querySelector('#pngBtn').onclick=exportPng;
document.querySelector('#jpgBtn').onclick=exportJpg;
const svgNumber=value=>Number(value.toFixed(3));
const svgEscape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
function svgFillAttributes(color,opacity=100){return`fill="${svgEscape(normalizedHexColor(color)||'#111111')}" fill-opacity="${svgNumber(clampOpacity(opacity)/100)}"`;}
function svgVectorStrokeAttributes(){const stroke=vectorStrokeAppearance();return stroke.enabled?` stroke="${svgEscape(stroke.color)}" stroke-opacity="${svgNumber(stroke.opacity/100)}" stroke-width="${svgNumber(stroke.thickness)}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"`:'';}
function svgTextVectorStrokeAttributes(){const stroke=textVectorStrokeAppearance();return stroke.enabled?` stroke="${svgEscape(stroke.color)}" stroke-opacity="${svgNumber(stroke.opacity/100)}" stroke-width="${svgNumber(stroke.thickness)}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill"`:'';}
function svgEmbeddedFontStyles(){const used=new Set(engine.world.bodies.filter(body=>body.label==='piece'&&body.plugin?.drawText).map(body=>body.plugin.fontId));return customFonts.filter(font=>used.has(font.id)).map(font=>`@font-face{font-family:'${font.family}';src:url('${font.dataUrl}');font-style:${font.style||'normal'};font-weight:400;}`).join('');}
function svgTextBackground(body){
  const {drawText:text,textWidth:w,textHeight:h}=body.plugin,value=+document.querySelector('#textRadius').value,fill=svgFillAttributes(colorValue('#textBackgroundColor','#ffffff'),opacityValue('#textBackgroundColor')),borderWidth=+document.querySelector('#textBorderThickness').value,stroke=borderWidth>0?` stroke="${svgEscape(colorValue('#textBorderColor','#111111'))}" stroke-opacity="${svgNumber(opacityValue('#textBorderColor')/100)}" stroke-width="${svgNumber(borderWidth)}"`:'';
  if(text.length===1&&value>=FULL_TEXT_RADIUS_START){const r=Math.min(w,h)/2;if(value>=100)return`<circle cx="0" cy="0" r="${svgNumber(r)}" ${fill}${stroke}/>`;const t=(value-FULL_TEXT_RADIUS_START)/(100-FULL_TEXT_RADIUS_START),k=(2/3)+(.5522847498307936-(2/3))*t,kr=svgNumber(k*r),rr=svgNumber(r);return`<path d="M 0 ${-rr} C ${kr} ${-rr} ${rr} ${-kr} ${rr} 0 C ${rr} ${kr} ${kr} ${rr} 0 ${rr} C ${-kr} ${rr} ${-rr} ${kr} ${-rr} 0 C ${-rr} ${-kr} ${-kr} ${-rr} 0 ${-rr} Z" ${fill}${stroke}/>`;}
  const radius=svgNumber(textCornerRadius(w,h,value));return`<rect x="${svgNumber(-w/2)}" y="${svgNumber(-h/2)}" width="${svgNumber(w)}" height="${svgNumber(h)}" rx="${radius}" ${fill}${stroke}/>`;
}
function svgPiece(body){
  if(body.plugin?.drawText){const angle=svgNumber(body.angle*180/Math.PI),text=svgEscape(body.plugin.drawText),fontSize=svgNumber(body.plugin.fontSize),font=fontRecord(body.plugin.fontId),textY=svgNumber(textOpticalOffset(body.plugin.fontSize)),item=library.find(entry=>entry.id===body.plugin.inputId),fill=svgFillAttributes(itemEffectiveColor(item),itemEffectiveOpacity(item)),stroke=svgTextVectorStrokeAttributes();return`<g transform="translate(${svgNumber(body.position.x)} ${svgNumber(body.position.y)}) rotate(${angle})">${svgTextBackground(body)}<text x="0" y="${textY}" text-anchor="middle" dominant-baseline="central" font-family="${svgEscape(font.family)}" font-style="${svgEscape(font.style||'normal')}" font-size="${fontSize}" font-weight="400" ${fill}${stroke}>${text}</text></g>`;}
  if(body.plugin?.drawImage){const src=body.plugin.drawImageSrc||body.plugin.drawImage?.src;if(!src)return'';const angle=svgNumber(body.angle*180/Math.PI),x=svgNumber(body.plugin.drawImageOffset.x-body.plugin.drawImageWidth/2),y=svgNumber(body.plugin.drawImageOffset.y-body.plugin.drawImageHeight/2);return`<g transform="translate(${svgNumber(body.position.x)} ${svgNumber(body.position.y)}) rotate(${angle})"><image href="${svgEscape(src)}" x="${x}" y="${y}" width="${svgNumber(body.plugin.drawImageWidth)}" height="${svgNumber(body.plugin.drawImageHeight)}" preserveAspectRatio="none"/></g>`;}
  const item=library.find(entry=>entry.id===body.plugin?.inputId),fill=svgFillAttributes(itemEffectiveColor(item),itemEffectiveOpacity(item)),stroke=svgVectorStrokeAttributes();if(body.circleRadius)return`<circle cx="${svgNumber(body.position.x)}" cy="${svgNumber(body.position.y)}" r="${svgNumber(body.circleRadius)}" ${fill}${stroke}/>`;const parts=body.parts?.length>1?body.parts.slice(1):[body];return parts.map(part=>`<polygon points="${part.vertices.map(v=>`${svgNumber(v.x)},${svgNumber(v.y)}`).join(' ')}" ${fill}${stroke}/>`).join('');
}
function exportSvg(){
  const view=visiblePreviewRect(),hasContainer=!drawing&&containerPolygon.length>2,points=containerPolygon.map(p=>`${svgNumber(p[0])},${svgNumber(p[1])}`).join(' '),container=svgFillAttributes(colorValue('#containerColor','#ffffff'),opacityValue('#containerColor')),pieces=engine.world.bodies.filter(body=>body.label==='piece').map(svgPiece).join(''),clip=hasContainer?' clip-path="url(#containerClip)"':'',outline=hasContainer&&document.querySelector('#showBoundary').checked?`<polygon points="${points}" fill="none" stroke="#111111" stroke-width="${svgNumber(+document.querySelector('#outlineThickness').value)}" stroke-linejoin="round"/>`:'';
  const fontStyles=svgEmbeddedFontStyles(),defsContent=`${hasContainer?`<clipPath id="containerClip"><polygon points="${points}"/></clipPath>`:''}${fontStyles?`<style>${fontStyles}</style>`:''}`,defs=defsContent?`<defs>${defsContent}</defs>`:'',containerFill=hasContainer?`<polygon points="${points}" ${container}/>`:'';
  const svg=`<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="${svgNumber(view.x)} ${svgNumber(view.y)} ${svgNumber(view.width)} ${svgNumber(view.height)}">${defs}${containerFill}<g${clip}>${pieces}</g>${outline}</svg>`;
  downloadBlob(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),'graphics-gravity.svg');
}
document.querySelector('#svgBtn').onclick=exportSvg;
const crcTable=(()=>{const table=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;table[n]=c>>>0;}return table;})();
function crc32(data){let crc=0xffffffff;for(const byte of data)crc=crcTable[(crc^byte)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;}
function storedZip(files){const encoder=new TextEncoder(),localParts=[],centralParts=[];let offset=0,centralSize=0;for(const file of files){const name=encoder.encode(file.name),data=file.data instanceof Uint8Array?file.data:new Uint8Array(file.data),crc=crc32(data),local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(8,0,true);lv.setUint32(14,crc,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);localParts.push(local,data);const central=new Uint8Array(46+name.length),cv=new DataView(central.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(10,0,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);central.set(name,46);centralParts.push(central);centralSize+=central.length;offset+=local.length+data.length;}const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,files.length,true);ev.setUint16(10,files.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);return new Blob([...localParts,...centralParts,end],{type:'application/zip'});}
const canvasBlob=(canvas,type='image/png')=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('frame encode failed')),type));
const waitVideo=(video,event)=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error(`video ${event} timeout`)),10000),done=()=>{clearTimeout(timer);video.removeEventListener(event,done);resolve();};video.addEventListener(event,done,{once:true});});
async function seekVideo(video,time){if(Math.abs(video.currentTime-time)<.0005&&video.readyState>=2)return;const ready=waitVideo(video,'seeked');video.currentTime=time;await ready;}
async function pngSequenceFromWebm(blob){const dialog=document.querySelector('#recordSaveDialog'),note=document.querySelector('#recordDialogNote'),url=URL.createObjectURL(blob),video=document.createElement('video');try{video.preload='auto';video.muted=true;video.src=url;await waitVideo(video,'loadedmetadata');let duration=video.duration;if(!Number.isFinite(duration)){const durationReady=waitVideo(video,'durationchange').catch(()=>{});video.currentTime=1e9;await durationReady;duration=video.duration;await seekVideo(video,0);}if(!Number.isFinite(duration)||duration<=0)throw new Error('recording duration unavailable');const fps=30,total=Math.max(1,Math.ceil(duration*fps)),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),files=[];canvas.width=video.videoWidth||W;canvas.height=video.videoHeight||H;for(let i=0;i<total;i++){await seekVideo(video,Math.min(Math.max(0,duration-.001),i/fps));ctx.drawImage(video,0,0,canvas.width,canvas.height);const png=await canvasBlob(canvas);files.push({name:`frame_${String(i+1).padStart(6,'0')}.png`,data:new Uint8Array(await png.arrayBuffer())});if(i%5===0||i===total-1)note.textContent=`building PNG sequence ${i+1} / ${total}`;}files.push({name:'sequence.json',data:new TextEncoder().encode(JSON.stringify({fps,width:canvas.width,height:canvas.height,frames:total,duration},null,2))});note.textContent='packing ZIP...';return storedZip(files);}finally{URL.revokeObjectURL(url);dialog.classList.remove('busy');}}
const recordDialog=document.querySelector('#recordSaveDialog'),recordDialogNote=document.querySelector('#recordDialogNote');
function offerRecording(blob){pendingRecordingBlob=blob;recordDialogNote.textContent='PNG sequence exports at 30 FPS.';recordDialog.classList.remove('busy');recordDialog.showModal();}
document.querySelector('#saveWebm').onclick=()=>{if(!pendingRecordingBlob)return;downloadBlob(pendingRecordingBlob,`graphics-gravity-${Date.now()}.webm`);pendingRecordingBlob=null;recordDialog.close();};
document.querySelector('#savePngSequence').onclick=async()=>{if(!pendingRecordingBlob)return;const blob=pendingRecordingBlob;recordDialog.classList.add('busy');try{const zip=await pngSequenceFromWebm(blob);downloadBlob(zip,`graphics-gravity-png-sequence-${Date.now()}.zip`);pendingRecordingBlob=null;recordDialog.close();}catch(error){recordDialog.classList.remove('busy');recordDialogNote.textContent=`PNG sequence failed: ${error.message}`;}};
recordDialog.addEventListener('close',()=>{if(!recordDialog.classList.contains('busy'))pendingRecordingBlob=null;});
function recordingTime(){const elapsed=Math.floor((performance.now()-recordStartedAt)/1000);document.querySelector('#recTime').textContent=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;}
function stopRecording(){if(mediaRecorder?.state==='recording')mediaRecorder.stop();}
function startRecording(){if(!render.canvas.captureStream||typeof MediaRecorder==='undefined'){document.querySelector('#recBtn').textContent='UNSUPPORTED';return;}recordCanvas=document.createElement('canvas');recordCanvas.width=W;recordCanvas.height=H;recordContext=recordCanvas.getContext('2d');recordedChunks=[];recordStream=recordCanvas.captureStream(60);const types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'],mimeType=types.find(type=>MediaRecorder.isTypeSupported(type));mediaRecorder=new MediaRecorder(recordStream,mimeType?{mimeType,videoBitsPerSecond:12000000}:undefined);mediaRecorder.ondataavailable=e=>{if(e.data.size)recordedChunks.push(e.data);};mediaRecorder.onstop=()=>{clearInterval(recordTimer);recordTimer=null;recordStream?.getTracks().forEach(track=>track.stop());recordCanvas=null;recordContext=null;const blob=new Blob(recordedChunks,{type:mediaRecorder.mimeType||'video/webm'});document.querySelector('#recBtn').textContent='REC';document.querySelector('#recBtn').classList.remove('recording');offerRecording(blob);};mediaRecorder.start(250);recordStartedAt=performance.now();recordingTime();recordTimer=setInterval(recordingTime,250);document.querySelector('#recBtn').textContent='STOP';document.querySelector('#recBtn').classList.add('recording');}
document.querySelector('#recBtn').onclick=()=>mediaRecorder?.state==='recording'?stopRecording():startRecording();
document.querySelectorAll('[data-frame]').forEach(button=>button.onclick=()=>setFrame(button.dataset.frame));
setInterval(()=>{document.querySelector('#bodyStatus').textContent=`${Composite.allBodies(engine.world).filter(b=>b.label==='piece').length} bodies`;const now=performance.now();document.querySelector('#fpsStatus').textContent=`${Math.round(frames*1000/(now-lastTime))} fps`;frames=0;lastTime=now;},1000);
(function count(){frames++;requestAnimationFrame(count)})();


syncVectorStrokeControls();syncTextVectorStrokeControls();syncPreviewGrid();
seedDefaultLibrary();
Render.run(render);Runner.run(runner,engine);resize();
