import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',
 use:{baseURL:process.env.TEST_APP_URL||'http://127.0.0.1:3000',headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'chromium'},
 projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}],
 reporter:'list',
});
