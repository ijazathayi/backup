// Seed data for all topics, candlesticks, quiz, glossary
// Bilingual: English + Tamil

const topics = [
  {
    id: 1,
    category: "basics",
    title: { en: "What is Stock Market?", ta: "பங்கு சந்தை என்றால் என்ன?" },
    description: {
      en: "A stock market is a place where buyers and sellers trade shares of publicly listed companies. It allows companies to raise capital and investors to earn returns.",
      ta: "பங்கு சந்தை என்பது பொதுவில் பட்டியலிடப்பட்ட நிறுவனங்களின் பங்குகளை வாங்குவோர் மற்றும் விற்பவர்கள் வர்த்தகம் செய்யும் இடமாகும். இது நிறுவனங்களுக்கு மூலதனம் திரட்டவும், முதலீட்டாளர்களுக்கு லாபம் பெறவும் உதவுகிறது."
    },
    keyPoints: {
      en: ["BSE and NSE are major Indian stock exchanges", "Stocks represent ownership in a company", "Prices change based on supply and demand", "You can buy/sell during market hours (9:15 AM - 3:30 PM IST)"],
      ta: ["BSE மற்றும் NSE முக்கிய இந்திய பங்கு வர்த்தக நிலையங்கள்", "பங்குகள் ஒரு நிறுவனத்தில் உரிமையை குறிக்கின்றன", "விலைகள் தேவை மற்றும் விநியோகத்தின் அடிப்படையில் மாறும்", "சந்தை நேரத்தில் வாங்கலாம்/விற்கலாம் (காலை 9:15 - மாலை 3:30 IST)"]
    },
    icon: "📈",
    difficulty: "beginner",
    readTime: 5
  },
  {
    id: 2,
    category: "basics",
    title: { en: "Types of Trading", ta: "வர்த்தகத்தின் வகைகள்" },
    description: {
      en: "There are several types of trading strategies based on the time frame and style of the trader. Understanding each type helps you choose the right approach for your goals.",
      ta: "வர்த்தகரின் நேர அட்டவணை மற்றும் பாணியின் அடிப்படையில் பல வகையான வர்த்தக உத்திகள் உள்ளன. ஒவ்வொரு வகையையும் புரிந்துகொள்வது உங்கள் இலக்குகளுக்கு சரியான அணுகுமுறையை தேர்வு செய்ய உதவுகிறது."
    },
    keyPoints: {
      en: ["Intraday Trading: Buy and sell within the same day", "Swing Trading: Hold for days to weeks", "Positional Trading: Hold for weeks to months", "Long-term Investing: Hold for years"],
      ta: ["இன்ட்ராடே வர்த்தகம்: அதே நாளில் வாங்கி விற்பது", "ஸ்விங் வர்த்தகம்: சில நாட்கள் முதல் வாரங்கள் வரை வைத்திருப்பது", "பொசிஷனல் வர்த்தகம்: வாரங்கள் முதல் மாதங்கள் வரை", "நீண்ட கால முதலீடு: பல ஆண்டுகள் வரை"]
    },
    icon: "🔄",
    difficulty: "beginner",
    readTime: 6
  },
  {
    id: 3,
    category: "basics",
    title: { en: "Understanding Charts", ta: "விளக்கப்படங்களை புரிந்துகொள்வது" },
    description: {
      en: "Charts are visual representations of price movements over time. They are the primary tool for technical analysis and help traders identify trends and patterns.",
      ta: "விளக்கப்படங்கள் காலப்போக்கில் விலை இயக்கங்களின் காட்சி பிரதிநிதித்துவங்கள். அவை தொழில்நுட்ப பகுப்பாய்வுக்கான முதன்மை கருவி மற்றும் வர்த்தகர்கள் போக்குகள் மற்றும் வடிவங்களை அடையாளம் காண உதவுகின்றன."
    },
    keyPoints: {
      en: ["Line Chart: Simple price line over time", "Bar Chart: Shows open, high, low, close", "Candlestick Chart: Most popular — shows OHLC with colors", "Time frames: 1min, 5min, 15min, 1hr, Daily, Weekly"],
      ta: ["கோடு விளக்கப்படம்: காலப்போக்கில் எளிய விலை கோடு", "பார் விளக்கப்படம்: திறப்பு, உயர்வு, தாழ்வு, மூடுதல் காட்டுகிறது", "கேண்டில்ஸ்டிக் விளக்கப்படம்: மிகவும் பிரபலமானது — நிறங்களுடன் OHLC காட்டுகிறது", "நேர அட்டவணைகள்: 1நிமிடம், 5நிமிடம், 15நிமிடம், 1மணி, தினசரி, வாராந்திர"]
    },
    icon: "📊",
    difficulty: "beginner",
    readTime: 7
  },
  {
    id: 4,
    category: "basics",
    title: { en: "Support and Resistance", ta: "ஆதரவு மற்றும் எதிர்ப்பு" },
    description: {
      en: "Support is a price level where a stock tends to stop falling and bounce back up. Resistance is a level where the price tends to stop rising and reverse downward. These are key concepts in technical analysis.",
      ta: "ஆதரவு என்பது ஒரு விலை நிலை, அங்கு ஒரு பங்கு விழுவதை நிறுத்தி மேலே திரும்பும். எதிர்ப்பு என்பது விலை உயர்வதை நிறுத்தி கீழே திரும்பும் நிலை. இவை தொழில்நுட்ப பகுப்பாய்வில் முக்கிய கருத்துக்கள்."
    },
    keyPoints: {
      en: ["Support = floor for price", "Resistance = ceiling for price", "When support breaks it becomes resistance", "Strong levels are tested multiple times", "Use horizontal lines to mark these levels"],
      ta: ["ஆதரவு = விலைக்கான தளம்", "எதிர்ப்பு = விலைக்கான கூரை", "ஆதரவு உடைந்தால் அது எதிர்ப்பாக மாறும்", "வலுவான நிலைகள் பலமுறை சோதிக்கப்படும்", "இந்த நிலைகளை குறிக்க கிடைமட்ட கோடுகளை பயன்படுத்துங்கள்"]
    },
    icon: "🏗️",
    difficulty: "intermediate",
    readTime: 8
  },
  {
    id: 5,
    category: "indicators",
    title: { en: "Moving Averages (MA)", ta: "நகரும் சராசரி (MA)" },
    description: {
      en: "A moving average smooths out price data to identify the direction of the trend. It is calculated by averaging the closing prices over a set number of periods.",
      ta: "நகரும் சராசரி விலை தரவை சமன் செய்து போக்கின் திசையை அடையாளம் காண உதவுகிறது. இது குறிப்பிட்ட எண்ணிக்கையிலான காலங்களில் மூடும் விலைகளை சராசரியாக கணக்கிட்டு கணக்கிடப்படுகிறது."
    },
    keyPoints: {
      en: ["SMA (Simple Moving Average): Equal weight to all periods", "EMA (Exponential MA): More weight to recent prices", "20 EMA: Short-term trend", "50 SMA: Medium-term trend", "200 SMA: Long-term trend", "Golden Cross: 50MA crosses above 200MA (bullish)"],
      ta: ["SMA (எளிய நகரும் சராசரி): அனைத்து காலங்களுக்கும் சம எடை", "EMA (அதிகபடியான MA): சமீபத்திய விலைகளுக்கு அதிக எடை", "20 EMA: குறுகிய கால போக்கு", "50 SMA: நடுத்தர கால போக்கு", "200 SMA: நீண்ட கால போக்கு", "கோல்டன் கிராஸ்: 50MA 200MA க்கு மேல் கடக்கும் (நேர்மறை)"]
    },
    icon: "📉",
    difficulty: "intermediate",
    readTime: 10
  },
  {
    id: 6,
    category: "indicators",
    title: { en: "RSI - Relative Strength Index", ta: "RSI - தொடர்பு வலிமை குறியீடு" },
    description: {
      en: "RSI is a momentum indicator that measures the speed and change of price movements. It oscillates between 0 and 100 and helps identify overbought or oversold conditions.",
      ta: "RSI என்பது விலை இயக்கங்களின் வேகம் மற்றும் மாற்றத்தை அளவிடும் ஒரு மொமென்டம் குறியீடு. இது 0 முதல் 100 வரை ஊசலாடுகிறது மற்றும் அதிகமாக வாங்கப்பட்ட அல்லது அதிகமாக விற்கப்பட்ட நிலைமைகளை அடையாளம் காண உதவுகிறது."
    },
    keyPoints: {
      en: ["RSI above 70 = Overbought (may fall)", "RSI below 30 = Oversold (may rise)", "RSI = 50 = Neutral", "14-period RSI is standard", "Divergence signals trend reversal"],
      ta: ["RSI 70க்கு மேல் = அதிக வாங்கல் (விழலாம்)", "RSI 30க்கு கீழ் = அதிக விற்பனை (உயரலாம்)", "RSI = 50 = நடுநிலை", "14-காலகட்ட RSI நிலையானது", "டைவர்ஜென்ஸ் போக்கு திரும்புதலை சமிக்ஞை செய்கிறது"]
    },
    icon: "⚡",
    difficulty: "intermediate",
    readTime: 9
  },
  {
    id: 7,
    category: "risk",
    title: { en: "Risk Management", ta: "ஆபத்து மேலாண்மை" },
    description: {
      en: "Risk management is the most important skill for any trader. It protects your capital from large losses and ensures you can continue trading even after bad trades.",
      ta: "ஆபத்து மேலாண்மை எந்த வர்த்தகருக்கும் மிக முக்கியமான திறன். இது உங்கள் மூலதனை பெரிய இழப்புகளிலிருந்து பாதுகாக்கிறது மற்றும் மோசமான வர்த்தகங்களுக்குப் பிறகும் நீங்கள் வர்த்தகம் தொடர முடியும் என்பதை உறுதி செய்கிறது."
    },
    keyPoints: {
      en: ["Never risk more than 1-2% of capital per trade", "Always use Stop Loss orders", "Risk:Reward ratio should be at least 1:2", "Diversify across different stocks/sectors", "Never trade with money you cannot afford to lose"],
      ta: ["ஒரு வர்த்தகத்தில் மூலதனத்தில் 1-2% க்கும் அதிகமாக ஆபத்தில் வேண்டாம்", "எப்போதும் ஸ்டாப் லாஸ் ஆர்டர்களை பயன்படுத்துங்கள்", "ஆபத்து:வெகுமதி விகிதம் குறைந்தது 1:2 ஆக இருக்க வேண்டும்", "வெவ்வேறு பங்குகள்/துறைகளில் பரப்புங்கள்", "இழக்க முடியாத பணத்தில் வர்த்தகம் செய்யாதீர்கள்"]
    },
    icon: "🛡️",
    difficulty: "beginner",
    readTime: 8
  },
  {
    id: 8,
    category: "psychology",
    title: { en: "Trading Psychology", ta: "வர்த்தக உளவியல்" },
    description: {
      en: "Trading psychology refers to the emotions and mental states that drive trading decisions. Fear and greed are the two most common emotions that lead to poor trading decisions.",
      ta: "வர்த்தக உளவியல் என்பது வர்த்தக முடிவுகளை இயக்கும் உணர்ச்சிகள் மற்றும் மன நிலைகளை குறிக்கிறது. பயம் மற்றும் பேராசை ஆகியவை மோசமான வர்த்தக முடிவுகளுக்கு வழிவகுக்கும் இரண்டு பொதுவான உணர்ச்சிகள்."
    },
    keyPoints: {
      en: ["Fear leads to exiting trades too early", "Greed leads to holding losing trades too long", "FOMO (Fear of Missing Out) is dangerous", "Keep a trading journal to track emotions", "Stick to your trading plan always"],
      ta: ["பயம் வர்த்தகங்களை மிகவும் சீக்கிரம் வெளியேறுவதற்கு வழிவகுக்கிறது", "பேராசை தோல்வியடைந்த வர்த்தகங்களை மிக நீண்ட காலம் வைத்திருக்க வழிவகுக்கிறது", "FOMO (தவறும் பயம்) ஆபத்தானது", "உணர்ச்சிகளை கண்காணிக்க வர்த்தக ஜர்னல் வைத்திருங்கள்", "எப்போதும் உங்கள் வர்த்தக திட்டத்தில் ஒட்டிக்கொள்ளுங்கள்"]
    },
    icon: "🧠",
    difficulty: "beginner",
    readTime: 7
  },
  {
    id: 9,
    category: "indicators",
    title: { en: "Fibonacci Retracement", ta: "ஃபிபோனாச்சி ரிட்ரேஸ்மென்ட்" },
    description: {
      en: "A technical analysis tool using horizontal lines to indicate where possible support and resistance levels are. Based on Fibonacci numbers (23.6%, 38.2%, 61.8%).",
      ta: "சாத்தியமான ஆதரவு மற்றும் எதிர்ப்பு நிலைகள் எங்கு உள்ளன என்பதைக் குறிக்க கிடைமட்ட கோடுகளைப் பயன்படுத்தும் தொழில்நுட்ப பகுப்பாய்வு கருவி. ஃபிபோனாச்சி எண்களின் அடிப்படையில் (23.6%, 38.2%, 61.8%)."
    },
    keyPoints: {
      en: ["Used to find entry levels during a pullback", "61.8% is considered the 'Golden Ratio'", "Often combined with candlestick patterns for confirmation"],
      ta: ["திரும்பி வரும் போது நுழைவு நிலைகளைக் கண்டறியப் பயன்படுகிறது", "61.8% 'கோல்டன் ரேஷியோ' என்று கருதப்படுகிறது", "உறுதிப்படுத்தலுக்காக மெழுகுதிரி வடிவங்களுடன் அடிக்கடி இணைக்கப்படுகிறது"]
    },
    icon: "📐",
    difficulty: "advanced",
    readTime: 12
  },
  {
    id: 10,
    category: "basics",
    title: { en: "Price Action Trading", ta: "விலை நடவடிக்கை வர்த்தகம்" },
    description: {
      en: "Trading based purely on naked charts and price movements without relying heavily on lagging indicators. It focuses on market structure, trendlines, and support/resistance.",
      ta: "பின்தங்கிய குறிகாட்டிகளை பெரிதும் நம்பாமல் தூய விளக்கப்படங்கள் மற்றும் விலை இயக்கங்களின் அடிப்படையில் வர்த்தகம் செய்தல். இது சந்தை அமைப்பு, ட்ரெண்ட்லைன்கள் மற்றும் ஆதரவு/எதிர்ப்பு ஆகியவற்றில் கவனம் செலுத்துகிறது."
    },
    keyPoints: {
      en: ["Naked charts without messy indicators", "Focuses on Higher Highs and Lower Lows", "Uses candlestick patterns as primary signals"],
      ta: ["குழப்பமான குறிகாட்டிகள் இல்லாத தூய விளக்கப்படங்கள்", "அதிகமான உயர்வுகள் மற்றும் குறைவான தாழ்வுகளில் கவனம் செலுத்துகிறது", "மெழுகுதிரி வடிவங்களை முதன்மை சமிக்ஞைகளாகப் பயன்படுத்துகிறது"]
    },
    icon: "👁️",
    difficulty: "advanced",
    readTime: 15
  },
  {
    id: 11,
    category: "risk",
    title: { en: "Options & Derivatives", ta: "விருப்பங்கள் மற்றும் வழித்தோன்றல்கள்" },
    description: {
      en: "Derivatives are financial contracts whose value is linked to the value of an underlying asset. Options give the right, but not the obligation, to buy or sell an asset at a set price.",
      ta: "வழித்தோன்றல்கள் என்பவை ஒரு அடிப்படை சொத்தின் மதிப்புடன் இணைக்கப்பட்ட நிதி ஒப்பந்தங்கள். விருப்பங்கள் ஒரு சொத்தை குறிப்பிட்ட விலையில் வாங்குவதற்கு அல்லது விற்பதற்கான உரிமையை அளிக்கின்றன, ஆனால் கடமையை அல்ல."
    },
    keyPoints: {
      en: ["Calls: Right to buy", "Puts: Right to sell", "High risk, high reward potential", "Time decay (Theta) affects option pricing"],
      ta: ["அழைப்புகள் (Calls): வாங்குவதற்கான உரிமை", "புட்ஸ் (Puts): விற்பதற்கான உரிமை", "அதிக ஆபத்து, அதிக வெகுமதி சாத்தியம்", "நேர சிதைவு (Theta) விருப்ப விலை நிர்ணயத்தை பாதிக்கிறது"]
    },
    icon: "📜",
    difficulty: "pro",
    readTime: 20
  },
  {
    id: 12,
    category: "basics",
    title: { en: "Institutional Order Flow", ta: "நிறுவன ஆர்டர் ஓட்டம்" },
    description: {
      en: "Understanding how banks and large institutions trade. They leave footprints in volume and price action. Trading with institutional flow increases success rate.",
      ta: "வங்கிகள் மற்றும் பெரிய நிறுவனங்கள் எவ்வாறு வர்த்தகம் செய்கின்றன என்பதைப் புரிந்துகொள்வது. அவர்கள் அளவு மற்றும் விலை நடவடிக்கைகளில் தடயங்களை விட்டுச் செல்கிறார்கள். நிறுவன ஓட்டத்துடன் வர்த்தகம் செய்வது வெற்றி விகிதத்தை அதிகரிக்கிறது."
    },
    keyPoints: {
      en: ["Smart Money Concepts (SMC)", "Liquidity grabs and stop hunts", "Fair Value Gaps (FVG) and Order Blocks"],
      ta: ["ஸ்மார்ட் மனி கான்செப்ட்ஸ் (SMC)", "பணப்புழக்க ஈர்ப்புகள் மற்றும் ஸ்டாப் ஹண்ட்ஸ்", "நியாயமான மதிப்பு இடைவெளிகள் (FVG) மற்றும் ஆர்டர் பிளாக்குகள்"]
    },
    icon: "🏦",
    difficulty: "pro",
    readTime: 18
  },
  {
    id: 13,
    category: "execution",
    title: { en: "Brokerage & Order Types", ta: "தரகர் மற்றும் ஆர்டர் வகைகள்" },
    description: {
      en: "The mechanics of live trading. Understanding brokers, demat accounts, taxes (STT), and how to execute Market, Limit, and Stop-Loss orders.",
      ta: "நேரடி வர்த்தகத்தின் இயக்கவியல். தரகர்கள், டீமேட் கணக்குகள், வரிகள் (STT) மற்றும் மார்க்கெட், லிமிட் மற்றும் ஸ்டாப்-லாஸ் ஆர்டர்களை எவ்வாறு செயல்படுத்துவது என்பதைப் புரிந்துகொள்வது."
    },
    keyPoints: {
      en: ["Market vs Limit Orders", "Stop-Loss (SL) & GTT Orders", "Understanding bid-ask spread and slippage"],
      ta: ["மார்க்கெட் vs லிமிட் ஆர்டர்கள்", "ஸ்டாப்-லாஸ் (SL) & GTT ஆர்டர்கள்", "பிட்-ஆஸ்க் ஸ்ப்ரெட் மற்றும் ஸ்லிப்பேஜ் புரிந்துகொள்வது"]
    },
    icon: "💻",
    difficulty: "execution",
    readTime: 12
  },
  {
    id: 14,
    category: "execution",
    title: { en: "Paper Trading & Sizing", ta: "காகித வர்த்தகம் & அளவு" },
    description: {
      en: "Before risking real money, you must test your strategy. Paper trading lets you practice. Position sizing ensures you survive losing streaks.",
      ta: "உண்மையான பணத்தை ஆபத்தில் வைப்பதற்கு முன், உங்கள் உத்தியை சோதிக்க வேண்டும். காகித வர்த்தகம் உங்களை பயிற்சி செய்ய அனுமதிக்கிறது. நிலை அளவு நீங்கள் இழப்புகளைத் தப்பிப்பிழைக்க உதவுகிறது."
    },
    keyPoints: {
      en: ["Backtest strategies before live trading", "Never risk more than 1% of capital per trade", "Calculate quantity based on Stop-Loss"],
      ta: ["நேரடி வர்த்தகத்திற்கு முன் உத்திகளை சோதிக்கவும்", "ஒரு வர்த்தகத்திற்கு மூலதனத்தின் 1% க்கும் அதிகமாக ஆபத்தில் வைக்க வேண்டாம்", "ஸ்டாப்-லாஸ் அடிப்படையில் அளவைக் கணக்கிடுங்கள்"]
    },
    icon: "📝",
    difficulty: "execution",
    readTime: 10
  },
  {
    id: 15,
    category: "execution",
    title: { en: "Live Trading Psychology", ta: "நேரடி வர்த்தக உளவியல்" },
    description: {
      en: "Real money brings real emotions. Managing FOMO, revenge trading, and the discipline to follow your pre-market checklist and journal.",
      ta: "உண்மையான பணம் உண்மையான உணர்ச்சிகளைக் கொண்டுவருகிறது. FOMO, பழிவாங்கும் வர்த்தகம் மற்றும் உங்கள் முன்-சந்தை சரிபார்ப்பு பட்டியல் மற்றும் பத்திரிகையைப் பின்பற்றுவதற்கான ஒழுக்கத்தை நிர்வகித்தல்."
    },
    keyPoints: {
      en: ["Don't revenge trade after a big loss", "Maintain a daily trading journal", "Have a strict pre-market routine"],
      ta: ["பெரிய இழப்பிற்குப் பிறகு பழிவாங்கும் வர்த்தகம் செய்ய வேண்டாம்", "தினசரி வர்த்தக ஜர்னலை பராமரிக்கவும்", "கண்டிப்பான முன்-சந்தை வழக்கத்தைக் கொண்டிருங்கள்"]
    },
    icon: "🧘",
    difficulty: "execution",
    readTime: 15
  }
];

