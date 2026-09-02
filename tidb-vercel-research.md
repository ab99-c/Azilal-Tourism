# بحث ربط قاعدة بيانات جديدة بــ Vercel

## النتيجة
المشروع الحالي يستخدم Drizzle مع MySQL/TiDB، لذلك الخيار الأقل تغييراً هو TiDB Cloud Serverless عبر تكامل Vercel. صفحة Vercel الرسمية تذكر أن TiDB Cloud متوافق مع MySQL، وأن التكامل يضبط متغير `DATABASE_URL` في مشروع Vercel، مع إمكانية الحصول على ما يصل إلى خمس مجموعات مجانية غير متوقفة بحسب صفحة التكامل وقت البحث.

## خطوات TiDB الرسمية
تذكر وثائق TiDB الرسمية أن الربط يتم بإحدى طريقتين: تكامل TiDB Cloud داخل Vercel، أو إعداد المتغيرات يدوياً. للطريقة اليدوية: افتح My TiDB، اختر المورد، اضغط Connect، ثم انسخ بيانات الاتصال. الصيغة المطلوبة هي:

`mysql://<User>:<Password>@<Endpoint>:<Port>/<Database>?sslaccept=strict`

ثم يوضع الرابط في Vercel ضمن Project Settings → Environment Variables باسم `DATABASE_URL`.

## المصادر
- https://vercel.com/marketplace/tidb-cloud — TiDB Cloud for Vercel، توافق MySQL ومتغيرات الاتصال.
- https://docs.pingcap.com/tidbcloud/integrate-tidbcloud-with-vercel/ — دليل TiDB الرسمي لإنشاء cluster وربطه بـVercel.
