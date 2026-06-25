from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters
)
import random

# BOT TOKEN (KEEP YOUR OWN)
TOKEN = "8651801716:AAGWf-Ke3lvxXXQuwiZ3-lB6HpbzKBsyGaI"

# Store user language
user_languages = {}


# /start command
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    args = context.args

    if args and args[0] == "website":
        text = "🌍 Welcome! You came from our website 🚀\n\nSelect Your Language:"
    else:
        text = "🌍 Welcome to AQI Mitra\n\nSelect Your Language:"

    keyboard = [
        [
            InlineKeyboardButton("English", callback_data="lang_en"),
            InlineKeyboardButton("हिन्दी", callback_data="lang_hi")
        ],
        [
            InlineKeyboardButton("ગુજરાતી", callback_data="lang_gu"),
            InlineKeyboardButton("தமிழ்", callback_data="lang_ta")
        ],
        [
            InlineKeyboardButton("ಕನ್ನಡ", callback_data="lang_kn"),
            InlineKeyboardButton("বাংলা", callback_data="lang_bn")
        ],
        [
            InlineKeyboardButton("తెలుగు", callback_data="lang_te"),
            InlineKeyboardButton("മലയാളം", callback_data="lang_ml")
        ],
        [
            InlineKeyboardButton("ਪੰਜਾਬੀ", callback_data="lang_pa")
        ]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(text, reply_markup=reply_markup)


# Language selection
async def language_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):

    query = update.callback_query
    await query.answer()

    lang_code = query.data.replace("lang_", "")
    user_languages[query.from_user.id] = lang_code

    messages = {
        "en": "🏙 Please enter city or village name.",
        "hi": "🏙 कृपया शहर या गांव का नाम दर्ज करें।",
        "gu": "🏙 કૃપા કરીને શહેર અથવા ગામનું નામ લખો.",
        "ta": "🏙 நகரம் அல்லது கிராமத்தின் பெயரை உள்ளிடவும்.",
        "kn": "🏙 ನಗರ ಅಥವಾ ಗ್ರಾಮದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
        "bn": "🏙 শহর বা গ্রামের নাম লিখুন।",
        "te": "🏙 నగరం లేదా గ్రామం పేరు నమోదు చేయండి.",
        "ml": "🏙 നഗരം അല്ലെങ്കിൽ ഗ്രാമത്തിന്റെ പേര് നൽകുക.",
        "pa": "🏙 ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਹਿਰ ਜਾਂ ਪਿੰਡ ਦਾ ਨਾਮ ਦਰਜ ਕਰੋ।"
    }

    await query.edit_message_text(messages.get(lang_code, messages["en"]))


# Handle city input
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):

    user_id = update.effective_user.id

    if user_id not in user_languages:
        await update.message.reply_text("⚠ Please use /start first and select a language.")
        return

    city = update.message.text.strip()

    if len(city) < 2:
        await update.message.reply_text("❌ Please enter valid city name.")
        return

    # Fake AQI data (demo)
    aqi = random.randint(40, 350)

    if aqi <= 50:
        category = "Good"
        advice = "Outdoor activities are safe."
    elif aqi <= 100:
        category = "Satisfactory"
        advice = "Normal outdoor activities allowed."
    elif aqi <= 200:
        category = "Moderate"
        advice = "Sensitive people should wear a mask."
    elif aqi <= 300:
        category = "Poor"
        advice = "Wear an N95 mask outdoors."
    else:
        category = "Very Poor"
        advice = "Avoid outdoor activities."

    pm25 = random.randint(15, 150)
    no2 = random.randint(5, 80)
    so2 = random.randint(2, 25)

    hcho = random.choice(["Normal", "Moderate", "High"])
    fire = random.choice(["Low", "Moderate", "Significant"])

    tomorrow_aqi = aqi + random.randint(-15, 30)
    trend = "Increasing" if tomorrow_aqi > aqi else "Decreasing"

    lang = user_languages[user_id]

    # RESPONSE
    if lang == "gu":
        response = f"""
📍 સ્થાન: {city}

🌫 AQI: {aqi}
📊 શ્રેણી: {category}

💨 PM2.5: {pm25}
🌬 NO₂: {no2}
☁ SO₂: {so2}

🧪 HCHO: {hcho}
🔥 આગની અસર: {fire}

📈 AI આગાહી:
આવતીકાલનું AQI: {tomorrow_aqi}
ટ્રેન્ડ: {trend}

💡 આરોગ્ય સલાહ:
{advice}
"""

    elif lang == "hi":
        response = f"""
📍 स्थान: {city}

🌫 AQI: {aqi}
📊 श्रेणी: {category}

💨 PM2.5: {pm25}
🌬 NO₂: {no2}
☁ SO₂: {so2}

🧪 HCHO: {hcho}
🔥 आग का प्रभाव: {fire}

📈 AI पूर्वानुमान:
कल का AQI: {tomorrow_aqi}
ट्रेंड: {trend}

💡 स्वास्थ्य सलाह:
{advice}
"""

    else:
        response = f"""
📍 Location: {city}

🌫 AQI: {aqi}
📊 Category: {category}

💨 PM2.5: {pm25}
🌬 NO₂: {no2}
☁ SO₂: {so2}

🧪 HCHO: {hcho}
🔥 Fire Impact: {fire}

📈 AI Prediction:
Tomorrow AQI: {tomorrow_aqi}
Trend: {trend}

💡 Health Advice:
{advice}
"""

    await update.message.reply_text(response)


# MAIN
def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(language_selected, pattern="^lang_"))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    print("🚀 AQI Telegram Bot Running...")
    app.run_polling()


if __name__ == "__main__":
    main()