const candlesticks = [
  {
    id: 1,
    name: { en: "Doji", ta: "டோஜி" },
    type: "neutral",
    pattern: "single",
    description: {
      en: "A Doji forms when the opening and closing prices are virtually equal, creating a cross or plus-sign shape. It signals indecision in the market — neither buyers nor sellers are in control.",
      ta: "டோஜி உருவாகும்போது திறப்பு மற்றும் மூடும் விலைகள் கிட்டத்தட்ட சமம், ஒரு சிலுவை அல்லது பிளஸ் குறி வடிவத்தை உருவாக்குகிறது. இது சந்தையில் முடிவின்மையை சமிக்ஞை செய்கிறது — வாங்குவோர் அல்லது விற்பவர்கள் யாரும் கட்டுப்பாட்டில் இல்லை."
    },
    signal: { en: "Indecision / Reversal possible", ta: "முடிவின்மை / திரும்புதல் சாத்தியம்" },
    psychology: { en: "Market is undecided. Watch for the next candle to confirm direction.", ta: "சந்தை முடிவு செய்யவில்லை. திசையை உறுதிப்படுத்த அடுத்த மெழுகுதிரியை கவனியுங்கள்." },
    emoji: "➕",
    color: "#9B59B6",
    bodySize: "none",
    shadowSize: "equal",
    bullishBearish: "neutral"
  },
  {
    id: 2,
    name: { en: "Hammer", ta: "சுத்தி" },
    type: "bullish",
    pattern: "single",
    description: {
      en: "A Hammer has a small body at the top and a long lower shadow (wick) that is at least 2x the body size. It appears after a downtrend and signals a potential reversal to the upside.",
      ta: "சுத்தியில் மேலே ஒரு சிறிய உடல் மற்றும் குறைந்தது 2x உடல் அளவு கொண்ட நீண்ட கீழ் நிழல் (விக்) உள்ளது. இது கீழ்நோக்கிய போக்கிற்கு பிறகு தோன்றி மேல்நோக்கிய திரும்புதலுக்கான சாத்தியத்தை சமிக்ஞை செய்கிறது."
    },
    signal: { en: "Bullish reversal after downtrend", ta: "கீழ்நோக்கிய போக்கிற்கு பிறகு நேர்மறை திரும்புதல்" },
    psychology: { en: "Sellers pushed price down but buyers fought back strongly, closing near the open.", ta: "விற்பவர்கள் விலையை கீழே தள்ளினர், ஆனால் வாங்குவோர் வலுவாக எதிர்த்து திறப்புக்கு அருகில் மூடினர்." },
    emoji: "🔨",
    color: "#27AE60",
    bodySize: "small",
    shadowSize: "long-lower",
    bullishBearish: "bullish"
  },
  {
    id: 3,
    name: { en: "Shooting Star", ta: "ஷூட்டிங் ஸ்டார்" },
    type: "bearish",
    pattern: "single",
    description: {
      en: "A Shooting Star has a small body at the bottom and a long upper shadow. It appears after an uptrend and signals a potential reversal to the downside. It is the opposite of a Hammer.",
      ta: "ஷூட்டிங் ஸ்டாரில் கீழே ஒரு சிறிய உடல் மற்றும் நீண்ட மேல் நிழல் உள்ளது. இது மேல்நோக்கிய போக்கிற்கு பிறகு தோன்றி கீழ்நோக்கிய திரும்புதலுக்கான சாத்தியத்தை சமிக்ஞை செய்கிறது. இது சுத்தியின் எதிர்மாறானது."
    },
    signal: { en: "Bearish reversal after uptrend", ta: "மேல்நோக்கிய போக்கிற்கு பிறகு எதிர்மறை திரும்புதல்" },
    psychology: { en: "Buyers pushed price up but sellers overwhelmed them, closing near the open.", ta: "வாங்குவோர் விலையை மேலே தள்ளினர், ஆனால் விற்பவர்கள் அவர்களை மிகைத்தனர், திறப்புக்கு அருகில் மூடினர்." },
    emoji: "⭐",
    color: "#E74C3C",
    bodySize: "small",
    shadowSize: "long-upper",
    bullishBearish: "bearish"
  },
  {
    id: 4,
    name: { en: "Bullish Engulfing", ta: "புல்லிஷ் எங்குல்ஃபிங்" },
    type: "bullish",
    pattern: "double",
    description: {
      en: "A Bullish Engulfing pattern consists of two candles. The first is a small bearish (red) candle followed by a large bullish (green) candle that completely engulfs the first one. Strong reversal signal.",
      ta: "புல்லிஷ் எங்குல்ஃபிங் வடிவம் இரண்டு மெழுகுதிரிகளை கொண்டுள்ளது. முதலாவது ஒரு சிறிய எதிர்மறை (சிவப்பு) மெழுகுதிரி, அதைத் தொடர்ந்து முதலாவதை முற்றிலும் விழுங்கும் ஒரு பெரிய நேர்மறை (பச்சை) மெழுகுதிரி. வலுவான திரும்புதல் சமிக்ஞை."
    },
    signal: { en: "Strong bullish reversal", ta: "வலுவான நேர்மறை திரும்புதல்" },
    psychology: { en: "Bulls completely overpowered bears — strong buying pressure entered the market.", ta: "காளைகள் கரடிகளை முற்றிலும் மிகைத்தனர் — சந்தையில் வலுவான வாங்குதல் அழுத்தம் நுழைந்தது." },
    emoji: "🟢",
    color: "#27AE60",
    bodySize: "large",
    shadowSize: "minimal",
    bullishBearish: "bullish"
  },
  {
    id: 5,
    name: { en: "Bearish Engulfing", ta: "பியரிஷ் எங்குல்ஃபிங்" },
    type: "bearish",
    pattern: "double",
    description: {
      en: "The opposite of Bullish Engulfing. A small bullish candle followed by a large bearish candle that engulfs it. Appears after an uptrend and signals strong selling pressure.",
      ta: "புல்லிஷ் எங்குல்ஃபிங்கின் எதிர்மாறானது. ஒரு சிறிய நேர்மறை மெழுகுதிரியை தொடர்ந்து அதை விழுங்கும் ஒரு பெரிய எதிர்மறை மெழுகுதிரி. மேல்நோக்கிய போக்கிற்கு பிறகு தோன்றி வலுவான விற்பனை அழுத்தத்தை சமிக்ஞை செய்கிறது."
    },
    signal: { en: "Strong bearish reversal", ta: "வலுவான எதிர்மறை திரும்புதல்" },
    psychology: { en: "Bears completely overpowered bulls — strong selling pressure entered the market.", ta: "கரடிகள் காளைகளை முற்றிலும் மிகைத்தனர் — சந்தையில் வலுவான விற்பனை அழுத்தம் நுழைந்தது." },
    emoji: "🔴",
    color: "#E74C3C",
    bodySize: "large",
    shadowSize: "minimal",
    bullishBearish: "bearish"
  },
  {
    id: 6,
    name: { en: "Morning Star", ta: "மார்னிங் ஸ்டார்" },
    type: "bullish",
    pattern: "triple",
    description: {
      en: "A Morning Star is a three-candle pattern: a large bearish candle, a small-bodied candle (Doji or spinning top), and a large bullish candle. It signals the end of a downtrend.",
      ta: "மார்னிங் ஸ்டார் மூன்று மெழுகுதிரி வடிவம்: ஒரு பெரிய எதிர்மறை மெழுகுதிரி, ஒரு சிறிய உடல் மெழுகுதிரி (டோஜி அல்லது ஸ்பின்னிங் டாப்), மற்றும் ஒரு பெரிய நேர்மறை மெழுகுதிரி. இது கீழ்நோக்கிய போக்கின் முடிவை சமிக்ஞை செய்கிறது."
    },
    signal: { en: "End of downtrend, bullish reversal", ta: "கீழ்நோக்கிய போக்கின் முடிவு, நேர்மறை திரும்புதல்" },
    psychology: { en: "Selling exhausted (day 1), indecision (day 2), buyers take control (day 3).", ta: "விற்பனை தீர்ந்தது (நாள் 1), முடிவின்மை (நாள் 2), வாங்குவோர் கட்டுப்பாடு எடுக்கின்றனர் (நாள் 3)." },
    emoji: "🌅",
    color: "#F39C12",
    bodySize: "mixed",
    shadowSize: "mixed",
    bullishBearish: "bullish"
  },
  {
    id: 7,
    name: { en: "Evening Star", ta: "ஈவினிங் ஸ்டார்" },
    type: "bearish",
    pattern: "triple",
    description: {
      en: "The opposite of Morning Star. Three candles: large bullish, small-bodied, large bearish. Appears at the top of an uptrend and signals reversal to the downside.",
      ta: "மார்னிங் ஸ்டாரின் எதிர்மாறானது. மூன்று மெழுகுதிரிகள்: பெரிய நேர்மறை, சிறிய உடல், பெரிய எதிர்மறை. மேல்நோக்கிய போக்கின் உச்சியில் தோன்றி கீழ்நோக்கிய திரும்புதலை சமிக்ஞை செய்கிறது."
    },
    signal: { en: "End of uptrend, bearish reversal", ta: "மேல்நோக்கிய போக்கின் முடிவு, எதிர்மறை திரும்புதல்" },
    psychology: { en: "Buying exhausted (day 1), indecision (day 2), sellers take control (day 3).", ta: "வாங்குதல் தீர்ந்தது (நாள் 1), முடிவின்மை (நாள் 2), விற்பவர்கள் கட்டுப்பாடு எடுக்கின்றனர் (நாள் 3)." },
    emoji: "🌆",
    color: "#E74C3C",
    bodySize: "mixed",
    shadowSize: "mixed",
    bullishBearish: "bearish"
  },
  {
    id: 8,
    name: { en: "Marubozu", ta: "மாருபோசு" },
    type: "strong",
    pattern: "single",
    description: {
      en: "A Marubozu has no shadows (wicks) at all — just a solid body. A Bullish Marubozu (green) means buyers dominated the entire session. A Bearish Marubozu (red) means sellers dominated completely.",
      ta: "மாருபோசுவில் நிழல்கள் (விக்குகள்) இல்லை — வெறும் திடமான உடல் மட்டுமே. ஒரு நேர்மறை மாருபோசு (பச்சை) என்பது வாங்குவோர் முழு அமர்வையும் ஆதிக்கம் செலுத்தினர் என்று அர்த்தம். எதிர்மறை மாருபோசு (சிவப்பு) என்பது விற்பவர்கள் முற்றிலும் ஆதிக்கம் செலுத்தினர் என்று அர்த்தம்."
    },
    signal: { en: "Very strong trend continuation", ta: "மிகவும் வலுவான போக்கு தொடர்ச்சி" },
    psychology: { en: "Complete dominance by either buyers or sellers throughout the entire session.", ta: "முழு அமர்வு முழுவதும் வாங்குவோர் அல்லது விற்பவர்களில் ஒருவரின் முழுமையான ஆதிக்கம்." },
    emoji: "🟥",
    color: "#2C3E50",
    bodySize: "full",
    shadowSize: "none",
    bullishBearish: "both"
  },
  {
    id: 9,
    name: { en: "Spinning Top", ta: "ஸ்பின்னிங் டாப்" },
    type: "neutral",
    pattern: "single",
    description: {
      en: "A Spinning Top has a small body with long shadows on both sides. It indicates indecision — both buyers and sellers were active but neither gained significant control.",
      ta: "ஸ்பின்னிங் டாப்பில் இரு பக்கங்களிலும் நீண்ட நிழல்களுடன் ஒரு சிறிய உடல் உள்ளது. இது முடிவின்மையை குறிக்கிறது — வாங்குவோர் மற்றும் விற்பவர்கள் இருவரும் செயலில் இருந்தனர், ஆனால் யாரும் குறிப்பிடத்தக்க கட்டுப்பாட்டை பெறவில்லை."
    },
    signal: { en: "Indecision — possible reversal", ta: "முடிவின்மை — சாத்தியமான திரும்புதல்" },
    psychology: { en: "Neither bulls nor bears won the battle — look for the next candle for direction.", ta: "காளைகளோ கரடிகளோ போரில் வெல்லவில்லை — திசைக்காக அடுத்த மெழுகுதிரியை பாருங்கள்." },
    emoji: "🌀",
    color: "#7F8C8D",
    bodySize: "small",
    shadowSize: "equal-long",
    bullishBearish: "neutral"
  },
  {
    id: 10,
    name: { en: "Inverted Hammer", ta: "தலைகீழ் சுத்தி" },
    type: "bullish",
    pattern: "single",
    description: {
      en: "An Inverted Hammer looks like a Shooting Star but appears after a downtrend. It has a small body at the bottom and a long upper shadow. It signals a potential bullish reversal.",
      ta: "தலைகீழ் சுத்தி ஷூட்டிங் ஸ்டார் போல் தெரிகிறது ஆனால் கீழ்நோக்கிய போக்கிற்கு பிறகு தோன்றுகிறது. கீழே ஒரு சிறிய உடல் மற்றும் நீண்ட மேல் நிழல் உள்ளது. இது சாத்தியமான நேர்மறை திரும்புதலை சமிக்ஞை செய்கிறது."
    },
    signal: { en: "Potential bullish reversal after downtrend", ta: "கீழ்நோக்கிய போக்கிற்கு பிறகு சாத்தியமான நேர்மறை திரும்புதல்" },
    psychology: { en: "Buyers tried to push price up (long upper wick) after a downtrend — reversal attempt.", ta: "கீழ்நோக்கிய போக்கிற்கு பிறகு வாங்குவோர் விலையை மேலே தள்ள முயன்றனர் (நீண்ட மேல் விக்) — திரும்புதல் முயற்சி." },
    emoji: "🔽",
    color: "#27AE60",
    bodySize: "small",
    shadowSize: "long-upper",
    bullishBearish: "bullish"
  },
  {
    id: 11,
    name: { en: "Three White Soldiers", ta: "மூன்று வெள்ளை வீரர்கள்" },
    type: "bullish",
    pattern: "triple",
    description: {
      en: "A bullish reversal pattern consisting of three consecutive long-bodied green candles that open within the previous candle's body and close above the previous candle's high.",
      ta: "மூன்று தொடர்ச்சியான நீண்ட உடல் பச்சை மெழுகுதிரிகளைக் கொண்ட நேர்மறை திரும்புதல் வடிவம். முந்தைய மெழுகுதிரியின் உடலுக்குள் திறந்து முந்தைய மெழுகுதிரியின் உயர்வுக்கு மேலே மூடுகிறது."
    },
    signal: { en: "Strong bullish reversal", ta: "வலுவான நேர்மறை திரும்புதல்" },
    psychology: { en: "A steady advance of buying pressure. Bears are completely overwhelmed.", ta: "வாங்குதல் அழுத்தத்தின் நிலையான முன்னேற்றம். கரடிகள் முற்றிலும் மிகைக்கப்படுகிறார்கள்." },
    emoji: "⚔️",
    color: "#27AE60",
    bodySize: "large",
    shadowSize: "minimal",
    bullishBearish: "bullish"
  },
  {
    id: 12,
    name: { en: "Three Black Crows", ta: "மூன்று கருப்பு காகங்கள்" },
    type: "bearish",
    pattern: "triple",
    description: {
      en: "A bearish reversal pattern consisting of three consecutive long-bodied red candles that open within the previous candle's body and close below the previous candle's low.",
      ta: "மூன்று தொடர்ச்சியான நீண்ட உடல் சிவப்பு மெழுகுதிரிகளைக் கொண்ட எதிர்மறை திரும்புதல் வடிவம். முந்தைய மெழுகுதிரியின் உடலுக்குள் திறந்து முந்தைய மெழுகுதிரியின் தாழ்வுக்குக் கீழே மூடுகிறது."
    },
    signal: { en: "Strong bearish reversal", ta: "வலுவான எதிர்மறை திரும்புதல்" },
    psychology: { en: "A steady advance of selling pressure. Bulls are completely overwhelmed.", ta: "விற்பனை அழுத்தத்தின் நிலையான முன்னேற்றம். காளைகள் முற்றிலும் மிகைக்கப்படுகிறார்கள்." },
    emoji: "🦅",
    color: "#E74C3C",
    bodySize: "large",
    shadowSize: "minimal",
    bullishBearish: "bearish"
  }
];

