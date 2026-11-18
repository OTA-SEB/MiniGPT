// Run with: node --test tests/response-router.test.mjs
// No npm install required; loads the browser ES module as a data URL.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const code=await readFile(new URL('../docs/response-router.js',import.meta.url),'utf8');
const {routeResponse}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));

test('local generative success never calls automatic replies',async()=>{
 let fallbackCalls=0;
 const r=await routeResponse({
  local:async()=>({mode:'generative',text:'New text from local model'}),
  fallback:async()=>{fallbackCalls++;return {text:'Prewritten topic'};}
 });
 assert.equal(r.engine,'generative');
 assert.equal(r.result.text,'New text from local model');
 assert.equal(fallbackCalls,0);
});

test('external generator is first if key is configured',async()=>{
 let localCalls=0,fallbackCalls=0;
 const r=await routeResponse({
  apiKey:'example-test-token',
  external:async()=>({mode:'api',text:'New text from external model'}),
  local:async()=>{localCalls++;return {text:'Local answer'};},
  fallback:async()=>{fallbackCalls++;return {text:'Prewritten'};}
 });
 assert.equal(r.engine,'external');
 assert.equal(localCalls,0);
 assert.equal(fallbackCalls,0);
});

test('external error routes to local generator before fallback',async()=>{
 let fallbackCalls=0;
 const r=await routeResponse({
  apiKey:'example-test-token',
  external:async()=>{throw new Error('API offline');},
  local:async()=>({mode:'generative',text:'Browser-generated response'}),
  fallback:async()=>{fallbackCalls++;return {text:'Prewritten'};}
 });
 assert.equal(r.engine,'generative');
 assert.equal(fallbackCalls,0);
});

test('fallback runs only after both generators fail',async()=>{
 let fallbackCalls=0;
 const r=await routeResponse({
  apiKey:'example-test-token',
  external:async()=>{throw new Error('API offline');},
  local:async()=>{throw new Error('Model unavailable');},
  fallback:async()=>{fallbackCalls++;return {mode:'reference',text:'Known topic response'};}
 });
 assert.equal(r.engine,'fallback');
 assert.equal(fallbackCalls,1);
 assert.match(r.result.trigger,/Automatic fallback/);
});

test('empty generated text counts as failure',async()=>{
 let fallbackCalls=0;
 const r=await routeResponse({
  local:async()=>({mode:'generative',text:'  '}),
  fallback:async()=>{fallbackCalls++;return {mode:'reference',text:'Backup'};}
 });
 assert.equal(r.engine,'fallback');assert.equal(fallbackCalls,1);
});

test('cancelled generation never invokes fallback',async()=>{
 let fallbackCalls=0;
 const r=await routeResponse({
  local:async()=>({cancelled:true}),
  fallback:async()=>{fallbackCalls++;return {text:'Prewritten'};}
 });
 assert.equal(r.cancelled,true);assert.equal(fallbackCalls,0);
});

test('even a broken fallback yields a truthful failure, not a fake generated reply',async()=>{
 const r=await routeResponse({
  local:async()=>{throw new Error('Model unavailable');},
  fallback:async()=>{throw new Error('No fallback');}
 });
 assert.equal(r.engine,'fallback');
 assert.equal(r.result.mode,'fallback');
 assert.match(r.result.text,/No pude generar/);
});
