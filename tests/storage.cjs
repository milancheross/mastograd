const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { IDBFactory } = require('fake-indexeddb');
const source = fs.readFileSync(require('node:path').join(__dirname,'../js/coloring-library.js'),'utf8');
function open({ indexedDB=new IDBFactory(), entries=new Map(), failLocal=false }={}) {
  const events=[];
  const context={indexedDB,console:{warn(){}},CustomEvent:class{constructor(type, options){this.type=type;this.detail=options.detail;}},window:{dispatchEvent:event=>events.push(event)},localStorage:{getItem:key=>entries.get(key)||null,setItem:(key,value)=>{if(failLocal)throw new Error('QuotaExceeded');entries.set(key,value)},removeItem:key=>entries.delete(key)}};
  vm.runInNewContext(source,context);
  return {lib:context.window.MastogradColoringLibrary,events,indexedDB,entries};
}
const key='mastograd_user_coloring_templates';
const old={id:'old',title:'Stara slika',dataUrl:'data:image/png;base64,legacy',createdAt:1};
test('migrate legacy images, persist new ones, reload and delete',async()=>{
  const session=open({entries:new Map([[key,JSON.stringify([old])]])});
  await session.lib.ready;
  assert.equal(session.entries.has(key),false);
  assert.equal(session.lib.getUserTemplates()[0].id,'old');
  const added=await session.lib.addUserTemplate({title:'Nova',dataUrl:'data:image/png;base64,new'});
  const reload=open(session);await reload.lib.ready;
  assert.equal(reload.lib.getUserTemplates().length,2);
  assert.equal(reload.lib.getUserTemplates()[0].id,added.id);
  await reload.lib.removeUserTemplate('old');
  const again=open(session);await again.lib.ready;
  assert.equal(again.lib.getUserTemplates().length,1);
});
test('full localStorage does not prevent saving new images',async()=>{
  const session=open({failLocal:true});await session.lib.ready;
  const added=await session.lib.addUserTemplate({dataUrl:'data:image/png;base64,new'});
  const reload=open(session);await reload.lib.ready;
  assert.equal(reload.lib.getUserTemplates()[0].id,added.id);
  assert.equal(session.events.length,0);
});
test('blocked storage retains legacy images and supports coloring in memory',async()=>{
  const entries=new Map([[key,JSON.stringify([old])]]);
  const session=open({entries,indexedDB:{open(){throw new Error('blocked')}}});await session.lib.ready;
  assert.equal(entries.has(key),true);
  const added=await session.lib.addUserTemplate({dataUrl:'new'});
  assert.equal(session.lib.getAllTemplates().find(t=>t.id===added.id).dataUrl,'new');
  assert.equal(session.lib.getUserTemplates().length,2);
  assert.equal(session.events[0].type,'mastograd-storage-error');
});
test('a failed migration keeps the legacy copy for a later retry',async()=>{
  const factory=new IDBFactory();
  const db=await new Promise((resolve,reject)=>{const r=factory.open('mastograd-coloring',1);r.onupgradeneeded=()=>r.result.createObjectStore('templates',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  // Simulate a quota error when migration starts its write transaction.
  const entries=new Map([[key,JSON.stringify([old])]]);
  const session=open({indexedDB:{open(){const r=factory.open('mastograd-coloring',1);r.addEventListener('success',()=>{const original=r.result.transaction.bind(r.result);r.result.transaction=(name,mode)=>{if(mode==='readwrite')throw new Error('quota');return original(name,mode)}});return r}},entries});
  await session.lib.ready;
  assert.equal(entries.has(key),true);
  assert.equal(session.lib.getUserTemplates()[0].id,'old');
  db.close();
});
test('malformed legacy storage does not break the built-in library',async()=>{
  const session=open({entries:new Map([[key,'not-json']])});await session.lib.ready;
  assert.equal(session.lib.getUserTemplates().length,0);
  assert.ok(session.lib.getAllTemplates().some(t=>t.id==='bearman_coloring'));
});