const quizQuestions = [
  {
    id: 1,
    question: {
      en: "What does a green (bullish) candlestick indicate?",
      ta: "பச்சை (நேர்மறை) மெழுகுதிரி என்ன குறிக்கிறது?"
    },
    options: {
      en: ["Price closed lower than open", "Price closed higher than open", "Price did not change", "Volume was very high"],
      ta: ["திறப்பை விட விலை குறைவாக மூடியது", "திறப்பை விட விலை அதிகமாக மூடியது", "விலை மாறவில்லை", "வால்யூம் மிகவும் அதிகமாக இருந்தது"]
    },
    correct: 1,
    explanation: {
      en: "A green/bullish candle forms when the closing price is higher than the opening price, indicating buying pressure.",
      ta: "மூடும் விலை திறப்பு விலையை விட அதிகமாக இருக்கும்போது பச்சை/நேர்மறை மெழுகுதிரி உருவாகிறது, இது வாங்குதல் அழுத்தத்தை குறிக்கிறது."
    },
    category: "candlesticks",
    difficulty: "easy"
  },
  {
    id: 2,
    question: {
      en: "What does RSI above 70 indicate?",
      ta: "RSI 70 க்கு மேல் என்ன குறிக்கிறது?"
    },
    options: {
      en: ["Oversold condition", "Overbought condition", "Strong uptrend", "Neutral market"],
      ta: ["அதிக விற்பனை நிலை", "அதிக வாங்கல் நிலை", "வலுவான மேல்நோக்கிய போக்கு", "நடுநிலை சந்தை"]
    },
    correct: 1,
    explanation: {
      en: "RSI above 70 indicates the stock is overbought — it may be due for a pullback or correction.",
      ta: "RSI 70க்கு மேல் என்பது பங்கு அதிகமாக வாங்கப்பட்டது என்று குறிக்கிறது — இது திரும்பி இழுக்கப்படலாம் அல்லது திருத்தம் ஏற்படலாம்."
    },
    category: "indicators",
    difficulty: "easy"
  },
  {
    id: 3,
    question: {
      en: "A Hammer candlestick appears after a downtrend. What does it signal?",
      ta: "கீழ்நோக்கிய போக்கிற்கு பிறகு சுத்தி மெழுகுதிரி தோன்றுகிறது. அது என்ன சமிக்ஞை செய்கிறது?"
    },
    options: {
      en: ["Continuation of downtrend", "Bullish reversal", "Bearish reversal", "Sideways market"],
      ta: ["கீழ்நோக்கிய போக்கின் தொடர்ச்சி", "நேர்மறை திரும்புதல்", "எதிர்மறை திரும்புதல்", "பக்கவாட்டு சந்தை"]
    },
    correct: 1,
    explanation: {
      en: "A Hammer after a downtrend signals a potential bullish reversal. The long lower wick shows sellers tried to push price down but buyers fought back.",
      ta: "கீழ்நோக்கிய போக்கிற்கு பிறகு சுத்தி சாத்தியமான நேர்மறை திரும்புதலை சமிக்ஞை செய்கிறது. நீண்ட கீழ் விக் விற்பவர்கள் விலையை கீழே தள்ள முயன்றனர், ஆனால் வாங்குவோர் திரும்பி வந்தனர் என்பதை காட்டுகிறது."
    },
    category: "candlesticks",
    difficulty: "medium"
  },
  {
    id: 4,
    question: {
      en: "What is the maximum percentage of capital you should risk per trade?",
      ta: "ஒரு வர்த்தகத்தில் நீங்கள் ஆபத்தில் வைக்க வேண்டிய மூலதனத்தின் அதிகபட்ச சதவீதம் என்ன?"
    },
    options: {
      en: ["10-20%", "5-10%", "1-2%", "50%"],
      ta: ["10-20%", "5-10%", "1-2%", "50%"]
    },
    correct: 2,
    explanation: {
      en: "Professional traders risk only 1-2% of their total capital per trade. This ensures even a losing streak of 10 trades won't wipe out your account.",
      ta: "தொழில்முறை வர்த்தகர்கள் ஒரு வர்த்தகத்தில் தங்கள் மொத்த மூலதனத்தில் 1-2% மட்டுமே ஆபத்தில் வைக்கிறார்கள். இது 10 வர்த்தகங்களின் தொடர்ச்சியான தோல்வியும் உங்கள் கணக்கை அழிக்காது என்பதை உறுதி செய்கிறது."
    },
    category: "risk",
    difficulty: "easy"
  },
  {
    id: 5,
    question: {
      en: "What does the 'body' of a candlestick represent?",
      ta: "மெழுகுதிரியின் 'உடல்' என்ன குறிக்கிறது?"
    },
    options: {
      en: ["The highest and lowest prices", "The difference between open and close prices", "The trading volume", "The time period"],
      ta: ["அதிகபட்ச மற்றும் குறைந்தபட்ச விலைகள்", "திறப்பு மற்றும் மூடும் விலைகளுக்கு இடையிலான வேறுபாடு", "வர்த்தக அளவு", "நேர காலம்"]
    },
    correct: 1,
    explanation: {
      en: "The body (thick part) of a candlestick shows the range between the opening and closing prices. Green body = close > open. Red body = close < open.",
      ta: "மெழுகுதிரியின் உடல் (தடிமனான பகுதி) திறப்பு மற்றும் மூடும் விலைகளுக்கு இடையிலான வரம்பை காட்டுகிறது. பச்சை உடல் = மூடல் > திறப்பு. சிவப்பு உடல் = மூடல் < திறப்பு."
    },
    category: "candlesticks",
    difficulty: "easy"
  },
  {
    id: 6,
    question: {
      en: "What is a 'Golden Cross' in moving averages?",
      ta: "நகரும் சராசரியில் 'கோல்டன் கிராஸ்' என்றால் என்ன?"
    },
    options: {
      en: ["50 MA crosses below 200 MA", "50 MA crosses above 200 MA", "20 MA crosses 50 MA", "Price crosses 200 MA"],
      ta: ["50 MA 200 MA க்கு கீழே கடக்கும்", "50 MA 200 MA க்கு மேலே கடக்கும்", "20 MA 50 MA ஐ கடக்கும்", "விலை 200 MA ஐ கடக்கும்"]
    },
    correct: 1,
    explanation: {
      en: "A Golden Cross occurs when the 50-period MA crosses above the 200-period MA. It is considered a strong bullish signal.",
      ta: "50-காலகட்ட MA 200-காலகட்ட MA க்கு மேலே கடக்கும்போது கோல்டன் கிராஸ் நிகழ்கிறது. இது வலுவான நேர்மறை சமிக்ஞையாக கருதப்படுகிறது."
    },
    category: "indicators",
    difficulty: "medium"
  },
  {
    id: 7,
    question: {
      en: "Which emotion leads traders to hold onto losing positions too long?",
      ta: "எந்த உணர்ச்சி வர்த்தகர்களை தோல்வியடைந்த நிலைகளை மிக நீண்ட காலம் வைத்திருக்க வைக்கிறது?"
    },
    options: {
      en: ["Fear", "Greed", "Confidence", "Patience"],
      ta: ["பயம்", "பேராசை", "நம்பிக்கை", "பொறுமை"]
    },
    correct: 1,
    explanation: {
      en: "Greed makes traders hold onto losing positions hoping they will recover. Accepting losses quickly is a sign of discipline.",
      ta: "பேராசை வர்த்தகர்களை தோல்வியடைந்த நிலைகளை மீட்கும் என்று நம்பி வைத்திருக்க வைக்கிறது. விரைவாக இழப்புகளை ஏற்றுக்கொள்வது ஒழுக்கத்தின் அடையாளம்."
    },
    category: "psychology",
    difficulty: "easy"
  },
  {
    id: 8,
    question: {
      en: "What does OHLC stand for in trading?",
      ta: "வர்த்தகத்தில் OHLC என்றால் என்ன?"
    },
    options: {
      en: ["Only High Low Close", "Open High Low Close", "Order High Limit Close", "Open Hold Low Continue"],
      ta: ["ஓன்லி ஹை லோ க்ளோஸ்", "ஓபன் ஹை லோ க்ளோஸ்", "ஆர்டர் ஹை லிமிட் க்ளோஸ்", "ஓபன் ஹோல்ட் லோ கன்டினியூ"]
    },
    correct: 1,
    explanation: {
      en: "OHLC = Open, High, Low, Close. These four price points are the foundation of candlestick and bar charts.",
      ta: "OHLC = திறப்பு, உயர்வு, தாழ்வு, மூடுதல். இந்த நான்கு விலை புள்ளிகள் மெழுகுதிரி மற்றும் பார் விளக்கப்படங்களின் அடிப்படையாகும்."
    },
    category: "basics",
    difficulty: "easy"
  },
  {
    id: 9,
    question: {
      en: "Which Fibonacci retracement level is widely known as the 'Golden Ratio'?",
      ta: "எந்த ஃபிபோனாச்சி ரிட்ரேஸ்மென்ட் நிலை 'கோல்டன் ரேஷியோ' என பரவலாக அறியப்படுகிறது?"
    },
    options: {
      en: ["23.6%", "38.2%", "50.0%", "61.8%"],
      ta: ["23.6%", "38.2%", "50.0%", "61.8%"]
    },
    correct: 3,
    explanation: {
      en: "61.8% is the Golden Ratio in the Fibonacci sequence, often acting as a strong support or resistance level.",
      ta: "61.8% என்பது ஃபிபோனாச்சி வரிசையில் கோல்டன் ரேஷியோ ஆகும், இது பெரும்பாலும் வலுவான ஆதரவு அல்லது எதிர்ப்பு நிலையாக செயல்படுகிறது."
    },
    category: "indicators",
    difficulty: "advanced"
  },
  {
    id: 10,
    question: {
      en: "What does an 'Order Block' represent in Institutional Order Flow?",
      ta: "நிறுவன ஆர்டர் ஓட்டத்தில் 'ஆர்டர் பிளாக்' எதைக் குறிக்கிறது?"
    },
    options: {
      en: ["A block on trading by the exchange", "An area where institutions accumulated large positions", "A software glitch in trading apps", "A standard stop loss level"],
      ta: ["பரிமாற்றத்தால் வர்த்தகத்திற்கு தடை", "நிறுவனங்கள் பெரிய நிலைகளை குவிக்கும் ஒரு பகுதி", "வர்த்தக பயன்பாடுகளில் ஒரு மென்பொருள் கோளாறு", "ஒரு நிலையான ஸ்டாப் லாஸ் நிலை"]
    },
    correct: 1,
    explanation: {
      en: "Order blocks are specific price levels or ranges where large financial institutions previously placed massive buy or sell orders.",
      ta: "ஆர்டர் பிளாக்குகள் என்பவை பெரிய நிதி நிறுவனங்கள் முன்பு பாரிய வாங்குதல் அல்லது விற்றல் ஆர்டர்களை வழங்கிய குறிப்பிட்ட விலை நிலைகள் அல்லது வரம்புகள்."
    },
    category: "basics",
    difficulty: "pro"
  }
];

