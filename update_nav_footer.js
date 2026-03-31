const fs = require('fs');

const path = './frontend/public/kua-site/index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove the old footer inside pg-land
const footerRegex = /<footer class="bg-slate-900 border-t border-slate-800">[\s\S]*?<\/footer>/g;
content = content.replace(footerRegex, '');

// 2. Insert the new universal footer right before <script>
const newFooter = \
    <!-- ===================== UNIVERSAL FOOTER ===================== -->
    <footer class="bg-slate-900 text-slate-400 py-16 mt-auto">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
            <div class="col-span-1 md:col-span-1">
                <div class="flex items-center gap-2 mb-6">
                    <img src="https://z-cdn-media.chatglm.cn/files/90cbfc0e-5e5c-42cc-8db9-3c8e4d2b853c.png?auth_key=1874898585-c99c8156e16d417599bed389310379a7-0-e77ab3bc51f6577329cd9115e0d45934" alt="Kua" class="h-8 brightness-0 invert opacity-90">
                </div>
                <p class="text-sm leading-relaxed mb-6 max-w-xs">Growth & marketing foundations for the next generation. Master the frameworks that drive real scalable success.</p>
                <p class="text-xs">&copy; 2026 Kua Academy. All rights reserved.</p>
            </div>
            
            <div>
                <h4 class="text-white font-semibold mb-5 uppercase text-xs tracking-wider">Platform</h4>
                <ul class="space-y-3 text-sm">
                    <li><button onclick="goHome(); window.scrollTo(0,0)" class="hover:text-white transition-colors">Home</button></li>
                    <li><button onclick="goDash()" class="hover:text-white transition-colors">Dashboard</button></li>
                    <li><button onclick="goCur()" class="hover:text-white transition-colors">Curriculum</button></li>
                    <li><button onclick="goQuiz()" class="hover:text-white transition-colors">Quizzes</button></li>
                </ul>
            </div>
            
            <div>
                <h4 class="text-white font-semibold mb-5 uppercase text-xs tracking-wider">Discover</h4>
                <ul class="space-y-3 text-sm">
                    <li><button onclick="if(curPage!=='land') goHome(); setTimeout(()=>scrollToEl('four-ps'), 200)" class="hover:text-white transition-colors">The 4 Ps</button></li>
                    <li><button onclick="if(curPage!=='land') goHome(); setTimeout(()=>scrollToEl('aida-funnel'), 200)" class="hover:text-white transition-colors">AIDA Funnel</button></li>
                    <li><button onclick="if(curPage!=='land') goHome(); setTimeout(()=>scrollToEl('modules'), 200)" class="hover:text-white transition-colors">All Modules</button></li>
                    <li><button onclick="if(curPage!=='land') goHome(); setTimeout(()=>scrollToEl('pricing'), 200)" class="hover:text-white transition-colors">Pricing Options</button></li>
                </ul>
            </div>
            
            <div>
                <h4 class="text-white font-semibold mb-5 uppercase text-xs tracking-wider">Connect</h4>
                <ul class="space-y-3 text-sm">
                    <li><button onclick="document.getElementById('ai-in').focus(); toggleAI()" class="hover:text-white transition-colors flex items-center gap-2"><iconify-icon icon="lucide:sparkles" width="14" class="text-brand-500"></iconify-icon> Chat with AI</button></li>
                    <li><a href="mailto:support@kua.com" class="hover:text-white transition-colors">Contact Support</a></li>
                    <li><button onclick="toast('Terms & Privacy coming soon!')" class="hover:text-white transition-colors">Legal & Privacy</button></li>
                    <li class="mt-6"><button onclick="Auth.get() ? goDash() : openAuth('signup')" class="text-brand-400 font-medium hover:text-brand-300 transition-colors">Get Started Free &rarr;</button></li>
                </ul>
            </div>
        </div>
    </footer>
    
    <script>
\;

content = content.replace('<script>', newFooter);

// 3. Update syncUI implementation
const syncUIRegex = /if\s*\(curPage\s*===\s*'land'\)\s*\{[\s\S]*?else\s*\{[\s\S]*?\}\s*\}/;

