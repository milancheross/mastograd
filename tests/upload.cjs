// Run against a local static server: NODE_PATH=<playwright modules> node tests/upload.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}), args:['--no-sandbox']});
  const page = await browser.newPage();
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  await page.goto(process.env.TEST_URL || 'http://localhost:8765');
  await page.evaluate(()=>window.MastogradColoringLibrary.ready);
  const png = await page.evaluate(()=>{
    const c=document.createElement('canvas'); c.width=200;c.height=200;
    const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,200,200);x.strokeStyle='black';x.lineWidth=6;x.strokeRect(30,30,140,140);
    return c.toDataURL();
  });
  const file={name:'moja bojanka.png',mimeType:'image/png',buffer:Buffer.from(png.split(',')[1],'base64')};
  // Reproduce a full localStorage without consuming IndexedDB capacity.
  await page.evaluate(()=>{let i=0;try{while(true)localStorage.setItem('filler'+i++, 'x'.repeat(100000));}catch{}});
  await page.locator('#cbDirectFileInput').setInputFiles(file);
  await page.waitForFunction(()=>window.MastogradColoringLibrary.getUserTemplates().length===1 && document.querySelector('#cbTemplateTitle').textContent==='moja bojanka');
  const pixel=()=>page.evaluate(()=>Array.from(window.mastogradColoring.colorCtx.getImageData(390,290,1,1).data));
  const before=await pixel();
  const box=await page.locator('#cbColorCanvas').boundingBox();
  await page.locator('#cbColorCanvas').click({position:{x:box.width/2,y:box.height/2},force:true});
  assert.notDeepEqual(await pixel(),before,'Bucket must color the uploaded page');
  // Same file can be chosen again, even after the input was reset.
  await page.locator('#cbDirectFileInput').setInputFiles(file);
  await page.waitForFunction(()=>window.MastogradColoringLibrary.getUserTemplates().length===2);
  await page.evaluate(()=>window.mastogradColoring.loadTemplate(window.MastogradColoringLibrary.getUserTemplates()[0].id));
  await page.reload();
  await page.evaluate(()=>window.MastogradColoringLibrary.ready);
  assert.equal(await page.evaluate(()=>window.MastogradColoringLibrary.getUserTemplates().length),2);
  await page.evaluate(()=>window.mastogradColoring.loadTemplate(window.MastogradColoringLibrary.getUserTemplates()[1].id));
  assert.equal(await page.locator('#cbTemplateTitle').textContent(),'moja bojanka');
  // A bad file in a batch must not stop subsequent images.
  await page.evaluate(async png=>{
    const bytes=await (await fetch(png)).blob();
    await window.mastogradColoring.processDirectUploadFiles([new File(['broken'],'broken.png',{type:'image/png'}),new File([bytes],'valid-after-broken.png',{type:'image/png'})]);
  },png);
  assert.equal(await page.locator('#cbTemplateTitle').textContent(),'valid-after-broken');
  // Legacy pictures survive migration and can be reopened and deleted.
  const legacy=await browser.newPage();
  await legacy.addInitScript(png=>localStorage.setItem('mastograd_user_coloring_templates',JSON.stringify([{id:'legacy',title:'Stara slika',dataUrl:png,isUserUploaded:true}])),png);
  await legacy.goto(process.env.TEST_URL || 'http://localhost:8765');
  await legacy.evaluate(()=>window.MastogradColoringLibrary.ready);
  await legacy.evaluate(()=>window.mastogradColoring.loadTemplate('legacy'));
  assert.equal(await legacy.locator('#cbTemplateTitle').textContent(),'Stara slika');
  assert.equal(await legacy.evaluate(()=>localStorage.getItem('mastograd_user_coloring_templates')),null);
  await legacy.evaluate(()=>window.MastogradColoringLibrary.removeUserTemplate('legacy'));
  assert.equal(await legacy.evaluate(()=>window.MastogradColoringLibrary.getUserTemplates().some(t=>t.id==='legacy')),false);
  // Storage errors must still leave the uploaded page available for coloring.
  const blocked=await browser.newPage();
  await blocked.addInitScript(()=>{indexedDB.open=()=>{throw new Error('blocked')};});
  await blocked.goto(process.env.TEST_URL || 'http://localhost:8765');
  await blocked.locator('#cbDirectFileInput').setInputFiles(file);
  await blocked.waitForFunction(()=>document.querySelector('#cbTemplateTitle').textContent==='moja bojanka');
  assert.match(await blocked.locator('#cbUploadStatus').textContent(),/nije trajno sačuvana/);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: upload, coloring, full localStorage, repeat upload, reload, corrupt batch, legacy migration, deletion, storage fallback');
})().catch(e=>{console.error(e);process.exit(1)});