const glossary = [
  { id: 1, term: { en: "Bull Market", ta: "காளை சந்தை" }, definition: { en: "A market where prices are rising or expected to rise. Bulls believe prices will go up.", ta: "விலைகள் உயரும் அல்லது உயரும் என்று எதிர்பார்க்கப்படும் சந்தை. காளைகள் விலைகள் உயரும் என்று நம்புகிறார்கள்." } },
  { id: 2, term: { en: "Bear Market", ta: "கரடி சந்தை" }, definition: { en: "A market where prices are falling or expected to fall. Bears believe prices will go down.", ta: "விலைகள் விழும் அல்லது விழும் என்று எதிர்பார்க்கப்படும் சந்தை. கரடிகள் விலைகள் கீழே போகும் என்று நம்புகிறார்கள்." } },
  { id: 3, term: { en: "Stop Loss", ta: "ஸ்டாப் லாஸ்" }, definition: { en: "An order to sell a stock when it reaches a specific price, limiting your loss.", ta: "ஒரு பங்கை குறிப்பிட்ட விலையை அடையும்போது விற்க ஆர்டர், உங்கள் இழப்பை குறைக்கிறது." } },
  { id: 4, term: { en: "Volume", ta: "வால்யூம்" }, definition: { en: "The number of shares traded during a specific period. High volume confirms price moves.", ta: "ஒரு குறிப்பிட்ட காலத்தில் வர்த்தகம் செய்யப்பட்ட பங்குகளின் எண்ணிக்கை. அதிக வால்யூம் விலை நகர்வுகளை உறுதிப்படுத்துகிறது." } },
  { id: 5, term: { en: "Trend", ta: "போக்கு" }, definition: { en: "The general direction of price movement — uptrend, downtrend, or sideways.", ta: "விலை இயக்கத்தின் பொதுவான திசை — மேல்நோக்கிய போக்கு, கீழ்நோக்கிய போக்கு, அல்லது பக்கவாட்டு." } },
  { id: 6, term: { en: "Breakout", ta: "பிரேக்அவுட்" }, definition: { en: "When price moves above resistance or below support with high volume, signaling a strong new trend.", ta: "விலை அதிக வால்யூமுடன் எதிர்ப்பை மீறி அல்லது ஆதரவுக்கு கீழே நகரும்போது, ஒரு வலுவான புதிய போக்கை சமிக்ஞை செய்கிறது." } },
  { id: 7, term: { en: "Consolidation", ta: "ஒருங்கிணைப்பு" }, definition: { en: "A period when price moves sideways in a range before breaking out in either direction.", ta: "விலை எந்த திசையிலும் வெடிப்பதற்கு முன் ஒரு வரம்பில் பக்கவாட்டாக நகரும் காலம்." } },
  { id: 8, term: { en: "Fibonacci Retracement", ta: "ஃபிபோனாச்சி ரிட்ரேஸ்மென்ட்" }, definition: { en: "A technical tool using Fibonacci ratios (23.6%, 38.2%, 61.8%) to identify potential support/resistance levels.", ta: "சாத்தியமான ஆதரவு/எதிர்ப்பு நிலைகளை அடையாளம் காண ஃபிபோனாச்சி விகிதங்களை (23.6%, 38.2%, 61.8%) பயன்படுத்தும் தொழில்நுட்ப கருவி." } },
  { id: 9, term: { en: "Liquidity", ta: "பணப்புழக்கம்" }, definition: { en: "How easily you can buy or sell a stock without affecting its price. High liquidity = easy to trade.", ta: "விலையை பாதிக்காமல் ஒரு பங்கை எவ்வளவு எளிதாக வாங்கலாம் அல்லது விற்கலாம். அதிக பணப்புழக்கம் = வர்த்தகம் செய்வது எளிது." } },
  { id: 10, term: { en: "Scalping", ta: "ஸ்கால்பிங்" }, definition: { en: "A very short-term trading style where traders make many trades within minutes to capture small profits.", ta: "மிகவும் குறுகிய கால வர்த்தக பாணி, வர்த்தகர்கள் சிறிய லாபங்களை பிடிக்க நிமிடங்களுக்குள் பல வர்த்தகங்கள் செய்கிறார்கள்." } }
];

