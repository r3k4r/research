import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          nav:{
            home: "Home",
            about: "About",
            courses: "Courses",
            contact: "Contact",
            contactUs: "Contact Us"
          },
          hero:{
            titlePartOne: "Connex",
            titlePartTwo: "Academy",
            quote:"Today is knowledge, tomorrow is success",
            button: "Courses"
          },
          about: {
            title:"About Connex Academy",
            about_one: "Connex Academy is a premier educational institution dedicated to offering a comprehensive array of courses designed to meet the diverse needs of today's learners. Our offerings include technical, management, business, design, engineering, and language courses, all delivered through engaging, face-to-face instruction.",
            about_two: "We pride ourselves on our qualified and passionate instructors, state-of-the-art facilities, and a supportive learning environment that encourages both personal and professional development. Whether you are looking to enhance your skills, pivot your career, or explore new interests, Connex Academy provides the resources and guidance to help you achieve your goals." ,
            about_three: "At Connex Academy, we believe in the power of education to transform lives. Join us and be part of a learning community that values excellence, innovation, and lifelong growth.",
            mission: "Our Mission",
            missionP: "at Connex Academy, our mission is to empower individuals with the knowledge and skills necessary to excel in their chosen fields. We are committed to delivering high-quality, face-to-face education through a diverse range of courses that cater to the evolving needs of the modern workforce. By fostering a dynamic learning environment, we aim to inspire lifelong learning and professional growth in our students",
            vision: "Our Vision",
            visionP:"Our vision is to become a leading educational institution recognized for its excellence in teaching, innovative curriculum, and impactful community engagement. We aspire to bridge the gap between education and industry by providing practical, hands-on learning experiences that prepare our students for real-world challenges. Through our dedicated efforts, we envision creating a community of empowered learners who drive positive change in their professions and society.",
          },
          course:{
            title: "Connex Academy Courses",
            viewAll: "View All",
            SearchPlaceholder: "Search...",
            viewMore:"View More",
            back:"Back"
        },
        contact:{
            title: "Contact Us",
            content: "Our customer service team is waiting to assist you",
            paragraph: " 'We're here to help with any questions or concerns you may have. Reach out to us via email, phone, or visit our location to speak directly with a member of our team. Your satisfaction is our top priority.' ",
            email: "Email",
            location: "Location",
            locationP: "Sulaimani, Salim Street, Salim Mall, Office A13",
            phone: "Phone",
            phoneP: "07716904422",
          },
          footer:{
            name: "Connex Academy",
            quote: "Connex Academy, Where today's knowledge leads to tomorrow's success.",
            quicklinks:"Quick Links",
            contactinfo:"Contact Info",

          },
          login:{
            head:"Sign in to your account",
            username : "Username",
            password : "Password",
            login: "Login",
            warning:"This username and password is belong to the admin...!"
          },
          addcourse:{
            courseInformation:"Course Information",
            name:"Name",
            description:"Description",
            imageURL:"Image",
            teacher:"Teacher",
            add:"Add",
            update:"Update",
            delete:"Delete"
          },
          courseRoute:{
            title:"Connex Academy Courses"
          }
          
        }
      },
      ku: {
        translation: {
          nav:{
            home: "سەرەکی",
            about: "دەربارە",
            courses: "کۆرسەکان",
            contact: "پەیوەندی کردن",
            contactUs: "پەیوەندیمان پێوە بکە"
          },
          hero:{
            titlePartOne: "کۆنێکس",
            titlePartTwo: "ئەکادیمیای",
            quote: "ئەمڕۆ مەعریفە، سبەی سەرکەوتن",
            button: "دەرسەکان"
          },
          about:{
            title: "دەربارەی کۆنێکس ئەکادیمی",
            about_one: "دەربارەی ئەکادیمیای کۆنێکس ئەکادیمیای کۆنێکس دامەزراوەیەکی پەروەردەیی سەرەکییە کە تایبەتە بە پێشکەشکردنی کۆمەڵێک خولی گشتگیر کە بۆ دابینکردنی پێداویستییە جۆراوجۆرەکانی فێرخوازانی ئەمڕۆ داڕێژراون. پێشکەشکردنەکانمان بریتین لە خولی تەکنیکی، بەڕێوەبردن، بازرگانی، دیزاین، ئەندازیاری و زمان، کە هەموویان لە ڕێگەی فێرکاری سەرنجڕاکێش و ڕووبەڕووەوە پێشکەش دەکرێن.",
            about_two: "ئێمە شانازی بە ڕاهێنەرە شارەزا و بەسۆزەکانمانەوە دەکەین، ئاسانکارییە پێشکەوتووەکانمان، و ژینگەیەکی فێرکاری پاڵپشت کە هاندەری گەشەپێدانی کەسی و پیشەیی بێت. جا تۆ بەدوای بەرزکردنەوەی لێهاتووییەکانتدا دەگەڕێیت، پیشەکەت بگۆڕیت، یان بەدوای بەرژەوەندییە نوێیەکاندا بگەڕێیت، ئەکادیمیای کۆنێکس سەرچاوە و ڕێنماییەکانت بۆ دابین دەکات بۆ ئەوەی یارمەتیت بدات بۆ گەیشتن بە ئامانجەکانت.",
            about_three: "لە ئەکادیمیای کۆنێکس باوەڕمان بە هێزی پەروەردە هەیە بۆ گۆڕینی ژیان. لەگەڵمان بن و بەشێک بن لە کۆمەڵگەیەکی فێرکاری کە بەهای باشی و داهێنان و گەشەکردنی تەواوی ژیان دەدات.",
            mission: "ئەرکی ئێمە",
            missionP: "لە ئەکادیمیای کۆنێکس، ئەرکمان بەهێزکردنی تاکەکانە بەو زانیاری و لێهاتووییانەی کە پێویستن بۆ ئەوەی لە بوارە هەڵبژێردراوەکانیاندا سەرکەوتوو بن. ئێمە پابەندین بە پێشکەشکردنی پەروەردەی کوالیتی بەرز و ڕووبەڕوو لە ڕێگەی کۆمەڵێک خولی جۆراوجۆرەوە کە پێداویستییە پەرەسەندووەکانی هێزی کاری مۆدێرن دابین دەکەن. بە پەروەردەکردنی ژینگەیەکی فێربوونی دینامیکی، ئامانجمان ئیلهام بەخشە بۆ فێربوونی تەواوی ژیان و گەشەکردنی پیشەیی لە خوێندکارەکانماندا",
            vision: "دیدگای ئێمە",
            visionP: "دیدگاکەمان ئەوەیە کە ببینە دامەزراوەیەکی پەروەردەیی پێشەنگ کە بەهۆی باشی خۆی لە وانەوتنەوە، مەنهەجی داهێنەرانە، و بەشداریکردنی کاریگەرانەی کۆمەڵگادا ناسراوە. ئێمە ئاواتەخوازین کەلێنی نێوان پەروەردە و پیشەسازی پڕ بکەینەوە بە پێشکەشکردنی ئەزموونی فێربوونی پراکتیکی و دەستی کە خوێندکارەکانمان بۆ ئاستەنگەکانی جیهانی ڕاستەقینە ئامادە دەکات. لە ڕێگەی هەوڵە تایبەتمەندەکانمانەوە، پێشبینی دروستکردنی کۆمەڵگەیەکی فێرخوازانی بەهێزکراو دەکەین کە گۆڕانکاری ئەرێنی لە پیشەکانیان و کۆمەڵگادا بباتە پێشەوە.",
          },
          course:{
            title: "کۆرسەکانی ئەکادیمیای کۆنێکس",
            viewAll: "هەمووی ببینە",
            SearchPlaceholder: "گەڕان...",
            viewMore:"زیاتر ببینە",
            back:"گەڕانەوە"
        },
        contact:{
          title:"پەیوەندیمان پێوە بکەن",
          content:"تیمی خزمەتگوزاری کڕیارەکانمان چاوەڕێی هاوکاریکردنتان دەکات",
          paragraph: " 'ئێمە لێرەین بۆ یارمەتیدان لە هەر پرسیارێک یان نیگەرانییەک کە لەوانەیە هەتبێت. لە ڕێگەی ئیمەیڵ، تەلەفۆن، یان سەردانی شوێنەکەمانەوە پەیوەندیمان پێوە بکەن بۆ ئەوەی ڕاستەوخۆ لەگەڵ ئەندامێکی تیمەکەمان قسە بکەن. ڕەزامەندی ئێوە لە پێشینەی کارەکانمانە.' ",
          email:"ئیمەیڵ",
          location:"ناوینیشان",
          locationP: "سلێمانی، شەقامی سالم، سالم مۆڵ ئۆفیسی A13",
          phone:"ژمارەی موبایل",
          phoneP:"٠٧٧١٦٩٠٤٤٢٢"
        },
        footer:{
          name: "ئەکادیمیای کۆنێکس",
          quote: "ئەکادیمیای کۆنێکس، کە زانیاری ئەمڕۆ دەبێتە هۆی سەرکەوتنی سبەی",
          quicklinks: "لینکی خێرا",
          contactinfo: "زانیاری پەیوەندیکردن",
        },
          login:{
            head:"چوونە ژوورەوە بۆ ئەکاونتەکەت",
            username:"ناوی بەکارهێنەر",
            password:"وشەی نهێنی",
            login:"تێپەڕ ژورەوە",
            warning:" ئەم ناوی بەکارهینەر و تێپەڕ وشەیە هی ئەدمینەکەیە...! "
          },
          addcourse:{
            courseInformation:"زانیاری کۆرسەکە",
            name:"ناو",
            description:"وەسف",
            imageURL:"وێنە",
            teacher:"مامۆستا",
            add:"زیاکردن",
            update:"نوێکردنەوە",
            delete:"سڕینەوە"
          },
          courseRoute:{
            title: "کۆرسەکانی ئەکادیمیای کۆنێکس",
          }
        }
      },
      ar: {
        translation: {
          nav:{
            home: "رئيسي",
            about: "حول",
            courses: "الدورات",
            contact: "اتصل",
            contactUs: "اتصل بنا"
          },
          hero:{
            titlePartOne: "كونيكس", 

            titlePartTwo: "أكاديمية",
            quote: "اليوم هو المعرفة، وغداً هو النجاح",
            button: "الدروس"
          },
          about:{
            title: "نبذة عن أكاديمية كونيكس",
            about_one: "أكاديمية كونيكس أكاديمية كونيكس هي مؤسسة تعليمية رائدة مخصصة لتقديم مجموعة شاملة من الدورات التدريبية المصممة لتلبية الاحتياجات المتنوعة لمتعلمي اليوم. تشمل عروضنا الدورات الفنية والإدارية والأعمال والتصميم والهندسة واللغات، وكلها تُقدم من خلال التعليم المباشر.",
            about_two: "نحن نفخر بمدربينا المؤهلين والعاطفيين والمرافق الحديثة وبيئة التعلم الداعمة التي تشجع على التطوير الشخصي والمهني. سواء كنت تتطلع إلى تعزيز مهاراتك أو تغيير مسار حياتك المهنية أو استكشاف اهتمامات جديدة، توفر أكاديمية كونيكس الموارد والتوجيه لمساعدتك على تحقيق أهدافك.",
            about_three: "في أكاديمية كونيكس، نؤمن بقوة التعليم في تحويل الحياة. انضم إلينا وكن جزءًا من مجتمع التعلم الذي يقدر التميز والابتكار والنمو مدى الحياة.",
            mission: "مهمتنا",
            missionP: "في أكاديمية كونيكس، تتمثل مهمتنا في تمكين الأفراد من المعرفة والمهارات اللازمة للتفوق في المجالات التي اختاروها. نحن ملتزمون بتقديم تعليم عالي الجودة وجهاً لوجه من خلال مجموعة متنوعة من الدورات التي تلبي الاحتياجات المتطورة للقوى العاملة الحديثة. من خلال تعزيز بيئة تعليمية ديناميكية، نهدف إلى إلهام التعلم مدى الحياة والنمو المهني",
            vision: "رؤيتنا",
            visionP: "رؤيتنا هي أن نصبح مؤسسة تعليمية رائدة معترف بها لتميزها في التدريس والمناهج المبتكرة والمشاركة المجتمعية المؤثرة. نطمح إلى سد الفجوة بين التعليم والصناعة من خلال توفير تجارب تعليمية عملية وعملية تعمل على إعداد طلابنا للتحديات في العالم الحقيقي. من خلال جهودنا الدؤوبة، نتصور إنشاء مجتمع من المتعلمين المتمكنين الذين يقودون التغيير الإيجابي في مهنهم ومجتمعهم."
          },
          course:{
              title: "دورات في أكاديمية كونيكس",
              viewAll: "عرض الكل",
              SearchPlaceholder: "ابحث...",
              viewMore:"عرض المزيد",
              back:"رجوع",
          },
          contact:{
            title: "اتصل بنا", 
            content:"فريق خدمة العملاء لدينا في انتظار مساعدتك",
            paragraph:" 'نحن هنا للمساعدة في أي أسئلة أو مخاوف قد تكون لديكم. تواصل معنا عبر البريد الإلكتروني أو الهاتف أو قم بزيارة موقعنا للتحدث مباشرة مع أحد أعضاء فريقنا. رضاكم هو أولويتنا القصوى.' ",
            email: "بريد إلكتروني",
            location: "موقع",
            locationP:"السليمانية، شارع سالم، سالم مول، مكتب A13 ",
            phone:"هاتف",
            phoneP:'٠٧٧١٦٩٠٤٤٢٢'
          },
          footer:{
            name: "أكاديمية كونيكس",
            quote: "أكاديمية كونيكس، حيث تؤدي معرفة اليوم إلى نجاح الغد. ",
            quicklinks:"روابط سريعة",
            contactinfo:"معلومات الاتصال",
          },
          login:{
            head:"تسجيل الدخول إلى حسابك",
            username: "اسم المستخدم",
            password: "كلمة المرور",
            login: "تسجيل الدخول",
            warning:"هذا اسم المستخدم وكلمة المرور تابعة للمسؤول...!"
          },
          addcourse:{
            courseInformation:"دورة معلومات",
            name:"اسم",
            description:"وصف",
            imageURL:"رابط الصورة",
            teacher:"مدرس",
            add:"يضيف",
            update:"تحديث",
            delete:"يمسح"
          },
          courseRoute:{
            title: "دورات في أكاديمية كونيكس",
          }
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });



export default i18n;