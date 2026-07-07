from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ContextTypes,
    filters
)
import asyncio
import pandas as pd
import os

# ==========================
# BOT TOKEN
# ==========================

TOKEN = os.getenv("TOKEN")

# ==========================
# BOT TOKEN
# ==========================


# ==========================
# LOAD DATASET
# ==========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

CSV_PATH = os.path.join(
    BASE_DIR,
    "master_dataset.csv"
)

try:
    df = pd.read_csv(CSV_PATH)
    df["city"] = df["city"].str.lower().str.strip()
    print("✅ Dataset Loaded Successfully")
except Exception as e:
    print("❌ Dataset Error:", e)
    df = pd.DataFrame()

# ==========================
# USER LANGUAGE
# ==========================

user_languages = {}

# ==========================
# START COMMAND
# ==========================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    args = context.args

    if args and args[0] == "website":
        title = (
            "🌍 Welcome from AeroSentinel Website\n\n"
            "Please select your language."
        )
    else:
        title = (
            "🌍 Welcome to AQI Mitra\n\n"
            "Please select your language."
        )

    keyboard = [

        [
            InlineKeyboardButton(
                "English",
                callback_data="lang_en"
            ),

            InlineKeyboardButton(
                "ગુજરાતી",
                callback_data="lang_gu"
            )
        ],

        [
            InlineKeyboardButton(
                "हिन्दी",
                callback_data="lang_hi"
            )
        ]

    ]

    await update.message.reply_text(
        title,
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
    # ==========================
# LANGUAGE SELECT
# ==========================

async def language_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):

    query = update.callback_query
    await query.answer()

    lang = query.data.replace("lang_", "")

    user_languages[query.from_user.id] = lang

    messages = {
        "en": "🏙 Please enter city name.",
        "gu": "🏙 કૃપા કરીને શહેરનું નામ લખો.",
        "hi": "🏙 कृपया शहर का नाम लिखें।"
    }

    await query.edit_message_text(
        messages.get(lang, messages["en"])
    )


# ==========================
# FIND CITY
# ==========================

def get_city_data(city):

    if df.empty:
        return None

    city = city.lower().strip()

    rows = df[df["city"] == city]

    if rows.empty:
        return None

    return rows.iloc[-1]


# ==========================
# AQI CATEGORY
# ==========================

def get_aqi_category(aqi):

    if aqi <= 50:
        return (
            "Good",
            "Outdoor activities are safe."
        )

    elif aqi <= 100:
        return (
            "Satisfactory",
            "Normal outdoor activities."
        )

    elif aqi <= 200:
        return (
            "Moderate",
            "Sensitive people should wear a mask."
        )

    elif aqi <= 300:
        return (
            "Poor",
            "Wear an N95 mask."
        )

    elif aqi <= 400:
        return (
            "Very Poor",
            "Avoid outdoor activities."
        )

    else:
        return (
            "Severe",
            "Stay indoors."
        )
        # ==========================
# HANDLE USER MESSAGE
# ==========================

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):

    user_id = update.effective_user.id

    if user_id not in user_languages:
        await update.message.reply_text(
            "⚠ Please use /start first."
        )
        return

    city = update.message.text.strip()

    data = get_city_data(city)

    if data is None:
        await update.message.reply_text(
            f"❌ City '{city}' not found in dataset."
        )
        return

    aqi = int(data["aqi"])

    category, advice = get_aqi_category(aqi)

    lang = user_languages[user_id]

    response = f"""
📍 Location: {city.title()}

🌫 AQI: {aqi}
📊 Category: {category}

💨 PM2.5: {data['pm25']}
🌪 PM10: {data['pm10']}
🌬 NO₂: {data['no2']}
☁ SO₂: {data['so2']}
🟤 CO: {data['co']}
🔵 O₃: {data['o3']}

🧪 HCHO: {data['hcho']}
🌫 AOD: {data['aod']}
🔥 Fire Count: {data['fire_count']}

🌡 Temperature: {data['temp']}°C
💧 Humidity: {data['humidity']}%
💨 Wind Speed: {data['wind_speed']} m/s

💡 Health Advice:
{advice}
"""

    if lang == "gu":

        response = f"""
📍 સ્થાન: {city.title()}

🌫 AQI: {aqi}
📊 શ્રેણી: {category}

💨 PM2.5: {data['pm25']}
🌪 PM10: {data['pm10']}
🌬 NO₂: {data['no2']}
☁ SO₂: {data['so2']}
🟤 CO: {data['co']}
🔵 O₃: {data['o3']}

🧪 HCHO: {data['hcho']}
🌫 AOD: {data['aod']}
🔥 Fire Count: {data['fire_count']}

🌡 તાપમાન: {data['temp']}°C
💧 ભેજ: {data['humidity']}%
💨 પવન: {data['wind_speed']} m/s

💡 આરોગ્ય સલાહ:
{advice}
"""

    elif lang == "hi":

        response = f"""
📍 स्थान: {city.title()}

🌫 AQI: {aqi}
📊 श्रेणी: {category}

💨 PM2.5: {data['pm25']}
🌪 PM10: {data['pm10']}
🌬 NO₂: {data['no2']}
☁ SO₂: {data['so2']}
🟤 CO: {data['co']}
🔵 O₃: {data['o3']}

🧪 HCHO: {data['hcho']}
🌫 AOD: {data['aod']}
🔥 Fire Count: {data['fire_count']}

🌡 तापमान: {data['temp']}°C
💧 आर्द्रता: {data['humidity']}%
💨 हवा: {data['wind_speed']} m/s

💡 स्वास्थ्य सलाह:
{advice}
"""

    await update.message.reply_text(response)
    # ==========================
# MAIN FUNCTION
# ==========================

def main():

    app = Application.builder().token(TOKEN).build()

    # Commands
    app.add_handler(CommandHandler("start", start))

    # Language button callback
    app.add_handler(
        CallbackQueryHandler(
            language_selected,
            pattern="^lang_"
        )
    )

    # Handle city name messages
    app.add_handler(
        MessageHandler(
            filters.TEXT & ~filters.COMMAND,
            handle_message
        )
    )

    print("🚀 AQI Mitra Bot Started Successfully...")

    app.run_polling()


if __name__ == "__main__":
    asyncio.set_event_loop(asyncio.new_event_loop())
    main()