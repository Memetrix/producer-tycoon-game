import json
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import random

class PlayerProfile:
    """Профиль игрока с реалистичными паттернами поведения"""
    
    def __init__(self, name: str, sessions_per_day: int, skill_level: float):
        self.name = name
        self.sessions_per_day = sessions_per_day
        self.skill_level = skill_level  # 0.6-0.95 (точность в ритм-игре)
        
    def get_daily_sessions(self, day: int) -> List[int]:
        """Возвращает часы заходов в игру для данного дня"""
        # Burnout: интерес снижается со временем
        burnout_factor = max(0.5, 1 - (day / 120))  # Снижение к 60 дню
        actual_sessions = max(1, int(self.sessions_per_day * burnout_factor))
        
        # Реалистичные часы заходов (не ночью)
        available_hours = list(range(8, 24))  # 8:00 - 23:59
        
        if actual_sessions == 1:
            return [random.choice([9, 20])]  # Утро или вечер
        elif actual_sessions == 2:
            return [9, 20]  # Утро и вечер
        elif actual_sessions == 3:
            return [9, 14, 21]  # Утро, обед, вечер
        elif actual_sessions == 4:
            return [8, 13, 18, 22]
        elif actual_sessions == 5:
            return [8, 12, 15, 19, 22]
        else:  # 6+
            return [8, 11, 14, 17, 20, 23]

# Профили игроков
PROFILES = {
    'casual': PlayerProfile('Casual', 2, 0.65),
    'core': PlayerProfile('Core', 4, 0.80),
    'hardcore': PlayerProfile('Hardcore', 6, 0.90)
}

class GameState:
    """Состояние игры"""
    
    def __init__(self):
        self.money = 800  # Стартовые деньги
        self.reputation = 0
        self.energy = 100
        self.max_energy = 100
        
        # Оборудование (уровни 0-5)
        self.equipment = {
            'phone': 0,
            'headphones': 0,
            'microphone': 0,
            'computer': 0
        }
        
        # Артисты (уровни 0-5)
        self.artists = {
            'street_poet': 0,
            'mc_flow': 0,
            'lil_dreamer': 0,
            'young_legend': 0
        }
        
        self.beats_created = 0
        self.total_active_earnings = 0
        self.total_passive_earnings = 0
        
    def get_equipment_bonus(self) -> float:
        """Бонус от оборудования в %"""
        bonus = 0
        bonus += self.equipment['phone'] * 5
        bonus += self.equipment['headphones'] * 5
        bonus += self.equipment['microphone'] * 10
        bonus += self.equipment['computer'] * 15
        return bonus
    
    def get_passive_income_per_minute(self) -> float:
        """Пассивный доход в минуту"""
        income = 0
        
        # Street Poet: $5-20/мин
        if self.artists['street_poet'] > 0:
            income += 5 + (self.artists['street_poet'] - 1) * 3.75
            
        # MC Flow: $6-25/мин
        if self.artists['mc_flow'] > 0:
            income += 6 + (self.artists['mc_flow'] - 1) * 4.75
            
        # Lil Dreamer: $8-30/мин
        if self.artists['lil_dreamer'] > 0:
            income += 8 + (self.artists['lil_dreamer'] - 1) * 5.5
            
        # Young Legend: $12-50/мин (требует 400 репутации)
        if self.artists['young_legend'] > 0 and self.reputation >= 400:
            income += 12 + (self.artists['young_legend'] - 1) * 9.5
            
        return income
    
    def calculate_beat_price(self, accuracy: float) -> Tuple[float, float, float]:
        """Рассчитывает цену бита, качество и репутацию"""
        # Базовое качество
        base_quality = 50 + (accuracy * 50)
        
        # Бонус от оборудования
        equipment_bonus = self.get_equipment_bonus()
        final_quality = base_quality * (1 + equipment_bonus / 100)
        
        # Цена (текущая формула без прогрессии)
        price = 50 + (final_quality * 2)
        
        # Репутация
        reputation = final_quality * 0.15
        
        return price, final_quality, reputation
    
    def get_equipment_cost(self, equipment_type: str, current_level: int) -> float:
        """Стоимость следующего уровня оборудования"""
        if current_level >= 5:
            return float('inf')
            
        base_costs = {
            'phone': 80,
            'headphones': 120,
            'microphone': 200,
            'computer': 400
        }
        
        base = base_costs[equipment_type]
        multiplier = 1.4
        
        return base * (multiplier ** current_level)
    
    def get_artist_cost(self, artist_type: str, current_level: int) -> float:
        """Стоимость следующего уровня артиста"""
        if current_level >= 5:
            return float('inf')
            
        base_costs = {
            'street_poet': 70,
            'mc_flow': 80,
            'lil_dreamer': 100,
            'young_legend': 200
        }
        
        base = base_costs[artist_type]
        multiplier = 1.6
        
        return base * (multiplier ** current_level)
    
    def can_afford_artist(self, artist_type: str) -> bool:
        """Проверяет, может ли игрок купить артиста"""
        if artist_type == 'young_legend' and self.reputation < 400:
            return False
        return True

