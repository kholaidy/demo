@echo off
setlocal

:: سكربت رفع جميع الملفات في نفس مجلد السكربت إلى مستودع GitHub demo

echo.
echo === رفع الملفات إلى مستودع GitHub: kholaidy/demo على فرع main ===
echo.

:: الانتقال إلى نفس مسار ملف السكربت
cd /d "%~dp0"

:: إذا لم يكن هذا مجلد Git فسنقوم بتهيئته وربطه بالمستودع الجديد
IF NOT EXIST ".git" (
    echo > تهيئة git لأول مرة في هذا المجلد...
    git init

    :: جعل الفرع الأساسي اسمه main
    git branch -M main

    :: ربط الريموت بالمستودع الجديد على GitHub
    git remote add origin https://github.com/kholaidy/demo.git
)

:: إضافة كل الملفات والتغييرات
git add -A

:: إنشاء commit جديد (إذا لم توجد تغييرات سيتجاوز البوش)
git commit -m "تحديث تلقائي من السكربت" || (
    echo.
    echo ⚠ لا توجد تغييرات جديدة لرفعها.
    goto :end
)

:: دفع التغييرات إلى فرع main
git push -u origin main

echo.
echo ✅ تم رفع كل الملفات في هذا المجلد إلى GitHub بنجاح.

:end
echo.
pause
endlocal