const advancedLearningTopics = [
  {
    id: 13,
    category: "roadmap",
    title: { en: "Beginner Roadmap: Market Foundation", ta: "Beginner Roadmap: Market Foundation" },
    description: {
      en: "Start with market structure, exchanges, order types, chart timeframes, and the difference between investing, swing trading, intraday trading, and scalping.",
      ta: "Start with market structure, exchanges, order types, chart timeframes, and the difference between investing, swing trading, intraday trading, and scalping."
    },
    keyPoints: {
      en: ["Understand shares, indices, sectors, brokers, margin, and settlement", "Learn market orders, limit orders, stop-loss orders, and stop-limit orders", "Read OHLC candles on 1D, 1H, 15M, and 5M charts", "Know why liquidity and spread matter before entering a trade"],
      ta: ["Understand shares, indices, sectors, brokers, margin, and settlement", "Learn market orders, limit orders, stop-loss orders, and stop-limit orders", "Read OHLC candles on 1D, 1H, 15M, and 5M charts", "Know why liquidity and spread matter before entering a trade"]
    },
    practice: { en: ["Open 20 charts and mark the trend direction on daily and hourly timeframes", "Place paper trades using only limit orders and stop-loss orders", "Write one paragraph explaining why a stock moved today"], ta: ["Open 20 charts and mark the trend direction on daily and hourly timeframes", "Place paper trades using only limit orders and stop-loss orders", "Write one paragraph explaining why a stock moved today"] },
    mistakes: { en: ["Trading before understanding order types", "Using leverage because the broker allows it", "Jumping to options before mastering spot charts"], ta: ["Trading before understanding order types", "Using leverage because the broker allows it", "Jumping to options before mastering spot charts"] },
    checklist: { en: ["I can explain OHLC", "I know the active market hours", "I can place entry, target, and stop levels before a trade"], ta: ["I can explain OHLC", "I know the active market hours", "I can place entry, target, and stop levels before a trade"] },
    icon: "1",
    difficulty: "beginner",
    readTime: 12
  },
  {
    id: 14,
    category: "candlesticks",
    title: { en: "Candlestick Reading: From Shape to Story", ta: "Candlestick Reading: From Shape to Story" },
    description: {
      en: "Use candlesticks to read the battle between buyers and sellers. A pattern matters only when it appears at a meaningful location such as support, resistance, trendline, or liquidity zone.",
      ta: "Use candlesticks to read the battle between buyers and sellers. A pattern matters only when it appears at a meaningful location such as support, resistance, trendline, or liquidity zone."
    },
    keyPoints: {
      en: ["Body shows control; wick shows rejection", "A hammer is stronger after a downtrend near support", "Engulfing candles need context and follow-through", "Volume gives confidence but does not guarantee the trade"],
      ta: ["Body shows control; wick shows rejection", "A hammer is stronger after a downtrend near support", "Engulfing candles need context and follow-through", "Volume gives confidence but does not guarantee the trade"]
    },
    practice: { en: ["Find 10 hammers, 10 doji candles, and 10 engulfing candles on old charts", "For each one, write what happened in the next 3 candles", "Separate patterns that worked from patterns that failed and note the location"], ta: ["Find 10 hammers, 10 doji candles, and 10 engulfing candles on old charts", "For each one, write what happened in the next 3 candles", "Separate patterns that worked from patterns that failed and note the location"] },
    mistakes: { en: ["Trading every pattern without checking trend", "Buying a bullish candle directly into resistance", "Ignoring the candle after the signal candle"], ta: ["Trading every pattern without checking trend", "Buying a bullish candle directly into resistance", "Ignoring the candle after the signal candle"] },
    checklist: { en: ["Pattern is at a level", "Trend or range context is clear", "Stop loss is beyond the candle logic"], ta: ["Pattern is at a level", "Trend or range context is clear", "Stop loss is beyond the candle logic"] },
    icon: "2",
    difficulty: "beginner",
    readTime: 14
  },
  {
    id: 15,
    category: "technical-analysis",
    title: { en: "Trend, Market Structure, and Multi-Timeframe Analysis", ta: "Trend, Market Structure, and Multi-Timeframe Analysis" },
    description: {
      en: "Intermediate traders stop asking only whether price is going up or down. They identify higher highs, higher lows, lower highs, lower lows, trend phases, and which timeframe controls the trade.",
      ta: "Intermediate traders stop asking only whether price is going up or down. They identify higher highs, higher lows, lower highs, lower lows, trend phases, and which timeframe controls the trade."
    },
    keyPoints: {
      en: ["Uptrend: higher highs and higher lows", "Downtrend: lower highs and lower lows", "Range: price rotates between support and resistance", "Use higher timeframe for direction and lower timeframe for entry"],
      ta: ["Uptrend: higher highs and higher lows", "Downtrend: lower highs and lower lows", "Range: price rotates between support and resistance", "Use higher timeframe for direction and lower timeframe for entry"]
    },
    practice: { en: ["Mark structure on 50 charts without indicators", "Write HTF bias before looking at lower timeframe", "Track whether your entries match the higher timeframe"], ta: ["Mark structure on 50 charts without indicators", "Write HTF bias before looking at lower timeframe", "Track whether your entries match the higher timeframe"] },
    mistakes: { en: ["Calling every pullback a reversal", "Entering from a 5-minute chart against a strong daily trend", "Moving support and resistance lines to fit your idea"], ta: ["Calling every pullback a reversal", "Entering from a 5-minute chart against a strong daily trend", "Moving support and resistance lines to fit your idea"] },
    checklist: { en: ["HTF direction is written", "Structure break or rejection is visible", "Entry timeframe agrees with the plan"], ta: ["HTF direction is written", "Structure break or rejection is visible", "Entry timeframe agrees with the plan"] },
    icon: "3",
    difficulty: "intermediate",
    readTime: 16
  },
  {
    id: 16,
    category: "indicators",
    title: { en: "Indicator Stack: MA, RSI, MACD, VWAP, ATR", ta: "Indicator Stack: MA, RSI, MACD, VWAP, ATR" },
    description: {
      en: "Indicators should support price reading, not replace it. Learn what each tool measures so you do not use five indicators that all say the same thing.",
      ta: "Indicators should support price reading, not replace it. Learn what each tool measures so you do not use five indicators that all say the same thing."
    },
    keyPoints: {
      en: ["MA shows trend direction and dynamic support/resistance", "RSI shows momentum and possible exhaustion", "MACD helps spot momentum shifts", "VWAP is useful for intraday fair value", "ATR helps set realistic stop distance"],
      ta: ["MA shows trend direction and dynamic support/resistance", "RSI shows momentum and possible exhaustion", "MACD helps spot momentum shifts", "VWAP is useful for intraday fair value", "ATR helps set realistic stop distance"]
    },
    practice: { en: ["Use only one indicator per week and write what it helped with", "Compare 20 EMA pullbacks in trending markets", "Use ATR to calculate stop size on 20 paper trades"], ta: ["Use only one indicator per week and write what it helped with", "Compare 20 EMA pullbacks in trending markets", "Use ATR to calculate stop size on 20 paper trades"] },
    mistakes: { en: ["Adding indicators until the chart looks convincing", "Buying only because RSI is oversold", "Using the same indicator settings for every market and timeframe"], ta: ["Adding indicators until the chart looks convincing", "Buying only because RSI is oversold", "Using the same indicator settings for every market and timeframe"] },
    checklist: { en: ["Each indicator has a job", "Price action agrees with the signal", "Stop and target are based on volatility"], ta: ["Each indicator has a job", "Price action agrees with the signal", "Stop and target are based on volatility"] },
    icon: "4",
    difficulty: "intermediate",
    readTime: 18
  },
  {
    id: 17,
    category: "risk",
    title: { en: "Position Sizing and Risk of Ruin", ta: "Position Sizing and Risk of Ruin" },
    description: {
      en: "Professional trading starts with survival. Position size should come from account risk, entry price, stop-loss price, and instrument quantity, not from emotion.",
      ta: "Professional trading starts with survival. Position size should come from account risk, entry price, stop-loss price, and instrument quantity, not from emotion."
    },
    keyPoints: {
      en: ["Risk per trade = account capital x risk percent", "Quantity = money at risk / stop distance", "A 1:2 risk-reward can be profitable with less than 50% win rate", "Daily loss limits protect you from revenge trading"],
      ta: ["Risk per trade = account capital x risk percent", "Quantity = money at risk / stop distance", "A 1:2 risk-reward can be profitable with less than 50% win rate", "Daily loss limits protect you from revenge trading"]
    },
    practice: { en: ["Calculate quantity for 25 sample trades", "Backtest one setup with fixed 1% risk", "Write your max daily loss and stop trading rule"], ta: ["Calculate quantity for 25 sample trades", "Backtest one setup with fixed 1% risk", "Write your max daily loss and stop trading rule"] },
    mistakes: { en: ["Using the same quantity for every trade", "Increasing size after losses", "Moving stop loss farther after entry"], ta: ["Using the same quantity for every trade", "Increasing size after losses", "Moving stop loss farther after entry"] },
    checklist: { en: ["Risk percent is defined", "Position size is calculated before entry", "Daily loss limit is respected"], ta: ["Risk percent is defined", "Position size is calculated before entry", "Daily loss limit is respected"] },
    icon: "5",
    difficulty: "intermediate",
    readTime: 17
  },
  {
    id: 18,
    category: "strategy",
    title: { en: "Build a Complete Trading Strategy", ta: "Build a Complete Trading Strategy" },
    description: {
      en: "A strategy is not just an entry signal. It defines market condition, setup, trigger, invalidation, target, risk, management, and review process.",
      ta: "A strategy is not just an entry signal. It defines market condition, setup, trigger, invalidation, target, risk, management, and review process."
    },
    keyPoints: {
      en: ["Market condition: trend, range, volatile, or quiet", "Setup: the pattern you wait for", "Trigger: exact reason to enter", "Invalidation: what proves the idea wrong", "Exit: target, trailing rule, or time stop"],
      ta: ["Market condition: trend, range, volatile, or quiet", "Setup: the pattern you wait for", "Trigger: exact reason to enter", "Invalidation: what proves the idea wrong", "Exit: target, trailing rule, or time stop"]
    },
    practice: { en: ["Write one strategy in a one-page rulebook", "Take 30 screenshots where the setup appears", "Record whether each trade followed every rule"], ta: ["Write one strategy in a one-page rulebook", "Take 30 screenshots where the setup appears", "Record whether each trade followed every rule"] },
    mistakes: { en: ["Changing the setup after every loss", "Mixing multiple strategies in one trade", "Skipping rules because the trade feels obvious"], ta: ["Changing the setup after every loss", "Mixing multiple strategies in one trade", "Skipping rules because the trade feels obvious"] },
    checklist: { en: ["Setup is written", "Entry and invalidation are objective", "Exit rule is defined before entry"], ta: ["Setup is written", "Entry and invalidation are objective", "Exit rule is defined before entry"] },
    icon: "6",
    difficulty: "advanced",
    readTime: 20
  },
  {
    id: 19,
    category: "backtesting",
    title: { en: "Backtesting and Forward Testing", ta: "Backtesting and Forward Testing" },
    description: {
      en: "Before risking money, test your strategy on historical charts and then forward test it in live market conditions using paper trades or tiny size.",
      ta: "Before risking money, test your strategy on historical charts and then forward test it in live market conditions using paper trades or tiny size."
    },
    keyPoints: {
      en: ["Backtest at least 50 to 100 examples before trusting a setup", "Track win rate, average win, average loss, maximum drawdown, and expectancy", "Forward testing shows if you can execute the rules live", "Screenshots reveal repeated mistakes faster than memory"],
      ta: ["Backtest at least 50 to 100 examples before trusting a setup", "Track win rate, average win, average loss, maximum drawdown, and expectancy", "Forward testing shows if you can execute the rules live", "Screenshots reveal repeated mistakes faster than memory"]
    },
    practice: { en: ["Create a spreadsheet with date, setup, entry, stop, target, result, notes", "Review losing trades by mistake category", "Do not change the system until sample size is meaningful"], ta: ["Create a spreadsheet with date, setup, entry, stop, target, result, notes", "Review losing trades by mistake category", "Do not change the system until sample size is meaningful"] },
    mistakes: { en: ["Counting only perfect historical examples", "Ignoring slippage and fees", "Changing rules halfway through the sample"], ta: ["Counting only perfect historical examples", "Ignoring slippage and fees", "Changing rules halfway through the sample"] },
    checklist: { en: ["Sample size is recorded", "Rules were fixed during testing", "Expectancy is positive after costs"], ta: ["Sample size is recorded", "Rules were fixed during testing", "Expectancy is positive after costs"] },
    icon: "7",
    difficulty: "advanced",
    readTime: 22
  },
  {
    id: 20,
    category: "psychology",
    title: { en: "Trader Psychology and Execution Discipline", ta: "Trader Psychology and Execution Discipline" },
    description: {
      en: "Most traders do not fail because they lack patterns. They fail because they break rules after fear, greed, boredom, anger, or overconfidence enters the decision.",
      ta: "Most traders do not fail because they lack patterns. They fail because they break rules after fear, greed, boredom, anger, or overconfidence enters the decision."
    },
    keyPoints: {
      en: ["FOMO creates late entries", "Revenge trading increases size after losses", "Overconfidence appears after a winning streak", "A written pre-market and post-market routine reduces emotional trading"],
      ta: ["FOMO creates late entries", "Revenge trading increases size after losses", "Overconfidence appears after a winning streak", "A written pre-market and post-market routine reduces emotional trading"]
    },
    practice: { en: ["Score every trade from 1 to 5 for discipline", "Write the emotion before and after each trade", "Stop trading for the day after two rule breaks"], ta: ["Score every trade from 1 to 5 for discipline", "Write the emotion before and after each trade", "Stop trading for the day after two rule breaks"] },
    mistakes: { en: ["Trying to win back losses immediately", "Taking trades because you are bored", "Confusing confidence with proof"], ta: ["Trying to win back losses immediately", "Taking trades because you are bored", "Confusing confidence with proof"] },
    checklist: { en: ["I know my emotional trigger", "I have a max trades per day rule", "I review discipline separately from profit"], ta: ["I know my emotional trigger", "I have a max trades per day rule", "I review discipline separately from profit"] },
    icon: "8",
    difficulty: "advanced",
    readTime: 18
  },
  {
    id: 21,
    category: "pro",
    title: { en: "Pro Workflow: Trade Plan, Journal, Review", ta: "Pro Workflow: Trade Plan, Journal, Review" },
    description: {
      en: "Pro-level trading is a process loop: prepare, execute, record, review, improve. The goal is not to predict every move; it is to repeat high-quality decisions.",
      ta: "Pro-level trading is a process loop: prepare, execute, record, review, improve. The goal is not to predict every move; it is to repeat high-quality decisions."
    },
    keyPoints: {
      en: ["Pre-market: mark levels, news, bias, and no-trade zones", "During market: execute only A-grade setups", "After market: screenshot every trade and label mistakes", "Weekly review: find one behavior to improve next week"],
      ta: ["Pre-market: mark levels, news, bias, and no-trade zones", "During market: execute only A-grade setups", "After market: screenshot every trade and label mistakes", "Weekly review: find one behavior to improve next week"]
    },
    practice: { en: ["Create a daily plan template", "Create a journal template", "Review 20 trades and write your top 3 repeated mistakes"], ta: ["Create a daily plan template", "Create a journal template", "Review 20 trades and write your top 3 repeated mistakes"] },
    mistakes: { en: ["Judging a good trade as bad only because it lost", "Judging a bad trade as good only because it made money", "Skipping review after profitable days"], ta: ["Judging a good trade as bad only because it lost", "Judging a bad trade as good only because it made money", "Skipping review after profitable days"] },
    checklist: { en: ["Plan exists before market opens", "Each trade has a screenshot", "Weekly improvement target is written"], ta: ["Plan exists before market opens", "Each trade has a screenshot", "Weekly improvement target is written"] },
    icon: "9",
    difficulty: "pro",
    readTime: 21
  },
  {
    id: 22,
    category: "pro",
    title: { en: "Institutional Concepts: Liquidity, Order Blocks, FVG", ta: "Institutional Concepts: Liquidity, Order Blocks, FVG" },
    description: {
      en: "Advanced traders study where liquidity is likely resting and how price reacts after taking it. These concepts are useful only when combined with structure, timing, and risk control.",
      ta: "Advanced traders study where liquidity is likely resting and how price reacts after taking it. These concepts are useful only when combined with structure, timing, and risk control."
    },
    keyPoints: {
      en: ["Liquidity often rests beyond obvious highs, lows, and equal levels", "An order block is a price zone before a strong displacement move", "Fair Value Gap is an imbalance area where price moved too quickly", "Confirmation matters more than naming the zone"],
      ta: ["Liquidity often rests beyond obvious highs, lows, and equal levels", "An order block is a price zone before a strong displacement move", "Fair Value Gap is an imbalance area where price moved too quickly", "Confirmation matters more than naming the zone"]
    },
    practice: { en: ["Mark equal highs and equal lows on 30 charts", "Find displacement candles and note the origin zone", "Track whether price reacts or slices through the zone"], ta: ["Mark equal highs and equal lows on 30 charts", "Find displacement candles and note the origin zone", "Track whether price reacts or slices through the zone"] },
    mistakes: { en: ["Calling every candle an order block", "Ignoring higher timeframe trend", "Entering before a reaction confirms the idea"], ta: ["Calling every candle an order block", "Ignoring higher timeframe trend", "Entering before a reaction confirms the idea"] },
    checklist: { en: ["Liquidity target is clear", "Displacement is visible", "Entry has confirmation and invalidation"], ta: ["Liquidity target is clear", "Displacement is visible", "Entry has confirmation and invalidation"] },
    icon: "10",
    difficulty: "pro",
    readTime: 24
  }
];