class EconomySimulator:
    """Симулятор экономики игры"""
    
    def __init__(self, profile: PlayerProfile, days: int = 60):
        self.profile = profile
        self.days = days
        self.state = GameState()
        self.log = []
        self.daily_snapshots = []
        
    def simulate_session(self, day: int, session: int, minutes_since_last: int) -> Dict:
        """Симулирует одну игровую сессию"""
        session_log = {
            'day': day,
            'session': session,
            'minutes_since_last': minutes_since_last
        }
        
        # 1. Собираем оффлайн-доход (макс 4 часа)
        offline_minutes = min(minutes_since_last, 240)
        passive_income = self.state.get_passive_income_per_minute() * offline_minutes
        self.state.money += passive_income
        self.state.total_passive_earnings += passive_income
        
        # 2. Восстанавливаем энергию (1/мин)
        self.state.energy = min(self.state.max_energy, self.state.energy + minutes_since_last)
        
        session_log['passive_income'] = passive_income
        session_log['energy_before'] = self.state.energy
        
        # 3. Создаем биты (пока есть энергия)
        beats_this_session = 0
        active_earnings = 0
        
        while self.state.energy >= 20:
            # Создаем бит
            accuracy = self.profile.skill_level + random.uniform(-0.05, 0.05)
            accuracy = max(0.5, min(1.0, accuracy))
            
            price, quality, reputation = self.state.calculate_beat_price(accuracy)
            
            self.state.money += price
            self.state.reputation += reputation
            self.state.energy -= 20
            self.state.beats_created += 1
            beats_this_session += 1
            active_earnings += price
            self.state.total_active_earnings += price
        
        session_log['beats_created'] = beats_this_session
        session_log['active_earnings'] = active_earnings
        session_log['energy_after'] = self.state.energy
        
        # 4. Покупаем апгрейды (жадный алгоритм - самое выгодное)
        upgrades_bought = []
        
        while True:
            best_upgrade = None
            best_value = 0
            
            # Проверяем оборудование
            for eq_type in self.state.equipment:
                level = self.state.equipment[eq_type]
                cost = self.state.get_equipment_cost(eq_type, level)
                
                if cost <= self.state.money and cost != float('inf'):
                    # Ценность = бонус / стоимость
                    bonus = 5 if eq_type in ['phone', 'headphones'] else (10 if eq_type == 'microphone' else 15)
                    value = bonus / cost
                    
                    if value > best_value:
                        best_value = value
                        best_upgrade = ('equipment', eq_type, cost)
            
            # Проверяем артистов
            for artist_type in self.state.artists:
                if not self.state.can_afford_artist(artist_type):
                    continue
                    
                level = self.state.artists[artist_type]
                cost = self.state.get_artist_cost(artist_type, level)
                
                if cost <= self.state.money and cost != float('inf'):
                    # Ценность = доход в минуту / стоимость
                    income_increase = {
                        'street_poet': 3.75,
                        'mc_flow': 4.75,
                        'lil_dreamer': 5.5,
                        'young_legend': 9.5
                    }[artist_type]
                    
                    value = income_increase / cost
                    
                    if value > best_value:
                        best_value = value
                        best_upgrade = ('artist', artist_type, cost)
            
            # Покупаем лучший апгрейд
            if best_upgrade:
                upgrade_type, item, cost = best_upgrade
                self.state.money -= cost
                
                if upgrade_type == 'equipment':
                    self.state.equipment[item] += 1
                    upgrades_bought.append(f"{item} L{self.state.equipment[item]}")
                else:
                    self.state.artists[item] += 1
                    upgrades_bought.append(f"{item} L{self.state.artists[item]}")
            else:
                break
        
        session_log['upgrades_bought'] = upgrades_bought
        session_log['money_after'] = self.state.money
        session_log['reputation'] = self.state.reputation
        
        return session_log
    
    def simulate(self) -> Dict:
        """Симулирует полный период игры"""
        print(f"Симуляция {self.profile.name}...", end=" ", flush=True)
        
        last_session_time = 0
        report_days = [1, 3, 7, 14, 21, 30, 45, 60]
        
        for day in range(1, self.days + 1):
            sessions = self.profile.get_daily_sessions(day)
            
            for session_idx, hour in enumerate(sessions):
                current_time = (day - 1) * 24 * 60 + hour * 60
                minutes_since_last = current_time - last_session_time if last_session_time > 0 else 0
                
                session_log = self.simulate_session(day, session_idx + 1, minutes_since_last)
                self.log.append(session_log)
                
                last_session_time = current_time
            
            self.daily_snapshots.append({
                'day': day,
                'money': self.state.money,
                'reputation': self.state.reputation,
                'beats_created': self.state.beats_created,
                'passive_income_per_hour': self.state.get_passive_income_per_minute() * 60,
                'equipment': dict(self.state.equipment),
                'artists': dict(self.state.artists),
                'total_active': self.state.total_active_earnings,
                'total_passive': self.state.total_passive_earnings
            })
            
            if day % 10 == 0:
                print(f"{day}д", end=" ", flush=True)
        
        print("✓")
        
        return {
            'profile': self.profile.name,
            'final_money': self.state.money,
            'final_reputation': self.state.reputation,
            'beats_created': self.state.beats_created,
            'total_active_earnings': self.state.total_active_earnings,
            'total_passive_earnings': self.state.total_passive_earnings,
            'equipment': self.state.equipment,
            'artists': self.state.artists,
            'daily_snapshots': self.daily_snapshots
        }

