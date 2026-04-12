from database import Database

print("🔄 Підключення до бази даних...")
db = Database()

# 1. Жорстке видалення старої таблиці (SQLite не підтримує CASCADE)
with db.connection:
    db.cursor.execute("DROP TABLE IF EXISTS missions;")
    print("🗑 Стару таблицю missions видалено.")

# 2. Створення нової чистої таблиці
db.create_tables()
print("✅ Таблиці оновлено.")

# 3. Список місій
# (Назва, Опис, Складність, Нагорода, Планета, is_Boss, ВАРТІСТЬ, РЕСУРС_НАЗВА, РЕСУРС_КІЛЬКІСТЬ, ЧАС_ХВ, РИЗИК_%, req_stat_type, req_stat_value)
missions_data = [
    # --- EARTH (Земля) --- вимоги 10-50
    ("Тестовий пуск", "Перевірка систем", 1, 300, "Earth", False, 50, None, 0, 1, 5, "speed", 20),
    ("GPS Супутник", "Виведення вантажу", 2, 600, "Earth", False, 100, "res_iron", 50, 5, 10, "aerodynamics", 15),
    ("Орбітальний телескоп", "Дослідження глибокого космосу", 3, 1000, "Earth", False, 200, "res_iron", 100, 8, 15, "handling", 25),
    ("Перехоплення астероїда", "Орбітальна місія швидкого реагування", 3, 1300, "Earth", False, 300, "res_fuel", 150, 6, 20, "speed", 40),
    ("Доставка екіпажу на МКС", "Транспортний рейс", 4, 1500, "Earth", False, 400, "res_fuel", 200, 12, 10, "armor", 50),
    ("Політ на Місяць", "BOSS: Прорив атмосфери", 5, 2000, "Earth", True, 1000, "res_fuel", 300, 15, 20, "speed", 60),

    # --- MOON (Місяць) --- вимоги 50-150
    ("Розвідка кратера", "Пошук льоду", 4, 1200, "Moon", False, 400, "res_iron", 200, 10, 25, "handling", 50),
    ("Ремонт сонячних панелей", "Технічне обслуговування", 5, 1800, "Moon", False, 600, "res_iron", 300, 15, 20, "armor", 70),
    ("Дослідження темного боку", "Секретна картографічна місія", 6, 2500, "Moon", False, 800, "res_regolith", 100, 20, 35, "aerodynamics", 90),
    ("Будівництво місячної бази", "Закладка фундаменту колонії", 7, 3200, "Moon", False, 1200, "res_regolith", 300, 25, 30, "handling", 110),
    ("Курс на Марс", "BOSS: Довгий переліт", 8, 4000, "Moon", True, 2500, "res_he3", 500, 30, 40, "armor", 150),

    # --- MARS (Марс) --- вимоги 200-500
    ("Пошук життя", "Аналіз ґрунту", 7, 3000, "Mars", False, 800, "res_fuel", 600, 25, 50, "handling", 200),
    ("Видобуток льоду", "Комерційний збір ресурсів", 8, 3800, "Mars", False, 1000, "res_silicon", 200, 28, 45, "armor", 250),
    ("Порятунок марсохода", "Екстрена ремонтна місія у бурю", 9, 4200, "Mars", False, 1100, "res_silicon", 250, 35, 60, "handling", 300),
    ("Захист колонії", "Відбиття піратів", 8, 4500, "Mars", False, 1200, "res_silicon", 300, 30, 55, "damage", 100),
    ("Політ на Юпітер", "BOSS: Гравітаційний стрибок", 10, 8000, "Mars", True, 5000, "res_oxide", 1000, 50, 70, "speed", 400),

    # --- JUPITER (Юпітер) --- вимоги 500-2000
    ("Зонд у шторм", "Занурення в газ", 12, 10000, "Jupiter", False, 2000, "res_fuel", 2000, 45, 85, "armor", 1200),
    ("Вивчення супутника Європа", "Пробурювання криги", 14, 15000, "Jupiter", False, 4000, "res_hydrogen", 1000, 55, 75, "handling", 800),
    ("Орбітальна станція Каллісто", "Побудова спостережного пункту", 16, 22000, "Jupiter", False, 6000, "res_hydrogen", 2000, 70, 80, "aerodynamics", 1000),
    ("Проліт крізь Червону Пляму", "Екстремальне наукове занурення", 18, 30000, "Jupiter", False, 8000, "res_helium", 2500, 85, 90, "armor", 1400),
    ("Варп-двигун", "WIN: Квантовий стрибок", 20, 50000, "Jupiter", True, 20000, "res_helium", 5000, 60, 95, "speed", 1500),
]

# 4. Завантаження в базу
count = 0
for m in missions_data:
    try:
        # SQLite uses ? instead of %s
        db.cursor.execute("""
            INSERT INTO missions (
                name, description, difficulty, reward, planet, is_boss_mission, 
                cost_money, req_res_name, req_res_amount, flight_time, pirate_risk,
                req_stat_type, req_stat_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, m)
        count += 1
    except Exception as e:
        print(f"❌ Помилка: {e}")

db.connection.commit()
print(f"🎉 Успішно додано {count} місій!")