const advancedQuizQuestions = [
  { id: 11, question: { en: "What should decide position size?", ta: "What should decide position size?" }, options: { en: ["Feeling confident", "Account risk and stop distance", "Broker margin", "Last trade profit"], ta: ["Feeling confident", "Account risk and stop distance", "Broker margin", "Last trade profit"] }, correct: 1, explanation: { en: "Position size should be calculated from account risk divided by stop-loss distance.", ta: "Position size should be calculated from account risk divided by stop-loss distance." }, category: "risk", difficulty: "medium" },
  { id: 12, question: { en: "What makes a candlestick pattern more reliable?", ta: "What makes a candlestick pattern more reliable?" }, options: { en: ["Appearing anywhere on chart", "Appearing at a meaningful level with context", "Having a big body only", "Being on a small timeframe"], ta: ["Appearing anywhere on chart", "Appearing at a meaningful level with context", "Having a big body only", "Being on a small timeframe"] }, correct: 1, explanation: { en: "Patterns need location and context: support, resistance, trend, volume, or liquidity.", ta: "Patterns need location and context: support, resistance, trend, volume, or liquidity." }, category: "candlesticks", difficulty: "medium" },
  { id: 13, question: { en: "What is expectancy?", ta: "What is expectancy?" }, options: { en: ["A trader's hope", "Average expected profit or loss per trade", "Only win rate", "Only risk reward"], ta: ["A trader's hope", "Average expected profit or loss per trade", "Only win rate", "Only risk reward"] }, correct: 1, explanation: { en: "Expectancy combines win rate, average win, and average loss to estimate the average result per trade.", ta: "Expectancy combines win rate, average win, and average loss to estimate the average result per trade." }, category: "backtesting", difficulty: "advanced" },
  { id: 14, question: { en: "Why do traders use multiple timeframes?", ta: "Why do traders use multiple timeframes?" }, options: { en: ["To make the chart busy", "To align higher-timeframe direction with lower-timeframe entry", "To avoid stop losses", "To guarantee profit"], ta: ["To make the chart busy", "To align higher-timeframe direction with lower-timeframe entry", "To avoid stop losses", "To guarantee profit"] }, correct: 1, explanation: { en: "Higher timeframe gives context; lower timeframe refines entry and risk.", ta: "Higher timeframe gives context; lower timeframe refines entry and risk." }, category: "technical-analysis", difficulty: "medium" },
  { id: 15, question: { en: "What is a fair value gap?", ta: "What is a fair value gap?" }, options: { en: ["Brokerage fee", "An imbalance area caused by fast price movement", "A guaranteed support level", "A company valuation report"], ta: ["Brokerage fee", "An imbalance area caused by fast price movement", "A guaranteed support level", "A company valuation report"] }, correct: 1, explanation: { en: "A fair value gap is an imbalance zone where price moved quickly and left inefficient trading between candles.", ta: "A fair value gap is an imbalance zone where price moved quickly and left inefficient trading between candles." }, category: "pro", difficulty: "pro" }
];

