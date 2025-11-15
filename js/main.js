// js/main.js

// --- [ الدالة العامة للانتقال والهايلايت ] ---
// تم وضعها هنا في النطاق العام (global scope) لتكون مرئية لجميع الملفات
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const rect = element.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );

        // لا تقم بالانتقال إذا كان العنصر ظاهراً بالكامل بالفعل
        if (!isVisible) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // قم بالهايلايت في كل الحالات
        element.classList.add('highlight');
        setTimeout(() => {
            element.classList.remove('highlight');
        }, 1500);
    } else {
        console.warn('Scroll target not found:', id);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const treeRoot = document.getElementById('tree-root');
    const contentContainer = document.getElementById('content-container');

    if (!treeRoot || !contentContainer) {
        console.error("خطأ: لم يتم العثور على الحاوية tree-root أو content-container.");
        return;
    }

    // بناء الهيكل الشجري
    buildTree(treeRoot, classificationData);

    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const printBtn = document.getElementById('print-btn');
    const sidebarSearch = document.getElementById('sidebar-search');

    // Mobile Menu Toggle
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        const overlay = document.querySelector('.overlay');
        if (sidebar.classList.contains('open')) {
            if (!overlay) {
                const newOverlay = document.createElement('div');
                newOverlay.classList.add('overlay');
                document.body.appendChild(newOverlay);
                newOverlay.addEventListener('click', () => {
                    sidebar.classList.remove('open');
                    newOverlay.remove();
                });
            }
        } else {
            if (overlay) overlay.remove();
        }
    });

    // --- دالة الربط العميق ---
    function handleDeepLink() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;

        const targetSubItem = document.querySelector(`.policy-item[data-policy-code="${hash}"]`);
        if (!targetSubItem) return;

        const manualHeader = targetSubItem.closest('.manual-item').querySelector('.manual-header');
        if (!manualHeader) return;
        
        // فتح كل المستويات الأصلية
        let parent = targetSubItem.closest('.domain-item');
        while(parent) {
            const header = parent.querySelector('.domain-header');
            const container = parent.querySelector('.manuals-container');
            if(header && container) {
                header.classList.add('expanded');
                container.classList.remove('hidden');
            }
            parent = parent.parentElement.closest('.domain-item');
        }

        manualHeader.classList.add('expanded');
        const policiesContainer = manualHeader.closest('.manual-item').querySelector('.policies-container');
        if(policiesContainer) {
            policiesContainer.classList.remove('hidden');
        }
        
        const fileToLoad = manualHeader.dataset.manualCode;
        loadPolicyContent(fileToLoad, contentContainer, hash);

        document.querySelectorAll('.manual-header.active, .policy-item.active').forEach(item => item.classList.remove('active'));
        manualHeader.classList.add('active');
        targetSubItem.classList.add('active');
    }
    
    // استدعاء الدالة عند تحميل الصفحة للتعامل مع الروابط المباشرة
    handleDeepLink();

    // Sidebar Search
    sidebarSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const items = document.querySelectorAll('.domain-item');

        items.forEach(item => {
            const domainHeader = item.querySelector('.domain-header');
            const manualsContainer = item.querySelector('.manuals-container');
            let itemText = (domainHeader.textContent || '').toLowerCase();
            let domainMatches = itemText.includes(searchTerm);
            let hasVisibleChildren = false;

            if (manualsContainer) {
                const manualItems = manualsContainer.querySelectorAll('.manual-item');
                manualItems.forEach(manualItem => {
                    const manualHeader = manualItem.querySelector('.manual-header');
                    const policiesContainer = manualItem.querySelector('.policies-container');
                    let manualText = (manualHeader.textContent || '').toLowerCase();
                    let manualMatches = manualText.includes(searchTerm);
                    let hasVisiblePolicies = false;

                    if (policiesContainer) {
                        const policyItems = policiesContainer.querySelectorAll('.policy-item');
                        policyItems.forEach(policyItem => {
                            const policyText = (policyItem.textContent || '').toLowerCase();
                            if (policyText.includes(searchTerm)) {
                                policyItem.style.display = '';
                                hasVisiblePolicies = true;
                            } else {
                                policyItem.style.display = 'none';
                            }
                        });
                    }

                    if (manualMatches || hasVisiblePolicies) {
                        manualItem.style.display = '';
                        hasVisibleChildren = true;
                        if (searchTerm.length > 0) {
                            manualHeader.classList.add('expanded');
                            if(policiesContainer) policiesContainer.classList.remove('hidden');
                        }
                    } else {
                        manualItem.style.display = 'none';
                    }
                });
            }

            if (domainMatches || hasVisibleChildren) {
                item.style.display = '';
                 if (searchTerm.length > 0) {
                    domainHeader.classList.add('expanded');
                    if(manualsContainer) manualsContainer.classList.remove('hidden');
                }
            } else {
                item.style.display = 'none';
            }
            
            // إعادة تعيين الحالة عند مسح البحث
            if (searchTerm === '') {
                document.querySelectorAll('.expanded').forEach(el => el.classList.remove('expanded'));
                document.querySelectorAll('.manuals-container, .policies-container').forEach(el => el.classList.add('hidden'));
            }
        });
    });

    // --- زر الطباعة ---
    printBtn.addEventListener('click', function() {
        const activeManual = document.querySelector('.manual-header.active');
        if (!activeManual) {
            alert('الرجاء اختيار دليل من القائمة الجانبية أولاً');
            return;
        }

        const manualCode = activeManual.dataset.manualCode;
        if (!manualCode) {
            alert('لم يتم العثور على رمز الدليل');
            return;
        }

        const printWindow = window.open('', '_blank');

        fetch(`policies/${manualCode}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('فشل في تحميل المحتوى');
                }
                return response.text();
            })
            .then(html => {
                const mainTitle = activeManual.querySelector('.manual-name strong').textContent.trim();
                let printContent = `
                    <!DOCTYPE html>
                    <html lang="ar" dir="rtl">
                    <head>
                        <meta charset="UTF-8">
                        <title>طباعة - ${mainTitle}</title>
                        <link rel="stylesheet" href="css/style.css">
                        <style>
                            @media print {
                                body { font-size: 10pt; }
                                .print-header { display: block; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 15px; margin-bottom: 20px; }
                                @page { size: A4; margin: 1.5cm; }
                            }
                            body { background-color: white; }
                        </style>
                    </head>
                    <body>
                        <div class="print-header">
                            <img src="img/logo-large.png" alt="شعار شركة أوتاد الفهد" style="height: 60px; margin: 0 auto 10px;">
                            <h1>بوابة السياسات والإجراءات التشغيلية</h1>
                            <h2>${mainTitle}</h2>
                        </div>
                        <div class="print-content">${html}</div>
                        <script src="https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js"><\/script>
                        <script>
                            window.onload = function() {
                                mermaid.initialize({ startOnLoad: false, theme: 'default' });
                                mermaid.run({
                                    nodes: document.querySelectorAll('.mermaid')
                                }).then(() => {
                                    setTimeout(() => window.print(), 300);
                                });
                            };
                        <\/script>
                    </body>
                    </html>
                `;
                printWindow.document.open();
                printWindow.document.write(printContent);
                printWindow.document.close();
            })
            .catch(error => {
                if(printWindow) printWindow.close();
                alert('حدث خطأ أثناء تحميل المحتوى للطباعة: ' + error.message);
            });
    });
});