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
            pickup: "Delivery",
            pickupP: "Collect your food from the business during the specified time window.",
            button : "Start Exploring",
          },
          providers : {
            title: "For Food Providers",
            subtitle: "Join our platform to reduce your food waste, reach new customers, and boost your revenue.",
            pointOne: "Reduce food waste and associated costs",
            pointTwo: "Generate additional revenue from surplus food",
            pointThree : "Attract eco-conscious customers",
            pointFour : "Easy-to-use dashboard to manage your listings",
            pointFive : "Be part of the sustainability movement",
            button : "Become a Provider",
          },
          team : {
            title: "Our Team",
            subtitle: "Passionate about reducing food waste",
            nameOne: "Rekar Jamal",
            positionOne: "Founder & CEO",
            nameTwo: "Delav Wria",
            positionTwo: "Founder & CEO",
          }, 
          join: {
            title: "Ready to Join the Movement?",
            subtitle : "Whether you're a food provider or a conscious consumer, we'd love to have you on board.",
            button: "Find Food Near You",
            buttonTwo: "Contact Us",
          }
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
          mission:{
            title: "پێکەوە بەرەنگاری بەفیرۆدانی خۆراک دەبینەوە",
            paragraph : "ئێمە لە ئەرکێکداین بۆ دروستکردنی ئیکۆسیستەمێکی خۆراکی بەردەوام کە بەفیڕۆدان کەم بکاتەوە، یارمەتی بازرگانییەکان بدات، و ژەمە خۆراکی گونجاو بۆ کۆمەڵگاکان دابین بکات.",
            cardOneTitle: "پاشەکەوت کردن لە کۆتا خولەکەکاندا",
            cardOneContent: "ئێمە یارمەتی بازرگانەکان دەدەین پێش ئەوەی درەنگ بێت خۆراکی زیادە بفرۆشن، بەفیڕۆدانی ئەگەری دەگۆڕین بۆ ژەمە گونجاوەکان.",
            cardTwoTitle: "کاریگەری ژینگەیی",
            CardTwoContent: "هەر ژەمێک کە پاشەکەوت دەکرێت بە واتای کەمبوونەوەی پاشەڕۆ لە زبڵدانەکاندا و کەمبوونەوەی بەرچاوی دەردانی گازی گەرمخانەیی.",
            cardThreeTitle: "پشتیوانی کۆمەڵگا",
            cardThreeContent: "ئێمە کۆمەڵگەیەک دروست دەکەین کە بەهای بەردەوامیی، گونجاوی و کەمکردنەوەی بەفیڕۆدانی خۆراک پێکەوە دەدات.",
          },
          stats : {
            title: "کاریگەری ئێمە",
            subTitile: "ئێمە پێکەوە جیاوازی دروست دەکەین",
            totalUsers : "بەکارهێنەرانی دڵخۆش",
            ProviderPartners: "هاوبەشانی دابینکەر",
            FoodItemsSaved: "شتومەکی خۆراک پاشەکەوت کراوە",
            WasteReduction: "کەمکردنەوەی پاشماوە",
          },
          services: {
            title: "چۆن کاردەکات",
            subtitle : "هەنگاوی سادە بۆ کەمکردنەوەی بەفیڕۆدانی خۆراک",
            discover: "دۆزینەوە",
            discoverP: "گەڕان بە خواردنی زیادە لە بازرگانییە ناوخۆییەکان بە نرخێکی داشکاندراو.",
            reserve : "حەجزکردن",
            reserveP: "لە ڕێگەی پلاتفۆرمی پارێزراومانەوە شتەکانت هەڵبژێرە و پارە بدە.",
            pickup: "گەیاندن",
            pickupP: "خواردنەکانت لە بزنسەکە کۆبکەرەوە لە ماوەی پەنجەرەی کاتی دیاریکراودا.",
            button : "دەست بکە بە گەڕان",
          },
          providers : {
            title: "دەست بکە بە گەڕان بۆ دابینکەرانی خۆراک",
            subtitle: "بەشداری پلاتفۆرمەکەمان بکە بۆ کەمکردنەوەی بەفیڕۆدانی خۆراکەکانت، گەیشتن بە کڕیارە نوێیەکان، و بەرزکردنەوەی داهاتەکەت.",
            pointOne: "کەمکردنەوەی بەفیڕۆدانی خۆراک و تێچووی پەیوەندیدار",
            pointTwo: "داهاتی زیاتر لە خۆراکی زیادە دروست بکە",
            pointThree : "کڕیارانی هۆشیاری ژینگەیی ڕابکێشن",
            pointFour : "داشبۆردێکی ئاسان بۆ بەڕێوەبردنی لیستەکانت",
            pointFive : "بەشێک بە لە بزووتنەوەی بەردەوامی",
            button : "ببە بە دابینکەر",
          },
          team : {
            title: "تیمەکەمان",
            subtitle: "خولیای کەمکردنەوەی بەفیڕۆدانی خۆراک",
            nameOne: "ڕێکار جەمال",
            positionOne: "Founder & CEO",
            nameTwo: "دێلاڤ وریا",
            positionTwo: "Founder & CEO",
          }, 
          join: {
            title: "ئامادەیت بۆ بەشداریکردن لە بزووتنەوەکە؟",
            subtitle : "جا تۆ دابینکەری خۆراک بیت یان بەکارهێنەرێکی هۆشیار، ئێمە زۆرمان پێ خۆشە تۆ لەناو فڕۆکەکەدا بیت.",
            button: "خواردن لە نزیک خۆت بدۆزەرەوە",
            buttonTwo: "پەیوەندیمان پێوە بکە",
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