const advancedGlossary = [
  { id: 11, term: { en: "Expectancy", ta: "Expectancy" }, definition: { en: "The average amount a strategy is expected to win or lose per trade after combining win rate, average win, and average loss.", ta: "The average amount a strategy is expected to win or lose per trade after combining win rate, average win, and average loss." } },
  { id: 12, term: { en: "Drawdown", ta: "Drawdown" }, definition: { en: "The decline from an account peak to a later low. It shows how much pain a strategy may create before recovery.", ta: "The decline from an account peak to a later low. It shows how much pain a strategy may create before recovery." } },
  { id: 13, term: { en: "ATR", ta: "ATR" }, definition: { en: "Average True Range, a volatility indicator often used to set realistic stops and targets.", ta: "Average True Range, a volatility indicator often used to set realistic stops and targets." } },
  { id: 14, term: { en: "VWAP", ta: "VWAP" }, definition: { en: "Volume Weighted Average Price, an intraday reference price that combines price and volume.", ta: "Volume Weighted Average Price, an intraday reference price that combines price and volume." } },
  { id: 15, term: { en: "Fair Value Gap", ta: "Fair Value Gap" }, definition: { en: "An imbalance area where price moved quickly, leaving a zone traders may later watch for reaction.", ta: "An imbalance area where price moved quickly, leaving a zone traders may later watch for reaction." } },
  { id: 16, term: { en: "Displacement", ta: "Displacement" }, definition: { en: "A strong directional price move, often shown by large candles and urgency from buyers or sellers.", ta: "A strong directional price move, often shown by large candles and urgency from buyers or sellers." } },
  { id: 17, term: { en: "Backtesting", ta: "Backtesting" }, definition: { en: "Testing a trading idea on historical charts to measure whether the rules had an edge.", ta: "Testing a trading idea on historical charts to measure whether the rules had an edge." } },
  { id: 18, term: { en: "Forward Testing", ta: "Forward Testing" }, definition: { en: "Testing a strategy in live market conditions using paper trades or small size before scaling up.", ta: "Testing a strategy in live market conditions using paper trades or small size before scaling up." } }
];

const expandedTopics = [...topics, ...advancedLearningTopics];
const expandedQuizQuestions = [...quizQuestions, ...advancedQuizQuestions];
const expandedGlossary = [...glossary, ...advancedGlossary];

module.exports = {
  topics: expandedTopics,
  candlesticks,
  quizQuestions: expandedQuizQuestions,
  glossary: expandedGlossary
};
