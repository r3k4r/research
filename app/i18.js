import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          hero:{
            titlePartOne: "Reducing Food Waste, One Meal at a Time",
            titlePartTwo: "We connect consumers with local businesses to save perfectly good food from going to waste, at a fraction of the original price.",
            buttonOne:"Explore Foods",
            buttonTwo: "For Providers"
          },
          mission:{
            title: "Tackling Food Waste Together",
            paragraph : "We're on a mission to create a sustainable food ecosystem that reduces waste, helps businesses, and provides affordable meals to communities.",
            cardOneTitle: "Last-Minute Savings",
            cardOneContent: "We help businesses sell surplus food before it's too late, turning potential waste into affordable meals.",
            cardTwoTitle: "Environmental Impact",
            CardTwoContent: "Every meal saved means less waste in landfills and a significant reduction in greenhouse gas emissions.",
            cardThreeTitle: "Community Support",
            cardThreeContent: "We're building a community that values sustainability, affordability, and reducing food waste together.",
          },
          stats : {
            title: "Our Impact",
            subTitile: "Together, we're making a difference",
            totalUsers : "Happy Users",
            ProviderPartners: "Provider Partners",
            FoodItemsSaved: "Food Items Saved",
            WasteReduction: "Waste Reduction",
          },
          services: {
            title: "How It Works",
            subtitle : "Simple steps to reduce food waste",
            discover: "Discover",
            discoverP: "Browse surplus food from local businesses at discounted prices.",
            reserve : "Reserve",
            reserveP: "Select and pay for your items through our secure platform.",
            pickup: "Pickup",
            pickupP: "Collect your food from the business during the specified time window.",
            button : "Start Exploring",
          },
          providers : {
            title: "",
          },
        }
      },
      ku: {
        translation: {
          hero:{
            titlePartOne: "کەمکردنەوەی بەفیڕۆدانی خۆراک، یەک ژەم لە یەک کاتدا",
            titlePartTwo: "ئێمە بەکارهێنەران بە بزنسە ناوخۆییەکانەوە دەبەستینەوە بۆ ئەوەی خۆراکی باش لە بەفیڕۆدان ڕزگار بکەین، بە نرخێکی داشکێنراو.",
            buttonOne:"گەڕان بەدوای خۆراکەکاندا",
            buttonTwo: "بۆ دابینکەرانی خۆراک"
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
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });



export default i18n;