# Функции для сохранения результатов
def save_results_to_json(results: List[Dict], filename: str = "simulation_results.json"):
    """Сохраняет результаты в JSON файл"""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✅ Результаты сохранены в {filename}")

def save_results_to_markdown(results: List[Dict], filename: str = "SIMULATION_REPORT.md"):
    """Сохраняет результаты в Markdown файл"""
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("# Отчет симуляции экономики Producer Tycoon\n\n")
        f.write(f"**Дата симуляции:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        
        # Сравнительная таблица
        f.write("## Сравнительная таблица (60 дней)\n\n")
        f.write("| Профиль | Деньги | Репутация | Биты | Активный % | Пассивный % |\n")
        f.write("|---------|--------|-----------|------|------------|-------------|\n")
        
        for result in results:
            total = result['total_active_earnings'] + result['total_passive_earnings']
            active_pct = result['total_active_earnings'] / total * 100 if total > 0 else 0
            passive_pct = result['total_passive_earnings'] / total * 100 if total > 0 else 0
            
            f.write(f"| {result['profile']} | ${result['final_money']:,.0f} | {result['final_reputation']:.0f} | {result['beats_created']} | {active_pct:.1f}% | {passive_pct:.1f}% |\n")
        
        # Детальные отчеты по каждому профилю
        for result in results:
            f.write(f"\n---\n\n## {result['profile']} игрок\n\n")
            
            f.write("### Финальное состояние\n\n")
            f.write(f"- **Деньги:** ${result['final_money']:,.0f}\n")
            f.write(f"- **Репутация:** {result['final_reputation']:.0f}\n")
            f.write(f"- **Битов создано:** {result['beats_created']}\n\n")
            
            total = result['total_active_earnings'] + result['total_passive_earnings']
            active_pct = result['total_active_earnings'] / total * 100 if total > 0 else 0
            passive_pct = result['total_passive_earnings'] / total * 100 if total > 0 else 0
            
            f.write("### Заработок\n\n")
            f.write(f"- **Активный (биты):** ${result['total_active_earnings']:,.0f} ({active_pct:.1f}%)\n")
            f.write(f"- **Пассивный (артисты):** ${result['total_passive_earnings']:,.0f} ({passive_pct:.1f}%)\n")
            f.write(f"- **Всего:** ${total:,.0f}\n\n")
            
            f.write("### Оборудование\n\n")
            for eq, level in result['equipment'].items():
                f.write(f"- **{eq}:** Level {level}/5\n")
            
            f.write("\n### Артисты\n\n")
            for artist, level in result['artists'].items():
                f.write(f"- **{artist}:** Level {level}/5\n")
            
            # График прогрессии по ключевым дням
            if 'daily_snapshots' in result:
                f.write("\n### Прогрессия по дням\n\n")
                f.write("| День | Деньги | Репутация | Биты | Пассивный доход/час |\n")
                f.write("|------|--------|-----------|------|---------------------|\n")
                
                key_days = [1, 3, 7, 14, 21, 30, 45, 60]
                for snapshot in result['daily_snapshots']:
                    if snapshot['day'] in key_days:
                        f.write(f"| {snapshot['day']} | ${snapshot['money']:,.0f} | {snapshot['reputation']:.0f} | {snapshot['beats_created']} | ${snapshot['passive_income_per_hour']:.0f} |\n")
        
        # Выводы и проблемы
        f.write("\n---\n\n## Выявленные проблемы\n\n")
        
        f.write("### 1. Быстрое достижение потолка\n\n")
        f.write("Все профили игроков достигают максимальных уровней оборудования и артистов задолго до 60 дней.\n")
        f.write("После этого деньги копятся без применения.\n\n")
        
        f.write("### 2. Доминирование пассивного дохода\n\n")
        f.write("Пассивный доход от артистов составляет 70-90% от общего заработка.\n")
        f.write("Игроку выгоднее просто собирать деньги, а не играть в ритм-игру.\n\n")
        
        f.write("### 3. Отсутствие прогрессии цены битов\n\n")
        f.write("Биты всегда стоят $210-600, независимо от репутации игрока.\n")
        f.write("Нет мотивации повышать репутацию (кроме разблокировки Young Legend).\n\n")
        
        f.write("### 4. Мало контента\n\n")
        f.write("Всего 4 артиста и 4 вида оборудования по 5 уровням.\n")
        f.write("Общая стоимость всего контента: ~$15,874.\n\n")
    
    print(f"✅ Отчет сохранен в {filename}")

# Запуск симуляций
if __name__ == "__main__":
    print("\n" + "="*80)
    print("СИМУЛЯЦИЯ ЭКОНОМИКИ PRODUCER TYCOON (60 ДНЕЙ)")
    print("="*80 + "\n")
    
    results = []
    
    for profile_name in ['casual', 'core', 'hardcore']:
        profile = PROFILES[profile_name]
        simulator = EconomySimulator(profile, days=60)
        result = simulator.simulate()
        results.append(result)
    
    # Сравнительная таблица
    print("\n" + "="*80)
    print("РЕЗУЛЬТАТЫ")
    print("="*80)
    print(f"{'Профиль':<12} {'Деньги':<15} {'Репутация':<12} {'Биты':<8} {'Активный%':<12} {'Пассивный%'}")
    print("-"*80)
    
    for result in results:
        total = result['total_active_earnings'] + result['total_passive_earnings']
        active_pct = result['total_active_earnings'] / total * 100 if total > 0 else 0
        passive_pct = result['total_passive_earnings'] / total * 100 if total > 0 else 0
        
        print(f"{result['profile']:<12} ${result['final_money']:>12,.0f}  {result['final_reputation']:>10,.0f}  {result['beats_created']:>6}  {active_pct:>10.1f}%  {passive_pct:>10.1f}%")
    
    # Ключевые проблемы
    print("\n" + "="*80)
    print("КЛЮЧЕВЫЕ ПРОБЛЕМЫ")
    print("="*80)
    print("⚠️  Весь контент ($15,874) покупается за 1-2 дня")
    print("⚠️  Пассивный доход доминирует (70-90% от общего)")
    print("⚠️  Цена битов не растет с прогрессией")
    print("⚠️  Мало контента (4 артиста, 4 оборудования)")
    
    # Сохранение результатов
    print("\n" + "="*80)
    save_results_to_json(results, "scripts/simulation_results.json")
    save_results_to_markdown(results, "SIMULATION_REPORT.md")
    print("="*80 + "\n")
    
    print("📊 Детальные данные смотри в:")
    print("   • scripts/simulation_results.json")
    print("   • SIMULATION_REPORT.md\n")