const newSyncUI = \
            if (curPage === 'land') renderLandMods();

            if (u) {
                // Logged In Global Nav
                [['Home', goHome], ['Dashboard', goDash], ['Curriculum', goCur], ['Quizzes', goQuiz]].forEach(([t, fn]) => {
                    const active = (t === 'Home' && curPage === 'land') || (t === 'Dashboard' && curPage === 'dash') || (t === 'Curriculum' && curPage === 'cur') || (t === 'Quizzes' && curPage === 'quiz');
                    const b = document.createElement('button'); b.className = \\\
av-lk text-sm transition-colors font-medium \\\\\\; b.textContent = t; b.onclick = fn; nl.appendChild(b);
                    const m = document.createElement('button'); m.className = \\\	ext-sm py-2 text-left font-medium transition-colors \\\\\\; m.textContent = t; m.onclick = () => { fn(); closeMob() }; ml.appendChild(m);
                });
                
                const ub = document.createElement('button'); ub.className = 'flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors'; ub.innerHTML = \\\<div class="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center"><iconify-icon icon="lucide:user" width="14" class="text-brand-600"></iconify-icon></div>\\\\\\; ub.onclick = goDash; nr.appendChild(ub);
                const lo = document.createElement('button'); lo.className = 'text-sm font-medium text-slate-400 hover:text-red-500 px-3 py-2 transition-colors'; lo.textContent = 'Logout'; lo.onclick = doLogout; nr.appendChild(lo);
                ml.innerHTML += '<hr class="border-slate-100 my-1">';
                const mh = document.createElement('button'); mh.className = 'text-sm text-slate-600 hover:text-brand-600 py-2 text-left font-medium'; mh.textContent = 'Back to Home'; mh.onclick = () => { goHome(); window.scrollTo(0,0); closeMob() }; ml.appendChild(mh);
                const mo = document.createElement('button'); mo.className = 'text-sm text-slate-400 hover:text-red-500 py-2 text-left font-medium'; mo.textContent = 'Logout'; mo.onclick = () => { doLogout(); closeMob() }; ml.appendChild(mo);
            } else {
                ['Home|top', 'The 4 Ps|four-ps', 'AIDA Funnel|aida-funnel', 'Modules|modules', 'Pricing|pricing'].forEach(t => {
                    const [a, id] = t.split('|');
                    const active = (a === 'Home' && curPage === 'land');
                    const b = document.createElement('button'); b.className = \\\
av-lk text-sm transition-colors font-medium \\\\\\; b.textContent = a; b.onclick = () => { if (curPage!=='land') goHome(); setTimeout(()=> { if(id==='top') window.scrollTo({top:0,behavior:'smooth'}); else scrollToEl(id); }, 100) }; nl.appendChild(b);
                    const m = document.createElement('button'); m.className = \\\	ext-sm py-2 text-left font-medium transition-colors \\\\\\; m.textContent = a; m.onclick = () => { if (curPage!=='land') goHome(); setTimeout(()=> { if(id==='top') window.scrollTo({top:0,behavior:'smooth'}); else scrollToEl(id); }, 100); closeMob() }; ml.appendChild(m);
                });
                
                const li = document.createElement('button'); li.className = 'text-sm font-medium text-slate-600 hover:text-brand-600 px-4 py-2'; li.textContent = 'Log in'; li.onclick = () => openAuth('login'); nr.appendChild(li);
                const su = document.createElement('button'); su.className = 'text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-lg shadow-sm transition-colors'; su.textContent = 'Get Started Free'; su.onclick = () => openAuth('signup'); nr.appendChild(su);
                ml.innerHTML += '<hr class="border-slate-100 my-1">';
                const ml2 = document.createElement('button'); ml2.className = 'w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-2.5 rounded-lg text-sm text-center transition-colors'; ml2.textContent = 'Get Started Free'; ml2.onclick = () => { openAuth('signup'); closeMob() }; ml.appendChild(ml2);
            }
\;

content = content.replace(syncUIRegex, newSyncUI.trim());
fs.writeFileSync(path, content, 'utf8');
console.log('Update completed successfully!');
