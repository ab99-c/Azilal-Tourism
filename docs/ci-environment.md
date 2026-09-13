# CI and production environment

يحتاج البناء والإنتاج إلى المتغيرات السرية التالية، وتُضاف القيم من إعدادات Vercel Production ومن GitHub Actions Secrets، وليس داخل المستودع:

| المتغير | الاستخدام | إلزامي |
|---|---|---|
| `DATABASE_URL` | اتصال TiDB/MySQL الإنتاجي وتشغيل اختبارات قاعدة البيانات | نعم للإنتاج، واختبارات DB فقط |
| `JWT_SECRET` | توقيع جلسات المصادقة | نعم للإنتاج |
| `AUTH_BOOTSTRAP_SECRET` | تفعيل حساب الإدارة المحلي عند الحاجة | نعم لمسار تفعيل الإدارة |
| `RESEND_API_KEY` | مصادقة Resend لإشعارات الرسائل والردود | نعم قبل تفعيل البريد |
| `CONTACT_ADMIN_EMAIL` | عنوان استقبال إشعارات التواصل | نعم عند تفعيل الإشعارات |
| `CONTACT_FROM_EMAIL` | عنوان المرسل الموثق في Resend | نعم عند تفعيل الإرسال |

يستخدم workflow الخاص بـ GitHub Actions `npm ci` ثم `npm run check` و`npx vitest run` و`npm run build`. الاختبارات الخارجية التي تتواصل مع provider لا تُشغّل افتراضياً؛ يمكن تشغيلها يدوياً فقط عبر `RUN_EXTERNAL_TESTS=1` بعد التأكد من أن المفتاح صالح، ولا ترسل رسالة فعلية.

يجب إنشاء GitHub Actions Secrets بالأسماء نفسها، ثم إعادة تشغيل workflow. في Vercel تُضاف المتغيرات إلى **Project Settings → Environment Variables → Production**، مع التأكد من إعادة deployment بعد أي تغيير. لا تُنسخ قيم `.env` إلى GitHub ولا إلى ملفات الاختبار.

## Resend domain checklist

قبل الإنتاج، يجب توثيق نطاق المرسل في Resend وإضافة سجلات DNS التي يعرضها Resend، ثم استخدام عنوان مثل `contact@adrartoursime.tours` في `CONTACT_FROM_EMAIL`. فحص مفتاح الإرسال لا يثبت توثيق النطاق؛ يلزم تأكيد حالة النطاق من لوحة Resend أو من API بصلاحية تسمح بقراءة الدومينات.
